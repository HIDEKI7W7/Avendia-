from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import PyJWTError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.settings import settings
from src.config.database import get_session
from src.models.user import User, UserRole

# OAuth2PasswordBearer busca el token en el header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> User:
    """
    Extrae, valida el token JWT y retorna el usuario de la base de datos asíncronamente.
    Lanza HTTP 401 si falla o expira.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales de acceso",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception
    
    # Consultar el usuario en la BD de forma asíncrona
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

class RoleChecker:
    """
    Verificador de permisos basado en roles (RBAC).
    Permite proteger endpoints mediante: Depends(RoleChecker([UserRole.DIRECTOR]))
    """
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes para realizar esta operación"
            )
        return user
