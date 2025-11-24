from typing import Any, Dict

from app.agents.base_agent import AgentConfig, BaseAgent
from app.services import gemini
from app.schemas.plan import PlanRequest, WeeklyPlan


class NutritionPlanAgent(BaseAgent[Dict[str, Any]]):
    """Agent that generates a weekly nutrition plan using Gemini."""

    async def process(self, input_data: Dict[str, Any]) -> Any:
        request = PlanRequest.model_validate({"profile": input_data.get("profile")})
        plan = gemini.generate_weekly_plan(request)
        if not plan:
            raise RuntimeError("Failed to generate plan")
        return plan
