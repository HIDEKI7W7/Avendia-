from datetime import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.models.user import User, UserRole
from src.models.referral import ReferralRecord, WalletTransaction, ReferralStatus
from src.auth.security import hash_password, verify_password, create_access_token

router = APIRouter()

# Esquemas de entrada y salida
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = UserRole.DOCENTE
    referral_code: Optional[str] = None

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    plan_tier: str
    credits: int
    credits_total: int
    phone: str
    country: str
    school: str
    educational_level: str
    grade: str
    subject: str
    referral_code: str
    rag_preferences: str
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
async def register(
    payload: UserRegister,
    response: Response,
    session: AsyncSession = Depends(get_session),
    ref_token: Optional[str] = Cookie(default=None)
):
    """
    Endpoint público de registro de usuarios. Hashea la contraseña de forma asíncrona,
    aplica la recompensa de referidos si es aplicable y guarda el registro en PostgreSQL.
    """
    # Verificar si el email ya existe
    result = await session.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
    
    # Hashear contraseña y persistir con valores por defecto (7 créditos por onboarding estándar)
    db_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role or UserRole.DOCENTE,
        plan_tier="FREE",
        credits=7,
        credits_total=7
    )
    
    # Determinar el código de referido (priorizar body payload, luego cookie ref_token)
    token_to_use = payload.referral_code or ref_token
    
    if token_to_use:
        # Buscar al padrino
        query = select(User).where(User.referral_code == token_to_use)
        result = await session.execute(query)
        referrer = result.scalar_one_or_none()
        
        # Validar anti-fraude: evitar autoreferidos y códigos inexistentes
        if referrer and referrer.email != payload.email:
            db_user.referrer_id = referrer.id
            
            # Regla de Negocio: Ambos ganan 5 créditos iniciales por registro exitoso
            db_user.credits += 5
            db_user.credits_total += 5
            
            referrer.credits += 5
            referrer.credits_total += 5
            
            session.add(db_user)
            session.add(referrer)
            await session.flush() # Obtener ID del nuevo usuario
            
            # Registrar transacciones en la billetera de ambos
            session.add(WalletTransaction(
                user_id=referrer.id,
                amount=5,
                description=f"Bono por registro de referido ({payload.email})"
            ))
            session.add(WalletTransaction(
                user_id=db_user.id,
                amount=5,
                description="Bono de bienvenida por enlace de invitado"
            ))
            
            # Crear registro histórico de tracking
            session.add(ReferralRecord(
                referrer_id=referrer.id,
                referred_id=db_user.id,
                referred_email=db_user.email,
                status=ReferralStatus.REGISTERED
            ))
        else:
            session.add(db_user)
    else:
        session.add(db_user)
        
    await session.commit()
    await session.refresh(db_user)
    
    # Consumir la cookie una vez procesado el flujo
    response.delete_cookie("ref_token")
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
    
    # Generar el Token firmando el ID del usuario, email y rol
    access_token = create_access_token(data={
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
