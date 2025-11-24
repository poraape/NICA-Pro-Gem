from typing import Any, Dict

from app.agents.base_agent import AgentConfig, BaseAgent


class MealLogAgent(BaseAgent[Dict[str, Any]]):
    """Agent that records meal logs. Placeholder for future parsing."""

    async def process(self, input_data: Dict[str, Any]) -> Any:
        return {"status": "logged", "entry": input_data.get("entry")}
