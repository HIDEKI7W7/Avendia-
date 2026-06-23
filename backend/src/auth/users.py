from fastapi import APIRouter, Depends
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.auth.router import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Retorna el perfil del usuario autenticado actual (incluye rol, plan_tier y créditos).
    """
    return current_user
