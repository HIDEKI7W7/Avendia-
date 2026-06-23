import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlmodel import select, func, and_
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import text

from src.config.database import get_session
from src.auth.dependencies import RoleChecker, verificar_admin
from src.models.user import User, UserRole
from src.models.document import Document
from src.models.ai_log import AILog
from src.models.payment_transaction import PaymentTransaction, PaymentStatus, PaymentMethod

router = APIRouter()

# ── Protector global RBAC: solo ADMIN accede a cualquier endpoint ──────────
# verificar_admin is imported from dependencies


# ═══════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

class FinanceKPIs(BaseModel):
    total_recaudado: float
    pendiente: float
    transacciones: int
    promedio: float

class TransactionRow(BaseModel):
    id: uuid.UUID
    created_at: datetime
    amount: float
    payment_method: str
    status: str
    user_name: str
    user_email: str
    user_credits: int
    user_credits_total: int

class FinanceDashboardResponse(BaseModel):
    kpis: FinanceKPIs
    transactions: List[TransactionRow]

# ─── Users ─────────────────────────────────────────────────────────────────

class SystemKPIs(BaseModel):
    docentes_totales: int
    creditos_sistema: int
    docs_generados: int
    inversion_ia_soles: float

class UserRow(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str
    status: str
    credits: int
    credits_total: int
    created_at: datetime
    created_by: str
    areas: int
    last_access: Optional[datetime] = None
    monto_pagado: float
    consumo_ia_soles: float
    docs_total: int
    docs_hoy: int

class UsersDashboardResponse(BaseModel):
    kpis: SystemKPIs
    users: List[UserRow]

class AdjustCreditsPayload(BaseModel):
    amount: int

class DocumentMini(BaseModel):
    id: uuid.UUID
    title: str
    document_type: str
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# TAREA 1-A: GET /finance/dashboard
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/finance/dashboard",
    response_model=FinanceDashboardResponse,
    summary="KPIs financieros y listado de transacciones paginado",
)
async def get_finance_dashboard(
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date:   Optional[str] = Query(None, description="YYYY-MM-DD"),
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    # ── Construir filtros de fecha ──────────────────────────────────────────
    conditions = []
    if start_date:
        try:
            conditions.append(PaymentTransaction.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        except ValueError:
            raise HTTPException(400, "start_date inválido. Use YYYY-MM-DD")
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
            conditions.append(PaymentTransaction.created_at <= end_dt)
        except ValueError:
            raise HTTPException(400, "end_date inválido. Use YYYY-MM-DD")

    def apply(q):
        return q.where(and_(*conditions)) if conditions else q

    # ── KPIs ───────────────────────────────────────────────────────────────
    total_recaudado = (await session.execute(
        apply(select(func.sum(PaymentTransaction.amount))
              .where(PaymentTransaction.status == PaymentStatus.COMPLETED))
    )).scalar() or 0.0

    pendiente = (await session.execute(
        apply(select(func.sum(PaymentTransaction.amount))
              .where(PaymentTransaction.status == PaymentStatus.PENDING))
    )).scalar() or 0.0

    transacciones = (await session.execute(
        apply(select(func.count(PaymentTransaction.id)))
    )).scalar() or 0

    promedio = (await session.execute(
        apply(select(func.avg(PaymentTransaction.amount))
              .where(PaymentTransaction.status == PaymentStatus.COMPLETED))
    )).scalar() or 0.0

    # ── Listado de transacciones ────────────────────────────────────────────
    q_rows = (
        apply(select(PaymentTransaction, User).join(User, PaymentTransaction.user_id == User.id))
        .order_by(PaymentTransaction.created_at.desc())
        .limit(200)
    )
    rows = (await session.execute(q_rows)).all()

    return FinanceDashboardResponse(
        kpis=FinanceKPIs(
            total_recaudado=round(total_recaudado, 2),
            pendiente=round(pendiente, 2),
            transacciones=transacciones,
            promedio=round(promedio, 2),
        ),
        transactions=[
            TransactionRow(
                id=t.id,
                created_at=t.created_at,
                amount=t.amount,
                payment_method=t.payment_method.value,
                status=t.status.value,
                user_name=u.full_name,
                user_email=u.email,
                user_credits=u.credits,
                user_credits_total=u.credits_total,
            )
            for t, u in rows
        ],
    )


# ═══════════════════════════════════════════════════════════════════════════
# TAREA 1-B: GET /users/dashboard
# ═══════════════════════════════════════════════════════════════════════════

FILTER_MAP = {
    "actives_today": "actives_today",
    "low_credits":   "low_credits",
    "no_credits":    "no_credits",
    "critical":      "critical",
}

@router.get(
    "/users/dashboard",
    response_model=UsersDashboardResponse,
    summary="KPIs del sistema y lista de usuarios docentes con filtros",
)
async def get_users_dashboard(
    filter: Optional[str] = Query(None, description="actives_today | low_credits | no_credits | critical"),
    q:      Optional[str] = Query(None, description="Búsqueda libre (nombre, email, teléfono)"),
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    # ── KPIs globales ──────────────────────────────────────────────────────
    docentes_totales = (await session.execute(
        select(func.count(User.id)).where(User.role == UserRole.DOCENTE)
    )).scalar() or 0

    creditos_sistema = (await session.execute(
        select(func.sum(User.credits)).where(User.role != UserRole.ADMIN)
    )).scalar() or 0

    docs_generados = (await session.execute(
        select(func.count(Document.id))
    )).scalar() or 0

    inversion_ia_soles = (await session.execute(
        select(func.sum(AILog.cost_soles))
    )).scalar() or 0.0

    # ── Lista de usuarios ──────────────────────────────────────────────────
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)

    users_q = select(User).where(User.role != UserRole.ADMIN)

    # Aplicar filtros de píldora
    if filter == "actives_today":
        users_q = users_q.where(
            and_(User.last_access >= today_start, User.status == "activo")
        )
    elif filter == "low_credits":
        users_q = users_q.where(and_(User.credits > 0, User.credits < 200))
    elif filter == "no_credits":
        users_q = users_q.where(User.credits == 0)
    elif filter == "critical":
        seven_ago = now - timedelta(days=7)
        subq = (
            select(AILog.user_id)
            .where(AILog.created_at >= seven_ago)
            .group_by(AILog.user_id)
            .having(func.sum(AILog.cost_soles) >= 5.0)
        )
        users_q = users_q.where(User.id.in_(subq))

    # Búsqueda libre
    if q and q.strip():
        term = f"%{q.strip()}%"
        users_q = users_q.where(
            (User.full_name.ilike(term)) |
            (User.email.ilike(term)) |
            (User.phone.ilike(term))
        )

    users_list = (await session.execute(users_q)).scalars().all()

    # ── Agregaciones por usuario (bulk, sin N+1) ───────────────────────────
    paid_map = {
        r[0]: r[1]
        for r in (await session.execute(
            select(PaymentTransaction.user_id, func.sum(PaymentTransaction.amount))
            .where(PaymentTransaction.status == PaymentStatus.COMPLETED)
            .group_by(PaymentTransaction.user_id)
        )).all()
    }
    ai_map = {
        r[0]: r[1]
        for r in (await session.execute(
            select(AILog.user_id, func.sum(AILog.cost_soles)).group_by(AILog.user_id)
        )).all()
    }
    docs_total_map = {
        r[0]: r[1]
        for r in (await session.execute(
            select(Document.user_id, func.count(Document.id)).group_by(Document.user_id)
        )).all()
    }
    docs_today_map = {
        r[0]: r[1]
        for r in (await session.execute(
            select(Document.user_id, func.count(Document.id))
            .where(Document.created_at >= today_start)
            .group_by(Document.user_id)
        )).all()
    }

    users_out = sorted(
        [
            UserRow(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                phone=u.phone,
                status=u.status,
                credits=u.credits,
                credits_total=u.credits_total,
                created_at=u.created_at,
                created_by=u.created_by,
                areas=u.areas,
                last_access=u.last_access,
                monto_pagado=round(paid_map.get(u.id, 0.0), 2),
                consumo_ia_soles=round(ai_map.get(u.id, 0.0), 2),
                docs_total=docs_total_map.get(u.id, 0),
                docs_hoy=docs_today_map.get(u.id, 0),
            )
            for u in users_list
        ],
        key=lambda x: x.created_at,
        reverse=True,
    )

    return UsersDashboardResponse(
        kpis=SystemKPIs(
            docentes_totales=docentes_totales,
            creditos_sistema=int(creditos_sistema),
            docs_generados=docs_generados,
            inversion_ia_soles=round(float(inversion_ia_soles), 2),
        ),
        users=users_out,
    )


# ═══════════════════════════════════════════════════════════════════════════
# TAREA 1-C: POST /users/{user_id}/adjust-credits
# ═══════════════════════════════════════════════════════════════════════════

@router.post(
    "/users/{user_id}/adjust-credits",
    summary="Ajuste atómico de créditos de un docente",
)
async def adjust_credits(
    user_id: uuid.UUID,
    payload: AdjustCreditsPayload,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    res = await session.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    # UPDATE atómico para prevenir race conditions
    await session.execute(
        text(
            "UPDATE users "
            "SET credits       = GREATEST(0, credits + :amount), "
            "    credits_total = GREATEST(0, credits_total + :amount) "
            "WHERE id = :id"
        ),
        {"amount": payload.amount, "id": str(user_id)},
    )
    await session.commit()
    await session.refresh(user)

    return {
        "status": "success",
        "credits": user.credits,
        "credits_total": user.credits_total,
        "message": f"Créditos ajustados. Nuevo saldo: {user.credits}",
    }


# ═══════════════════════════════════════════════════════════════════════════
# GET /users/{user_id}/activity  (mantener compatibilidad)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/users/{user_id}/activity",
    response_model=List[DocumentMini],
    summary="Documentos generados por un docente",
)
async def get_user_activity(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    docs = (await session.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
    )).scalars().all()

    return [
        DocumentMini(id=d.id, title=d.title, document_type=d.document_type, created_at=d.created_at)
        for d in docs
    ]


# ═══════════════════════════════════════════════════════════════════════════
# Rutas legacy (redireccionadas para no romper el admin panel existente)
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/analytics/dashboard", include_in_schema=False)
async def legacy_finance(
    start_date: Optional[str] = None,
    end_date:   Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    return await get_finance_dashboard(start_date, end_date, session, _)


@router.get("/analytics/users", include_in_schema=False)
async def legacy_users(
    filter: Optional[str] = None,
    q:      Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    return await get_users_dashboard(filter, q, session, _)


@router.post("/users/{user_id}/credits", include_in_schema=False)
async def legacy_adjust(
    user_id: uuid.UUID,
    payload: AdjustCreditsPayload,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(verificar_admin),
):
    return await adjust_credits(user_id, payload, session, _)
