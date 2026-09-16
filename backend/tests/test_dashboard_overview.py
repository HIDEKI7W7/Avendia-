from datetime import date, timedelta

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import session_factory
from app.main import app
from app.modules.admin.model import DEFAULT_YEAR_MOTTO, PlatformSettings
from app.modules.admin.service import get_platform_settings


async def _register_and_login(client: AsyncClient, email: str) -> dict[str, str]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Docente Panel",
            "password": "secure-password",
            "dre": "DRE Lima",
            "ugel": "UGEL 03",
            "school_name": "I.E. Panel",
            "director_name": "Directora Panel",
            "education_modality": "EBR",
            "education_level": "Primaria",
            "grade": "4° de Primaria",
            "section": "A",
            "curricular_area": "Matemática",
            "school_year": 2026,
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "secure-password"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_dashboard_overview_aggregates_owned_documents_and_upcoming_events() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _register_and_login(client, "overview@example.com")
        other_headers = await _register_and_login(client, "overview-other@example.com")
        await client.post(
            "/api/v1/documents",
            headers=headers,
            json={
                "title": "Examen de aritmética",
                "document_type": "examen",
                "content": "Preguntas de aritmética",
                "metadata_json": {"source_route": "/dashboard/evaluamos/examen"},
            },
        )
        await client.post(
            "/api/v1/documents",
            headers=other_headers,
            json={"title": "Documento ajeno", "document_type": "rubrica-evaluacion"},
        )
        event_date = date.today() + timedelta(days=2)
        event = await client.post(
            "/api/v1/calendar/events",
            headers=headers,
            json={
                "title": "Revisar evaluación",
                "event_date": event_date.isoformat(),
                "event_type": "planificacion",
            },
        )

        response = await client.get("/api/v1/dashboard/overview", headers=headers)

        assert response.status_code == 200
        payload = response.json()
        assert payload["document_count"] == 1
        assert payload["recent_documents"][0]["title"] == "Examen de aritmética"
        assert payload["most_used_tool_ids"] == ["examen"]
        assert payload["notifications"][0]["id"] == f"event-{event.json()['id']}"
        assert f"month={event_date.month}" in payload["notifications"][0]["path"]


@pytest.mark.asyncio
async def test_document_branding_exposes_the_year_motto_to_teachers() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _register_and_login(client, "branding@example.edu")
        anonymous = await client.get("/api/v1/dashboard/branding")
        initial = await client.get("/api/v1/dashboard/branding", headers=headers)

        async with session_factory() as db:
            settings = await get_platform_settings(db)
            settings.year_motto = "“Año del Bicentenario”"
            await db.commit()

        updated = await client.get("/api/v1/dashboard/branding", headers=headers)

    assert anonymous.status_code == 401
    assert initial.status_code == 200
    assert initial.json() == {"year_motto": DEFAULT_YEAR_MOTTO}
    assert updated.json() == {"year_motto": "“Año del Bicentenario”"}
    async with session_factory() as db:
        stored = await db.get(PlatformSettings, 1)
        assert stored is not None and stored.year_motto == "“Año del Bicentenario”"
