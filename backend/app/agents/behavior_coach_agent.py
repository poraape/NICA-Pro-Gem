from typing import Any, Dict

from app.agents.base_agent import AgentConfig, BaseAgent


class BehaviorCoachAgent(BaseAgent[Dict[str, Any]]):
    """Agent that provides adherence tips (placeholder)."""

    async def process(self, input_data: Dict[str, Any]) -> Any:
        return {"insights": ["Stay hydrated", "Sleep 7-8 hours"], "profile": input_data.get("profile")}
