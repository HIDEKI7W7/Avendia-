"""Encadenamiento sesión → instrumento en el servidor."""

from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.ai.chaining import (
    ChainedSource,
    chained_prompt_block,
    chained_source_from_document,
    criterion_is_represented,
)
from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    WorkflowArtifactTable,
    WorkflowGenerationRequest,
    WorkflowGenerationResponse,
)
from app.modules.ai.service import _quality_report, _workflow_prompt
from app.modules.ai.tool_contracts import get_tool_contract
from app.modules.documents.model import Document

SESSION_TABLES = [
    {
        "title": "Propósitos de aprendizaje",
        "columns": ["Competencia y capacidades", "Desempeños del grado", "Criterios de evaluación"],
        "rows": [
            [
                "Construye su identidad\nSe valora a sí mismo",
                "Explica cómo el Fenómeno del Niño afecta a su familia.",
                "Reconoce el impacto del fenómeno en su vida cotidiana.\n"
                "Identifica cambios en su comunidad.",
            ],
            [
                "Gestiona su aprendizaje de manera autónoma",
                "Organiza su trabajo.",
                "Cumple acuerdos.",
            ],
        ],
    },
    {
        "title": "Alineamiento pedagógico",
        "columns": [
            "Propósito",
            "Reto y situación significativa",
            "Evidencia",
            "Producto",
            "Estándar del ciclo",
        ],
        "rows": [
            [
                "¿Qué?...",
                "¿Cómo nos preparamos?",
                "Organizador visual del impacto",
                "Mural de prevención",
                "Estándar",
            ]
        ],
    },
    {
        "title": "Instrumento de evaluación",
        "columns": ["N°", "Criterio observable", "Evidencia", "Escala"],
        "rows": [
            [
                "1",
                "Reconoce el impacto del fenómeno en su vida cotidiana.",
                "Diálogo",
                "Lo logró / En proceso",
            ],
            [
                "2",
                "Identifica cambios climáticos en su comunidad.",
                "Organizador",
                "Lo logró / En proceso",
            ],
            [
                "3",
                "Menciona cómo altera las actividades familiares.",
                "Ficha",
                "Lo logró / En proceso",
            ],
        ],
    },
]


def _session_document(owner_id, **overrides) -> Document:
    return Document(
        owner_id=owner_id,
        title="Sesión: Fenómeno El Niño",
        document_type="planificamos/sesion-aprendizaje",
        status="draft",
        content="",
        metadata_json={"artifact": {"tables": SESSION_TABLES}, **overrides},
    )


def _instrument_payload(source_id: str | None = None) -> WorkflowGenerationRequest:
    return WorkflowGenerationRequest(
        tool_id="lista-cotejo",
        module="evaluamos",
        tool_title="Guía de observación",
        artifact_type="instrumento",
        fields={
            "activity": "Organizador visual del impacto",
            "criteria_count": "3",
            "topic": "Fenómeno El Niño",
        },
        requested_sections=[
            "Datos del instrumento",
            "Indicadores observables",
            "Matriz de registro",
            "Observaciones y retroalimentación",
        ],
        source_document_id=source_id,
    )


def _instrument_artifact(criteria: list[str]) -> GeneratedWorkflowArtifact:
    return GeneratedWorkflowArtifact(
        document_title="Guía de observación: Fenómeno El Niño",
        executive_summary=(
            "Instrumento derivado de la sesión con criterios observables y registro "
            "por estudiante."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=f"Desarrollo aplicable de {title.lower()}.",
                key_points=[f"Acción verificable para {title.lower()}"],
            )
            for title in [
                "Datos del instrumento",
                "Indicadores observables",
                "Matriz de registro",
                "Observaciones y retroalimentación",
            ]
        ],
        teacher_recommendations=[
            "Registrar durante la clase.",
            "Devolver observaciones al cierre.",
        ],
        tables=[
            WorkflowArtifactTable(
                title="Matriz de registro",
                columns=["N°", "Estudiante", "C1", "C2", "C3", "Observaciones"],
                rows=[["1", "Ana Torres", "Sí", "Sí", "No", "Sin observaciones"]],
            ),
            WorkflowArtifactTable(
                title="Leyenda de criterios",
                columns=["Código", "Criterio observable", "Evidencia"],
                rows=[
                    [f"C{index}", item, "Diálogo"] for index, item in enumerate(criteria, start=1)
                ],
            ),
        ],
    )


