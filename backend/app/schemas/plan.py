from typing import List, Optional

from pydantic import BaseModel, Field


class MacroBreakdown(BaseModel):
    protein: float
    carbs: float
    fats: float


class MealItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    calories: float
    macros: MacroBreakdown
    timestamp: str


class DayPlan(BaseModel):
    day: str
    meals: List[MealItem]
    dailyCalories: float
    dailyMacros: MacroBreakdown


class WeeklyPlan(BaseModel):
    id: str
    days: List[DayPlan]
    averageCalories: float
    averageMacros: MacroBreakdown
    recommendations: List[str]
    generatedAt: str


class ClinicalReport(BaseModel):
    id: str
    generatedAt: str
    overallScore: float
    weightProjection: float
    dailyDeficit: float
    micronutrientAnalysis: dict
    behavioralInsights: List[str]
    risks: List[str]


class UserProfile(BaseModel):
    id: str
    language: str
    onboardingMode: str
    name: str
    biometrics: dict
    clinical: dict
    lifestyle: dict
    routine: dict
    goals: dict
    consent: dict
    bmr: Optional[float] = None
    tdee: Optional[float] = None


class PlanRequest(BaseModel):
    profile: UserProfile
    correlation_id: Optional[str] = Field(default=None, description="Trace ID for orchestration.")


class PlanTaskResponse(BaseModel):
    task_id: str
    status: str = "queued"
    correlation_id: Optional[str] = None
    plan: Optional[WeeklyPlan] = None
    clinical_report: Optional[ClinicalReport] = None
