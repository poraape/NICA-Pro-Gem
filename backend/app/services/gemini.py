import json
import time
import uuid
from typing import Optional

import google.generativeai as genai

from app.core.config import settings
from app.schemas.plan import ClinicalReport, PlanRequest, WeeklyPlan


def _configure_client() -> None:
    genai.configure(api_key=settings.gemini_api_key)


_circuit_state = {"failures": 0, "opened_at": 0.0}


class CircuitOpenError(RuntimeError):
    """Raised when circuit is open due to repeated Gemini failures."""


def _record_failure() -> None:
    _circuit_state["failures"] += 1
    if _circuit_state["failures"] >= settings.gemini_circuit_threshold:
        _circuit_state["opened_at"] = time.time()


def _record_success() -> None:
    _circuit_state["failures"] = 0
    _circuit_state["opened_at"] = 0.0


def _ensure_circuit_closed() -> None:
    if _circuit_state["opened_at"]:
        if time.time() - _circuit_state["opened_at"] < settings.gemini_circuit_cooldown:
            raise CircuitOpenError("Gemini circuit open due to repeated failures")
        _record_success()


def _retry_call(fn, attempts: int, backoff: float):
    last_exc: Exception | None = None
    _ensure_circuit_closed()
    for i in range(attempts):
        try:
            result = fn()
            _record_success()
            return result
        except Exception as exc:  # pragma: no cover - external call
            _record_failure()
            last_exc = exc
            if i == attempts - 1:
                raise
            time.sleep(backoff**i)
    if last_exc:
        raise last_exc


def _parse_weekly_plan(text: str) -> WeeklyPlan:
    data = json.loads(text)
    return WeeklyPlan.model_validate(data)


def _parse_clinical_report(text: str) -> ClinicalReport:
    data = json.loads(text)
    return ClinicalReport.model_validate(data)


def generate_weekly_plan(req: PlanRequest) -> Optional[WeeklyPlan]:
    """Call Gemini to generate a weekly plan with retry and schema validation."""
    _configure_client()
    model = genai.GenerativeModel(settings.gemini_model)
    prompt = (
        "Return ONLY valid JSON for a 7-day meal plan matching this profile. "
        "Fields: days[{day, meals[{name,description,calories,macros{protein,carbs,fats}}]}, "
        "recommendations]."
        f"Profile: {req.profile.model_dump_json()}"
    )

    def _call():
        response = model.generate_content(prompt)
        return response.text or "{}"

    raw = _retry_call(_call, attempts=settings.gemini_retries, backoff=settings.gemini_backoff_base)
    try:
        return _parse_weekly_plan(raw)
    except Exception as exc:  # pragma: no cover - validation path
        raise ValueError(f"Failed to parse weekly plan: {exc}") from exc


def generate_clinical_report(req: PlanRequest, plan: WeeklyPlan) -> Optional[ClinicalReport]:
    _configure_client()
    model = genai.GenerativeModel(settings.gemini_model)
    prompt = (
        "Return ONLY valid JSON for a clinical report with fields: "
        "overallScore, weightProjection, dailyDeficit, micronutrientAnalysis{deficiencies,adequacies,notes}, "
        "behavioralInsights, risks."
        f"Profile: {req.profile.model_dump_json()} Plan: {plan.model_dump_json()}"
    )

    def _call():
        response = model.generate_content(prompt)
        return response.text or "{}"

    raw = _retry_call(_call, attempts=settings.gemini_retries, backoff=settings.gemini_backoff_base)
    try:
        return _parse_clinical_report(raw)
    except Exception as exc:  # pragma: no cover - validation path
        raise ValueError(f"Failed to parse clinical report: {exc}") from exc
