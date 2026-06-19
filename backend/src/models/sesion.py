import uuid
from typing import List
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import JSONB

class Sesion(SQLModel, table=True):
    __tablename__ = "sesiones_aprendizaje"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    unidad_id: uuid.UUID = Field(
        foreign_key="unidades_aprendizaje.id",
        index=True,
        nullable=False
    )
    numero_sesion: int = Field(
        nullable=False
    )  # Ej: 1, 2
    titulo_sesion: str = Field(
        nullable=False
    )
    proposito_aprendizaje: str = Field(
        nullable=False
    )
    criterios_evaluacion: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )
    secuencia_didactica: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )  # Ej: { "inicio": "...", "desarrollo": "...", "cierre": "..." }

    unidad: "Unidad" = Relationship(
        back_populates="sesiones"
    )
    fichas: List["FichaAprendizaje"] = Relationship(
        back_populates="sesion",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
