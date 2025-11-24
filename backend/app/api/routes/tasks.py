import uuid
from fastapi import APIRouter, HTTPException, Depends
from celery.result import AsyncResult

from app.tasks.agent_tasks import generate_plan_task
from app.schemas.plan import PlanRequest, PlanTaskResponse
from app.services.profile_service import ProfileService
from app.schemas.plan import WeeklyPlan, ClinicalReport
from app.core.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.agents.registry import AgentRegistry
from app.agents.orchestrator import OrchestratorAgent
from app.agents.nutrition_plan_agent import NutritionPlanAgent
from app.agents.clinical_safety_agent import ClinicalSafetyAgent
from app.agents.meal_log_agent import MealLogAgent
from app.agents.base_agent import AgentConfig

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/plan", response_model=PlanTaskResponse)
async def enqueue_plan(
    request: PlanRequest,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user),
) -> PlanTaskResponse:
    """Enqueue plan generation via Celery worker."""
    correlation_id = request.correlation_id or str(uuid.uuid4())
    payload = request.model_copy(update={"correlation_id": correlation_id}).model_dump()
    task = generate_plan_task.delay(payload)
    return PlanTaskResponse(task_id=task.id, correlation_id=correlation_id)


@router.get("/plan/{task_id}", response_model=PlanTaskResponse)
async def plan_status(task_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> PlanTaskResponse:
    """Check status of a plan generation task."""
    result = AsyncResult(task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if result.successful():
        data = result.result or {}
        return PlanTaskResponse.model_validate(data)
    return PlanTaskResponse(task_id=task_id, status=result.status.lower())
