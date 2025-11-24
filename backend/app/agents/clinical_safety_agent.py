from typing import Any, Dict

from app.agents.base_agent import AgentConfig, BaseAgent
from app.services import gemini
from app.schemas.plan import PlanRequest, WeeklyPlan


class ClinicalSafetyAgent(BaseAgent[Dict[str, Any]]):
    """Agent that validates a plan for clinical safety via Gemini report."""

    async def process(self, input_data: Dict[str, Any]) -> Any:
        profile = input_data.get("profile")
        plan_data = input_data.get("plan")
        if not plan_data:
            raise RuntimeError("No plan provided for safety check")
        plan = WeeklyPlan.model_validate(plan_data)
        request = PlanRequest.model_validate({"profile": profile})
        report = gemini.generate_clinical_report(request, plan)
        if not report:
            raise RuntimeError("Failed to generate clinical report")
        return report
