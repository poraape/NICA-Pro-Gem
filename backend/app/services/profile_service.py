from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import ClinicalReportEntity, MealLog, Profile, WeeklyPlanEntity
from app.schemas.plan import ClinicalReport, WeeklyPlan, UserProfile


class ProfileService:
    """Service layer for profiles, plans, reports, and logs."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_profile(self, profile: UserProfile) -> Profile:
        db_obj = Profile(
            id=profile.id,
            name=profile.name,
            language=profile.language,
            data=profile.model_dump(),
        )
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_profile(self, profile_id: str) -> Optional[Profile]:
        result = await self.session.execute(select(Profile).where(Profile.id == profile_id))
        return result.scalar_one_or_none()

    async def list_profiles(self) -> List[Profile]:
        result = await self.session.execute(select(Profile))
        return list(result.scalars().all())

    async def update_profile(self, profile_id: str, profile: UserProfile) -> Optional[Profile]:
        db_obj = await self.get_profile(profile_id)
        if not db_obj:
            return None
        db_obj.name = profile.name
        db_obj.language = profile.language
        db_obj.data = profile.model_dump()
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete_profile(self, profile_id: str) -> bool:
        obj = await self.get_profile(profile_id)
        if not obj:
            return False
        await self.session.delete(obj)
        await self.session.commit()
        return True

    async def add_plan(self, profile_id: str, plan: WeeklyPlan) -> WeeklyPlanEntity:
        db_obj = WeeklyPlanEntity(profile_id=profile_id, plan=plan.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def add_report(self, profile_id: str, report: ClinicalReport) -> ClinicalReportEntity:
        db_obj = ClinicalReportEntity(profile_id=profile_id, report=report.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def add_log(self, profile_id: str, entry: dict) -> MealLog:
        db_obj = MealLog(profile_id=profile_id, entry=entry)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def list_logs(self, profile_id: str) -> List[MealLog]:
        result = await self.session.execute(select(MealLog).where(MealLog.profile_id == profile_id))
        return list(result.scalars().all())

    async def latest_plan(self, profile_id: str) -> Optional[WeeklyPlanEntity]:
        result = await self.session.execute(
            select(WeeklyPlanEntity).where(WeeklyPlanEntity.profile_id == profile_id).order_by(WeeklyPlanEntity.created_at.desc())
        )
        return result.scalars().first()

    async def list_plans(self, profile_id: str) -> List[WeeklyPlanEntity]:
        result = await self.session.execute(select(WeeklyPlanEntity).where(WeeklyPlanEntity.profile_id == profile_id))
        return list(result.scalars().all())

    async def latest_report(self, profile_id: str) -> Optional[ClinicalReportEntity]:
        result = await self.session.execute(
            select(ClinicalReportEntity).where(ClinicalReportEntity.profile_id == profile_id).order_by(ClinicalReportEntity.created_at.desc())
        )
        return result.scalars().first()

    async def list_reports(self, profile_id: str) -> List[ClinicalReportEntity]:
        result = await self.session.execute(select(ClinicalReportEntity).where(ClinicalReportEntity.profile_id == profile_id))
        return list(result.scalars().all())
