from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class DashboardRecentDocument(BaseModel):
    id: UUID
    title: str
    status: str
    path: str
    updated_at: datetime


class DashboardNotification(BaseModel):
    id: str
    message: str
    path: str
    event_date: date | None = None


class DashboardOverview(BaseModel):
    document_count: int
    recent_documents: list[DashboardRecentDocument]
    most_used_tool_ids: list[str]
    notifications: list[DashboardNotification]
    generated_at: datetime


class DocumentBranding(BaseModel):
    """Elementos comunes de cabecera de los Word que fija administración."""

    year_motto: str
