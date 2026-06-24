from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.auth.router import UserOut

router = APIRouter()

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    school: Optional[str] = None
    educational_level: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    rag_preferences: Optional[str] = None

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Retorna el perfil del usuario autenticado actual.
    """
    return current_user

@router.put("/me", response_model=UserOut)
async def update_me(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Actualiza el perfil del usuario autenticado de forma asíncrona.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.country is not None:
        current_user.country = payload.country
    if payload.school is not None:
        current_user.school = payload.school
    if payload.educational_level is not None:
        current_user.educational_level = payload.educational_level
    if payload.grade is not None:
        current_user.grade = payload.grade
    if payload.subject is not None:
        current_user.subject = payload.subject
    if payload.rag_preferences is not None:
        current_user.rag_preferences = payload.rag_preferences

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user
