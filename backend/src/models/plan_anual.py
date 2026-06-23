import uuid
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import JSONB

class PlanAnual(SQLModel, table=True):
    __tablename__ = "planes_anuales"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    docente_id: uuid.UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False
    )
    grado: str = Field(
        nullable=False
    )  # Ej: "3ro", "5to"
    seccion: str = Field(
        nullable=False
    )  # Ej: "A", "B"
    area_curricular: str = Field(
        nullable=False
    )  # Ej: "Matemática", "Comunicación"

    # Datos Informativos MINEDU
    dre: str = Field(default="", nullable=False)
    ugel: str = Field(default="", nullable=False)
    institucion_educativa: str = Field(default="", nullable=False)
    ciclo: str = Field(default="", nullable=False)
    turno: str = Field(default="", nullable=False)

    # Contexto CNEB
    descripcion_estudiante: str = Field(
        default="",
        sa_column=Column(Text, nullable=False)
    )
    descripcion_contexto_local: str = Field(
        default="",
        sa_column=Column(Text, nullable=False)
    )

    # Temporalidad (Bimestres / Trimestres)
    organizacion_tiempo: Optional[dict] = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=True)
    )

    enfoques_transversales: Optional[dict] = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=True)
    )

    # Árbol Curricular Estricto (Lista de Dicts)
    competencias_anuales: list = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False)
    )

    unidades: List["Unidad"] = Relationship(
        back_populates="plan_anual",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
