import uuid
from datetime import datetime
from enum import Enum
from sqlmodel import Field, SQLModel

class PaymentStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    FAILED = "failed"

class PaymentMethod(str, Enum):
    YAPE = "Yape"
    PLIN = "Plin"
    TRANSFERENCIA = "Transferencia"
    SIN_ESPECIFICAR = "Sin especificar"

class PaymentTransaction(SQLModel, table=True):
    __tablename__ = "payment_transactions"

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
    amount: float = Field(
        nullable=False
    )
    payment_method: PaymentMethod = Field(
        default=PaymentMethod.SIN_ESPECIFICAR,
        nullable=False
    )
    status: PaymentStatus = Field(
        default=PaymentStatus.COMPLETED,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        nullable=False
    )
