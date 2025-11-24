import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Profile(Base):
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(10))
    data = Column(JSONB, nullable=False)  # full profile payload
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    plans: Mapped[list["WeeklyPlanEntity"]] = relationship(back_populates="profile")
    reports: Mapped[list["ClinicalReportEntity"]] = relationship(back_populates="profile")
    meal_logs: Mapped[list["MealLog"]] = relationship(back_populates="profile")


class WeeklyPlanEntity(Base):
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(String, ForeignKey("profile.id"))
    plan = Column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped[Profile] = relationship(back_populates="plans")


class ClinicalReportEntity(Base):
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(String, ForeignKey("profile.id"))
    report = Column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped[Profile] = relationship(back_populates="reports")


class MealLog(Base):
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(String, ForeignKey("profile.id"))
    entry = Column(JSONB, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped[Profile] = relationship(back_populates="meal_logs")
