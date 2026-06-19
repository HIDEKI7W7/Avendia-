import uuid
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import JSONB

class FichaAprendizaje(SQLModel, table=True):
    __tablename__ = "fichas_aprendizaje"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    sesion_id: uuid.UUID = Field(
        foreign_key="sesiones_aprendizaje.id",
        index=True,
        nullable=False
    )
    contenido_markdown: str = Field(
        nullable=False
    )
    actividades: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )

    sesion: "Sesion" = Relationship(
        back_populates="fichas"
    )
