import json
from types import SimpleNamespace

import pytest

from app.schemas.plan import PlanRequest, UserProfile, WeeklyPlan, ClinicalReport
from app.services import gemini


def _dummy_request() -> PlanRequest:
    return PlanRequest(
        profile=UserProfile(
            id="u1",
            language="en",
            onboardingMode="express",
            name="Test User",
            biometrics={},
            clinical={},
            lifestyle={},
            routine={"mealsPerDay": 3},
            goals={},
            consent={},
        )
    )


def test_generate_weekly_plan_parses_json(monkeypatch):
    expected = {
        "id": "p1",
        "days": [
            {
                "day": "Monday",
                "meals": [
                    {
                        "id": "m1",
                        "name": "Meal",
                        "description": "Desc",
                        "calories": 500,
                        "macros": {"protein": 30, "carbs": 50, "fats": 10},
                        "timestamp": "",
                    }
                ],
                "dailyCalories": 500,
                "dailyMacros": {"protein": 30, "carbs": 50, "fats": 10},
            }
        ],
        "averageCalories": 500,
        "averageMacros": {"protein": 30, "carbs": 50, "fats": 10},
        "recommendations": ["Do this"],
        "generatedAt": "",
    }

    def fake_generate_content(prompt):
        return SimpleNamespace(text=json.dumps(expected))

    class FakeModel:
        def __init__(self, *_args, **_kwargs):
            ...

        def generate_content(self, prompt):
            return fake_generate_content(prompt)

    monkeypatch.setattr(gemini.genai, "GenerativeModel", FakeModel)
    monkeypatch.setattr(gemini.genai, "configure", lambda api_key: None)

    plan = gemini.generate_weekly_plan(_dummy_request())
    assert isinstance(plan, WeeklyPlan)
    assert plan.days[0].meals[0].name == "Meal"


def test_generate_clinical_report_parses_json(monkeypatch):
    expected = {
        "id": "r1",
        "generatedAt": "",
        "overallScore": 90,
        "weightProjection": -0.4,
        "dailyDeficit": 350,
        "micronutrientAnalysis": {"deficiencies": [], "adequacies": [], "notes": ""},
        "behavioralInsights": [],
        "risks": [],
    }

    class FakeModel:
        def __init__(self, *_args, **_kwargs):
            ...

        def generate_content(self, prompt):
            return SimpleNamespace(text=json.dumps(expected))

    monkeypatch.setattr(gemini.genai, "GenerativeModel", FakeModel)
    monkeypatch.setattr(gemini.genai, "configure", lambda api_key: None)

    req = _dummy_request()
    dummy_plan = WeeklyPlan(
        id="p1",
        days=[],
        averageCalories=0,
        averageMacros={"protein": 0, "carbs": 0, "fats": 0},
        recommendations=[],
        generatedAt="",
    )
    report = gemini.generate_clinical_report(req, dummy_plan)
    assert isinstance(report, ClinicalReport)
    assert report.overallScore == 90


def test_circuit_breaker(monkeypatch):
    def failing_call(prompt):
        raise RuntimeError("fail")

    class FakeModel:
        def __init__(self, *_args, **_kwargs):
            ...

        def generate_content(self, prompt):
            return failing_call(prompt)

    monkeypatch.setattr(gemini.genai, "GenerativeModel", FakeModel)
    monkeypatch.setattr(gemini.genai, "configure", lambda api_key: None)

    req = _dummy_request()
    with pytest.raises(Exception):
        gemini.generate_weekly_plan(req)
    # circuit should be open now; next call raises CircuitOpenError quickly
    with pytest.raises(gemini.CircuitOpenError):
        gemini.generate_weekly_plan(req)
