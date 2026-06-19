import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel

class AILog(SQLModel, table=True):
    __tablename__ = "ai_logs"

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
    model_name: str = Field(
        default="gemini-1.5-flash",
        nullable=False
    )
    prompt_tokens: int = Field(
        default=0,
        nullable=False
    )
    completion_tokens: int = Field(
        default=0,
        nullable=False
    )
    total_tokens: int = Field(
        default=0,
        nullable=False
    )
    cost_usd: float = Field(
        default=0.0,
        nullable=False
    )
    cost_soles: float = Field(
        default=0.0,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        nullable=False
    )
