import pytest

from app.agents.base_agent import AgentConfig
from app.agents.registry import AgentRegistry
from app.agents.orchestrator import OrchestratorAgent
from app.agents.nutrition_plan_agent import NutritionPlanAgent
from app.agents.clinical_safety_agent import ClinicalSafetyAgent
from app.agents.behavior_coach_agent import BehaviorCoachAgent


class DummyAgent:
    def __init__(self, name: str, output):
        self.config = AgentConfig(name=name, description=name)
        self.output = output

    async def run(self, _input):
        return self.output


@pytest.mark.asyncio
async def test_orchestrator_executes_plan(monkeypatch):
    registry = AgentRegistry()
    registry.register(DummyAgent("nutrition_plan", {"plan": "ok"}))

    orch = OrchestratorAgent(AgentConfig(name="orch", description="Orchestrator"), registry)
    result = await orch.process({"profile": {"id": "u1"}})
    assert result["results"][0]["plan"] == "ok"
