"""Encadenamiento de documentos: la sesión generada alimenta al instrumento.

El navegador solo envía el `source_document_id`; el servidor carga el documento
del mismo docente, extrae sus matrices (criterios, evidencia, producto,
competencia) y las incorpora al prompt con una regla vinculante. La verificación
`chained_consistency` comprueba después que el instrumento usó esos criterios.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

from pydantic import ValidationError

from app.modules.ai.schemas import WorkflowArtifactTable
from app.modules.documents.model import Document

# Herramientas cuyo resultado debe usar exactamente los criterios del documento origen.
CHAINED_INSTRUMENT_TOOLS = frozenset(
    {"lista-cotejo", "rubrica-evaluacion", "escala-estimacion", "ficha-observacion"}
)
# Matrices del documento origen que merece la pena mostrar a la IA.
_RELEVANT_TABLES = (
    "propósitos de aprendizaje",
    "alineamiento pedagógico",
    "instrumento de evaluación",
    "enfoques transversales",
    "producto y evidencias",
    "criterios e instrumento",
)
_SPLIT_LIST = re.compile(r"\s*\n\s*|\s*•\s*|\s*✓\s*|\s*;\s*")
_STOPWORDS = frozenset(
    {
        "sobre",
        "entre",
        "desde",
        "hasta",
        "cuando",
        "donde",
        "también",
        "tambien",
        "mediante",
        "través",
        "traves",
        "según",
        "segun",
        "hacia",
        "durante",
        "porque",
        "aunque",
        "luego",
        "antes",
        "después",
        "despues",
        "puede",
        "pueden",
        "manera",
        "forma",
    }
)


@dataclass(frozen=True)
class ChainedSource:
    """Lo que el documento origen aporta a la generación encadenada."""

    document_id: str
    title: str
    document_type: str
    competency: str = ""
    evidence: str = ""
    product: str = ""
    criteria: list[str] = field(default_factory=list)
    tables: list[WorkflowArtifactTable] = field(default_factory=list)


def _normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.casefold())
    return "".join(char for char in text if not unicodedata.combining(char))


def _find_table(tables: list[WorkflowArtifactTable], name: str) -> WorkflowArtifactTable | None:
    wanted = _normalize(name)
    return next((table for table in tables if wanted in _normalize(table.title)), None)


def _split_list(value: str) -> list[str]:
    return [
        re.sub(r"^[-•✓]\s*", "", item).strip()
        for item in _SPLIT_LIST.split(value)
        if item and item.strip()
    ]


def chained_source_from_document(document: Document) -> ChainedSource | None:
    """Extrae del documento guardado las matrices que alimentan la siguiente etapa."""
    artifact = document.metadata_json.get("artifact") if document.metadata_json else None
    if not isinstance(artifact, dict):
        return None
    tables: list[WorkflowArtifactTable] = []
    for raw in artifact.get("tables") or []:
        try:
            tables.append(WorkflowArtifactTable.model_validate(raw))
        except ValidationError:
            continue
    if not tables:
        return None

    criteria: list[str] = []
    competency = ""
    evidence = ""
    product = ""

    instrument = _find_table(tables, "instrumento de evaluación")
    purposes = _find_table(tables, "propósitos de aprendizaje")
    alignment = _find_table(tables, "alineamiento pedagógico")
    unit_product = _find_table(tables, "producto y evidencias")
    unit_criteria = _find_table(tables, "criterios e instrumento")

    if instrument and len(instrument.columns) >= 2:
        criteria = [row[1].strip() for row in instrument.rows if len(row) > 1 and row[1].strip()]
    if not criteria and purposes and len(purposes.columns) >= 3 and purposes.rows:
        criteria = _split_list(purposes.rows[0][2]) if len(purposes.rows[0]) > 2 else []
    if not criteria and unit_criteria and unit_criteria.rows:
        criteria = [row[0].strip() for row in unit_criteria.rows if row and row[0].strip()]
    if purposes and purposes.rows and purposes.rows[0]:
        competency = purposes.rows[0][0].splitlines()[0].strip()
    if alignment and alignment.rows and len(alignment.rows[0]) >= 4:
        evidence = alignment.rows[0][2].strip()
        product = alignment.rows[0][3].strip()
    if not product and unit_product and unit_product.rows and unit_product.rows[0]:
        product = unit_product.rows[0][0].strip()

    relevant = [
        table
        for table in tables
        if any(name in _normalize(table.title) for name in _RELEVANT_TABLES)
    ] or tables[:3]
    return ChainedSource(
        document_id=str(document.id),
        title=document.title,
        document_type=document.document_type,
        competency=competency,
        evidence=evidence,
        product=product,
        criteria=criteria[:15],
        tables=relevant,
    )


def chained_prompt_block(source: ChainedSource) -> str:
    """Bloque del prompt con las matrices del origen y la regla de coherencia."""
    criteria = "\n".join(f"- {item}" for item in source.criteria) or "- (sin criterios explícitos)"
    tables = "\n\n".join(
        f"{table.title}\nColumnas: {' | '.join(table.columns)}\n"
        + "\n".join(" | ".join(cell.replace("\n", " ") for cell in row) for row in table.rows)
        for table in source.tables
    )
    return f"""
DOCUMENTO DE ORIGEN (encadenado, generado antes por Avendia para este mismo docente):
Título: {source.title}
Tipo: {source.document_type}
Competencia principal: {source.competency or "(no indicada)"}
Evidencia de aprendizaje: {source.evidence or "(no indicada)"}
Producto: {source.product or "(no indicado)"}
Criterios de evaluación del origen:
{criteria}

<matrices_origen>
{tables}
</matrices_origen>

REGLA DE COHERENCIA VINCULANTE: este resultado deriva del documento de origen. Usa
exactamente sus criterios de evaluación, su evidencia y su producto, con la misma
redacción o una equivalente que conserve las palabras clave; no inventes criterios
distintos ni cambies el tema. Si necesitas más criterios que los del origen, deriva los
adicionales de sus desempeños sin contradecirlos y colócalos al final.
""".strip()


def _keywords(value: str) -> set[str]:
    return {
        word
        for word in re.findall(r"[a-záéíóúñü]{5,}", _normalize(value))
        if word not in _STOPWORDS
    }


def criterion_is_represented(criterion: str, artifact_text: str) -> bool:
    """Un criterio sobrevive si aparece literal o conserva la mayoría de sus palabras clave."""
    normalized_text = _normalize(artifact_text)
    if _normalize(criterion) in normalized_text:
        return True
    words = _keywords(criterion)
    if not words:
        return True
    present = {word for word in words if word in normalized_text}
    return len(present) * 10 >= len(words) * 6


def missing_source_criteria(source: ChainedSource, artifact_text: str) -> list[str]:
    return [item for item in source.criteria if not criterion_is_represented(item, artifact_text)]
