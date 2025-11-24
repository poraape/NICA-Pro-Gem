import time
import uuid
import asyncio

import orjson
from redis import Redis

from app.core.celery_app import celery_app
from app.core.config import settings
from app.schemas.plan import PlanRequest, PlanTaskResponse
from app.services import gemini
from app.agents.registry import AgentRegistry
from app.agents.orchestrator import OrchestratorAgent
from app.agents.nutrition_plan_agent import NutritionPlanAgent
from app.agents.clinical_safety_agent import ClinicalSafetyAgent
from app.agents.behavior_coach_agent import BehaviorCoachAgent
from app.agents.base_agent import AgentConfig
from app.core.database import AsyncSessionLocal
from app.services.profile_service import ProfileService


STREAM_KEY = "agent:events"
redis_client = Redis.from_url(settings.redis_url)


def _publish_event(event: dict) -> None:
    """Publish structured event JSON into Redis Streams."""
    redis_client.xadd(STREAM_KEY, {"json": orjson.dumps(event)})


async def _persist_results(profile_id: str, weekly_plan, clinical_report) -> None:
    async with AsyncSessionLocal() as session:
        service = ProfileService(session)
        if weekly_plan:
            await service.add_plan(profile_id, weekly_plan)
        if clinical_report:
            await service.add_report(profile_id, clinical_report)


async def _process_generation(request: PlanRequest, correlation_id: str) -> dict:
    registry = AgentRegistry()
    registry.register(NutritionPlanAgent(AgentConfig(name="nutrition_plan", description="Generate plan")))
    registry.register(ClinicalSafetyAgent(AgentConfig(name="clinical_safety", description="Safety check")))
    registry.register(BehaviorCoachAgent(AgentConfig(name="behavior_coach", description="Adherence tips")))
    orchestrator = OrchestratorAgent(AgentConfig(name="orchestrator", description="Workflow orchestrator"), registry)

    _publish_event(
        {
            "type": "plan",
            "event": "started",
            "correlation_id": correlation_id,
            "profile_id": request.profile.id,
            "timestamp": time.time(),
        }
    )

    # Simple orchestration: nutrition_plan -> clinical_safety -> behavior_coach
    weekly_plan = gemini.generate_weekly_plan(request)
    clinical_report = gemini.generate_clinical_report(request, weekly_plan) if weekly_plan else None
    orchestration_input = {
        "profile": request.profile.model_dump(),
        "plan": weekly_plan.model_dump() if weekly_plan else {},
    }
    await orchestrator.process(orchestration_input)
    await _persist_results(request.profile.id, weekly_plan, clinical_report)

    result = PlanTaskResponse(
        task_id=correlation_id,
        correlation_id=correlation_id,
        status="success",
        plan=weekly_plan,
        clinical_report=clinical_report,
    ).model_dump()

    _publish_event(
        {
            "type": "plan",
            "event": "completed",
            "correlation_id": correlation_id,
            "profile_id": request.profile.id,
            "has_plan": bool(weekly_plan),
            "has_report": bool(clinical_report),
            "payload": result,
            "timestamp": time.time(),
        }
    )

    return result


@celery_app.task(name="agent.generate_plan")
def generate_plan_task(payload: dict) -> dict:
    """Generate weekly plan + clinical report using Gemini and emit events."""
    request = PlanRequest.model_validate(payload)
    correlation_id = request.correlation_id or str(uuid.uuid4())
    return asyncio.run(_process_generation(request, correlation_id))
