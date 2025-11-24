from typing import Dict, Optional

from app.agents.base_agent import BaseAgent


class AgentRegistry:
    """Registry for discovering and retrieving agents by name."""

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent) -> None:
        self._agents[agent.config.name] = agent

    def get(self, name: str) -> Optional[BaseAgent]:
        return self._agents.get(name)

    def list(self) -> Dict[str, BaseAgent]:
        return dict(self._agents)
