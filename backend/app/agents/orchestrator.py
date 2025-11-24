import asyncio
from typing import Any, Dict, List

from langgraph.graph import StateGraph, END

from app.agents.base_agent import AgentConfig, BaseAgent
from app.agents.registry import AgentRegistry


class OrchestratorAgent(BaseAgent[Dict[str, Any]]):
    """Simple orchestrator that delegates to registered agents using LangGraph."""

    def __init__(self, config: AgentConfig, registry: AgentRegistry):
        super().__init__(config)
        self.registry = registry

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Build a trivial graph: intake -> planner -> executor."""
        graph = StateGraph(dict)

        async def intake(state: Dict[str, Any]) -> Dict[str, Any]:
            return {**state, "status": "intake_ok"}

        async def planner(state: Dict[str, Any]) -> Dict[str, Any]:
            state["plan"] = [{"agent": "nutrition_plan", "input": state}]
            return state

        async def executor(state: Dict[str, Any]) -> Dict[str, Any]:
            results: List[Any] = []
            for step in state.get("plan", []):
                agent = self.registry.get(step["agent"])
                if not agent:
                    continue
                res = await agent.run(step["input"])
                results.append(res)
            state["results"] = results
            return state

        graph.add_node("intake", intake)
        graph.add_node("planner", planner)
        graph.add_node("executor", executor)

        graph.add_edge("intake", "planner")
        graph.add_edge("planner", "executor")
        graph.add_edge("executor", END)

        app = graph.compile()
        result = await app.ainvoke(input_data)
        return result