def test_source_extracts_criteria_evidence_product_and_competency() -> None:
    from uuid import uuid4

    source = chained_source_from_document(_session_document(uuid4()))
    assert source is not None
    assert source.competency == "Construye su identidad"
    assert source.evidence == "Organizador visual del impacto"
    assert source.product == "Mural de prevención"
    assert source.criteria == [
        "Reconoce el impacto del fenómeno en su vida cotidiana.",
        "Identifica cambios climáticos en su comunidad.",
        "Menciona cómo altera las actividades familiares.",
    ]
    assert [table.title for table in source.tables] == [
        "Propósitos de aprendizaje",
        "Alineamiento pedagógico",
        "Instrumento de evaluación",
    ]
    block = chained_prompt_block(source)
    assert "REGLA DE COHERENCIA VINCULANTE" in block
    assert "Mural de prevención" in block
    assert block in _workflow_prompt(_instrument_payload(), source)


def test_source_is_none_without_tables() -> None:
    from uuid import uuid4

    document = _session_document(uuid4())
    document.metadata_json = {"artifact": {"tables": []}}
    assert chained_source_from_document(document) is None
    document.metadata_json = {}
    assert chained_source_from_document(document) is None


def test_criterion_survives_rewording_but_not_replacement() -> None:
    text = "Reconoce el impacto del fenómeno en su vida cotidiana y en su familia."
    assert criterion_is_represented("Reconoce el impacto del fenómeno en su vida cotidiana.", text)
    assert criterion_is_represented("RECONOCE EL IMPACTO DEL FENÓMENO", text)
    assert not criterion_is_represented("Resuelve problemas aditivos con material concreto.", text)


def test_quality_report_blocks_instruments_that_drop_source_criteria() -> None:
    from uuid import uuid4

    source = chained_source_from_document(_session_document(uuid4()))
    assert source is not None
    payload = _instrument_payload()
    contract = get_tool_contract(payload.module, payload.tool_id)

    faithful = _instrument_artifact(source.criteria)
    checks, _warnings, status_value = _quality_report(faithful, payload, contract, source)
    chained = next(check for check in checks if check.code == "chained_consistency")
    assert chained.passed and chained.severity == "P0"
    assert status_value != "blocked"

    unfaithful = _instrument_artifact(
        [
            "Resuelve problemas aditivos con material concreto.",
            "Explica su estrategia de cálculo.",
            "Menciona cómo altera las actividades familiares.",
        ]
    )
    checks, warnings, status_value = _quality_report(unfaithful, payload, contract, source)
    chained = next(check for check in checks if check.code == "chained_consistency")
    assert not chained.passed
    assert "omitió criterios" in chained.detail
    assert status_value == "blocked"
    assert any("omitió criterios" in warning for warning in warnings)

    # Sin documento de origen no se añade la verificación.
    checks, _warnings, _status = _quality_report(unfaithful, payload, contract)
    assert all(check.code != "chained_consistency" for check in checks)


def test_non_instrument_tools_get_a_soft_check() -> None:
    source = ChainedSource(
        document_id="x",
        title="Unidad: Cuidamos el agua",
        document_type="planificamos/unidad-aprendizaje",
        criteria=["Explica el ciclo del agua."],
    )
    payload = WorkflowGenerationRequest(
        tool_id="sesion-aprendizaje",
        module="planificamos",
        tool_title="Sesión de Aprendizaje",
        artifact_type="documento",
        fields={"session_topic": "El ciclo del agua"},
        requested_sections=["Propósito", "Inicio", "Desarrollo", "Cierre"],
    )
    artifact = GeneratedWorkflowArtifact(
        document_title="Sesión: cuidamos el agua de la unidad",
        executive_summary=(
            "Sesión de la unidad Cuidamos el agua con propósito, inicio, desarrollo y "
            "cierre verificables."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=t,
                narrative=f"Desarrollo de {t.lower()} sobre el agua.",
                key_points=[f"Acción para {t.lower()}"],
            )
            for t in ["Propósito", "Inicio", "Desarrollo", "Cierre"]
        ],
        teacher_recommendations=["Revisar tiempos.", "Ajustar ejemplos."],
    )
    checks, _w, _s = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "sesion-aprendizaje"), source
    )
    chained = next(check for check in checks if check.code == "chained_consistency")
    assert chained.severity == "P1" and chained.passed


