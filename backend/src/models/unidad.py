import uuid
from typing import List
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import JSONB

class Unidad(SQLModel, table=True):
    __tablename__ = "unidades_aprendizaje"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    plan_anual_id: uuid.UUID = Field(
        foreign_key="planes_anuales.id",
        index=True,
        nullable=False
    )
    numero_unidad: int = Field(
        nullable=False
    )  # Ej: 1, 2
    titulo: str = Field(
        nullable=False
    )
    situacion_significativa: str = Field(
        nullable=False
    )
    duracion_semanas: int = Field(
        default=4,
        nullable=False
    )
    competencias_especificas: dict = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )

    plan_anual: "PlanAnual" = Relationship(
        back_populates="unidades"
    )
    sesiones: List["Sesion"] = Relationship(
        back_populates="unidad",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
