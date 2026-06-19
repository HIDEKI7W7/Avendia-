import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel

class UserRole(str, Enum):
    DOCENTE = "DOCENTE"
    DIRECTOR = "DIRECTOR"
    AUXILIAR = "AUXILIAR"
    ADMIN = "ADMIN"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    email: str = Field(
        unique=True,
        index=True,
        nullable=False
    )
    password_hash: str = Field(nullable=False)
    full_name: str = Field(nullable=False)
    role: UserRole = Field(
        default=UserRole.DOCENTE,
        index=True,
        nullable=False
    )
    credits: int = Field(
        default=1000,
        index=True,
        nullable=False
    )
    credits_total: int = Field(
        default=1000,
        nullable=False
    )
    status: str = Field(
        default="activo",
        nullable=False
    )
    phone: str = Field(
        default="",
        nullable=False
    )
    created_by: str = Field(
        default="digitalizadodocente",
        nullable=False
    )
    areas: int = Field(
        default=5,
        nullable=False
    )
    last_access: Optional[datetime] = Field(
        default=None,
        nullable=True
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        nullable=False
    )

