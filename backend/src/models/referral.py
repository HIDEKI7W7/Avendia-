import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel

class ReferralStatus(str, Enum):
    PENDING = "pending"
    REGISTERED = "registered"
    PREMIUM_BONUS_PAID = "premium_bonus_paid"

class ReferralRecord(SQLModel, table=True):
    __tablename__ = "referral_records"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    referrer_id: uuid.UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True
    )
    referred_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="users.id",
        nullable=True,
        unique=True
    )
    referred_email: str = Field(nullable=False)
    status: ReferralStatus = Field(
        default=ReferralStatus.PENDING,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

class WalletTransaction(SQLModel, table=True):
    __tablename__ = "wallet_transactions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    user_id: uuid.UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True
    )
    amount: int = Field(nullable=False)  # Puede ser positivo o negativo
    description: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