async def _register_and_login(client: AsyncClient, email: str) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Docente Cadena",
            "password": "a-secure-password",
            "dre": "DRE Lima",
            "ugel": "UGEL 03",
            "school_name": "I.E. Cadena",
            "director_name": "Directora",
            "education_modality": "EBR",
            "education_level": "Primaria",
            "grade": "2° de Primaria",
            "section": "A",
            "curricular_area": "Personal Social",
            "school_year": 2026,
        },
    )
    login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "a-secure-password"}
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_generate_loads_the_source_document_of_the_same_owner(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = WorkflowGenerationResponse(
        **_instrument_artifact(
            ["Reconoce el impacto del fenómeno en su vida cotidiana."]
        ).model_dump(),
        model="gemini-test",
    )
    generation_mock = AsyncMock(return_value=generated)
    monkeypatch.setattr("app.modules.ai.router.generate_workflow_artifact", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner = await _register_and_login(client, "cadena-owner@example.edu")
        other = await _register_and_login(client, "cadena-other@example.edu")
        created = await client.post(
            "/api/v1/documents",
            headers=owner,
            json={
                "title": "Sesión: Fenómeno El Niño",
                "document_type": "planificamos/sesion-aprendizaje",
                "content": "…",
                "metadata": {"artifact": {"tables": SESSION_TABLES}},
            },
        )
        assert created.status_code == 201, created.text
        document_id = created.json()["id"]
        body = _instrument_payload(document_id).model_dump(mode="json", exclude_none=True)

        ok = await client.post("/api/v1/ai/tools/workflow/generate", headers=owner, json=body)
        foreign = await client.post("/api/v1/ai/tools/workflow/generate", headers=other, json=body)
        missing = await client.post(
            "/api/v1/ai/tools/workflow/generate",
            headers=owner,
            json={**body, "source_document_id": "00000000-0000-0000-0000-000000000000"},
        )

    assert ok.status_code == 200, ok.text
    assert foreign.status_code == 404
    assert missing.status_code == 404
    generation_mock.assert_awaited_once()
    source = generation_mock.await_args.kwargs["source"]
    assert source.document_id == document_id
    assert source.criteria[0] == "Reconoce el impacto del fenómeno en su vida cotidiana."


@pytest.mark.asyncio
async def test_origen_sin_matrices_solo_bloquea_a_los_instrumentos_encadenados(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Un plan anual sin matrices es contexto opcional, no un error.

    Los instrumentos sí necesitan los criterios del origen, así que para ellos
    el documento sin matrices sigue siendo un 422.
    """
    generated = WorkflowGenerationResponse(
        **_instrument_artifact(["Criterio redactado sin origen."]).model_dump(),
        model="gemini-test",
    )
    monkeypatch.setattr(
        "app.modules.ai.router.generate_workflow_artifact",
        AsyncMock(return_value=generated),
    )

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner = await _register_and_login(client, "cadena-sin-matrices@example.edu")
        created = await client.post(
            "/api/v1/documents",
            headers=owner,
            json={
                "title": "Plan curricular anual 2026",
                "document_type": "planificamos/plan-curricular-anual",
                "content": "…",
                "metadata": {"fields": {"curricular_area": "Matemática"}},
            },
        )
        assert created.status_code == 201, created.text
        document_id = created.json()["id"]

        instrument = _instrument_payload(document_id).model_dump(mode="json", exclude_none=True)
        blocked = await client.post(
            "/api/v1/ai/tools/workflow/generate", headers=owner, json=instrument
        )
        crossword = await client.post(
            "/api/v1/ai/tools/workflow/generate",
            headers=owner,
            json={
                **instrument,
                "tool_id": "crucigramas",
                "module": "recursos",
                "tool_title": "Crucigrama",
                "artifact_type": "recurso",
            },
        )

    assert blocked.status_code == 422, blocked.text
    assert crossword.status_code == 200, crossword.text
