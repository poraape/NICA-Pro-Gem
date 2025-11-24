from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import get_current_user
from app.schemas.plan import UserProfile, WeeklyPlan
from app.schemas.profile import MealLogIn, MealLogOut, ProfileOut, ProfileCreate, ReportOut, PlanOut
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
async def create_profile(payload: ProfileCreate, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    db_obj = await service.create_profile(payload.profile)
    return ProfileOut(
        id=db_obj.id,
        name=db_obj.name,
        language=db_obj.language,
        data=db_obj.data,
        created_at=db_obj.created_at,
        updated_at=db_obj.updated_at,
    )


@router.get("", response_model=list[ProfileOut])
async def list_profiles(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    profiles = await service.list_profiles()
    return [
        ProfileOut(
            id=p.id,
            name=p.name,
            language=p.language,
            data=p.data,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in profiles
    ]


@router.get("/{profile_id}", response_model=ProfileOut)
async def get_profile(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    db_obj = await service.get_profile(profile_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileOut(
        id=db_obj.id,
        name=db_obj.name,
        language=db_obj.language,
        data=db_obj.data,
        created_at=db_obj.created_at,
        updated_at=db_obj.updated_at,
    )


@router.put("/{profile_id}", response_model=ProfileOut)
async def update_profile(
    profile_id: str, payload: ProfileCreate, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)
):
    service = ProfileService(session)
    db_obj = await service.update_profile(profile_id, payload.profile)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileOut(
        id=db_obj.id,
        name=db_obj.name,
        language=db_obj.language,
        data=db_obj.data,
        created_at=db_obj.created_at,
        updated_at=db_obj.updated_at,
    )


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    ok = await service.delete_profile(profile_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.post("/{profile_id}/logs", response_model=MealLogOut, status_code=status.HTTP_201_CREATED)
async def add_log(
    profile_id: str,
    payload: MealLogIn,
    session: AsyncSession = Depends(get_session),
    user=Depends(get_current_user),
):
    service = ProfileService(session)
    log = await service.add_log(profile_id, payload.entry)
    return MealLogOut(id=log.id, entry=log.entry, logged_at=log.logged_at)


@router.get("/{profile_id}/logs", response_model=list[MealLogOut])
async def list_logs(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    logs = await service.list_logs(profile_id)
    return [MealLogOut(id=l.id, entry=l.entry, logged_at=l.logged_at) for l in logs]


@router.get("/{profile_id}/reports/latest", response_model=ReportOut)
async def latest_report(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    report = await service.latest_report(profile_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return ReportOut(id=report.id, report=report.report, created_at=report.created_at)


@router.get("/{profile_id}/reports", response_model=list[ReportOut])
async def list_reports(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    reports = await service.list_reports(profile_id)
    return [ReportOut(id=r.id, report=r.report, created_at=r.created_at) for r in reports]


@router.get("/{profile_id}/plans/latest", response_model=PlanOut)
async def latest_plan(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    plan = await service.latest_plan(profile_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return PlanOut(id=plan.id, plan=WeeklyPlan.model_validate(plan.plan), created_at=plan.created_at)


@router.get("/{profile_id}/plans", response_model=list[PlanOut])
async def list_plans(profile_id: str, session: AsyncSession = Depends(get_session), user=Depends(get_current_user)):
    service = ProfileService(session)
    plans = await service.list_plans(profile_id)
    return [PlanOut(id=p.id, plan=WeeklyPlan.model_validate(p.plan), created_at=p.created_at) for p in plans]
