import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel, Column
from pgvector.sqlalchemy import Vector

class LegalEmbedding(SQLModel, table=True):
    __tablename__ = "legal_embeddings"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    source_name: str = Field(
        nullable=False,
        index=True
    )  # Ej: "Ley de Reforma Magisterial.pdf"
    page_number: int = Field(nullable=False)
    text_chunk: str = Field(nullable=False)
    
    # Campo para almacenar el embedding de 768 dimensiones (Gemini)
    embedding: list[float] = Field(
        sa_column=Column(Vector(768), nullable=False)
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
