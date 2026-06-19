import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSONB

class Document(SQLModel, table=True):
    __tablename__ = "documents"

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
    title: str = Field(nullable=False)
    document_type: str = Field(nullable=False)  # Ej: Sesión, Unidad, Informe
    content_data: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )
    file_path: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
