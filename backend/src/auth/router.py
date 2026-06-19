from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.models.user import User, UserRole
from src.auth.security import hash_password, verify_password, create_access_token

router = APIRouter()

# Esquemas de entrada y salida
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, session: AsyncSession = Depends(get_session)):
    """
    Endpoint público de registro de usuarios. Hashea la contraseña de forma asíncrona
    y guarda el registro en PostgreSQL.
    """
    # Verificar si el email ya existe
    result = await session.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
    
    # Hashear contraseña y persistir
    db_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    """
    Endpoint de login. Valida la contraseña y retorna el JWT junto con los datos de rol.
    """
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos."
        )
    
    # Generar el Token firmando el ID del usuario
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
