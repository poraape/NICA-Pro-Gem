from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel

from app.schemas.plan import WeeklyPlan, ClinicalReport, UserProfile


class ProfileCreate(BaseModel):
    profile: UserProfile


class ProfileOut(BaseModel):
    id: str
    name: str
    language: str
    data: dict
    created_at: datetime
    updated_at: datetime


class MealLogIn(BaseModel):
    entry: dict


class MealLogOut(BaseModel):
    id: str
    entry: dict
    logged_at: datetime


class PlanOut(BaseModel):
    id: str
    plan: WeeklyPlan
    created_at: datetime


class ReportOut(BaseModel):
    id: str
    report: ClinicalReport
    created_at: datetime
