import time
from types import SimpleNamespace

from app.tasks import agent_tasks
from app.schemas.plan import PlanRequest, UserProfile


def test_generate_plan_task(monkeypatch):
    events = []

    def fake_publish_event(event: dict):
        events.append(event)

    def fake_generate_weekly_plan(req):
        return SimpleNamespace(model_dump=lambda: {"plan": "ok"})

    def fake_generate_clinical_report(req, plan):
        return SimpleNamespace(model_dump=lambda: {"report": "ok"})

    monkeypatch.setattr(agent_tasks, "_publish_event", fake_publish_event)
    monkeypatch.setattr(agent_tasks.gemini, "generate_weekly_plan", fake_generate_weekly_plan)
    monkeypatch.setattr(agent_tasks.gemini, "generate_clinical_report", fake_generate_clinical_report)

    payload = PlanRequest(
        profile=UserProfile(
            id="u1",
            language="en",
            onboardingMode="express",
            name="User",
            biometrics={},
            clinical={},
            lifestyle={},
            routine={},
            goals={},
            consent={},
        ),
        correlation_id="c1",
    ).model_dump()

    result = agent_tasks.generate_plan_task(payload)
    assert result["status"] == "success"
    assert events[0]["event"] == "started"
    assert events[-1]["event"] == "completed"
