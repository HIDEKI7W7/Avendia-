import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlmodel import select, func, and_
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import text

from src.config.database import get_session
from src.auth.dependencies import RoleChecker
from src.models.user import User, UserRole
from src.models.document import Document
from src.models.ai_log import AILog
from src.models.payment_transaction import PaymentTransaction, PaymentStatus, PaymentMethod

router = APIRouter()

# Proteger todo el enrutador con rol ADMIN
admin_protector = RoleChecker([UserRole.ADMIN])

# Esquemas de respuesta
class FinancialKPIs(BaseModel):
    total_recaudado: float
    pendiente: float
    total_transacciones: int
    ticket_promedio: float

class TransactionDetail(BaseModel):
    id: uuid.UUID
    created_at: datetime
    amount: float
    payment_method: str
    status: str
    user_name: str
    user_email: str
    user_credits: int
    user_credits_total: int

class DashboardResponse(BaseModel):
    kpis: FinancialKPIs
    transactions: List[TransactionDetail]

class UserKPIs(BaseModel):
    total_docentes: int
    total_creditos_activos: int
    total_docs_generados: int
    costo_estimado_ia: float

class UserDetail(BaseModel):
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

class UsersAnalyticsResponse(BaseModel):
    kpis: UserKPIs
    users: List[UserDetail]

class DocumentMiniSchema(BaseModel):
    id: uuid.UUID
    title: str
    document_type: str
    created_at: datetime

@router.get("/analytics/dashboard", response_model=DashboardResponse)
async def get_dashboard_analytics(
    start_date: Optional[str] = Query(None, description="Fecha inicio YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Fecha fin YYYY-MM-DD"),
    session: AsyncSession = Depends(get_session),
    _current_user: User = Depends(admin_protector)
):
    """
    Retorna agregaciones financieras y las últimas transacciones,
    filtrado opcionalmente por rango de fechas.
    """
    # Construir condiciones de fecha
    conditions = []
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            conditions.append(PaymentTransaction.created_at >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato start_date inválido. Use YYYY-MM-DD")
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
            conditions.append(PaymentTransaction.created_at <= end_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato end_date inválido. Use YYYY-MM-DD")

    # KPIs Financieros
    # Total Recaudado (completed)
    q_recaudado = select(func.sum(PaymentTransaction.amount)).where(PaymentTransaction.status == PaymentStatus.COMPLETED)
    if conditions:
        q_recaudado = q_recaudado.where(and_(*conditions))
    res_recaudado = await session.execute(q_recaudado)
    total_recaudado = res_recaudado.scalar() or 0.0

    # Pendiente
    q_pendiente = select(func.sum(PaymentTransaction.amount)).where(PaymentTransaction.status == PaymentStatus.PENDING)
    if conditions:
        q_pendiente = q_pendiente.where(and_(*conditions))
    res_pendiente = await session.execute(q_pendiente)
    pendiente = res_pendiente.scalar() or 0.0

    # Total Transacciones
    q_trans = select(func.count(PaymentTransaction.id))
    if conditions:
        q_trans = q_trans.where(and_(*conditions))
    res_trans = await session.execute(q_trans)
    total_transacciones = res_trans.scalar() or 0

    # Ticket Promedio
    q_avg = select(func.avg(PaymentTransaction.amount)).where(PaymentTransaction.status == PaymentStatus.COMPLETED)
    if conditions:
        q_avg = q_avg.where(and_(*conditions))
    res_avg = await session.execute(q_avg)
    ticket_promedio = res_avg.scalar() or 0.0

    # Lista de Transacciones (Ordenadas por fecha desc)
    q_list = select(PaymentTransaction, User).join(User, PaymentTransaction.user_id == User.id)
    if conditions:
        q_list = q_list.where(and_(*conditions))
    q_list = q_list.order_by(PaymentTransaction.created_at.desc()).limit(100)
    res_list = await session.execute(q_list)
    rows = res_list.all()

    transactions_list = []
    for trans, user in rows:
        transactions_list.append(
            TransactionDetail(
                id=trans.id,
                created_at=trans.created_at,
                amount=trans.amount,
                payment_method=trans.payment_method.value,
                status=trans.status.value,
                user_name=user.full_name,
                user_email=user.email,
                user_credits=user.credits,
                user_credits_total=user.credits_total
            )
        )

    return DashboardResponse(
        kpis=FinancialKPIs(
            total_recaudado=round(total_recaudado, 2),
            pendiente=round(pendiente, 2),
            total_transacciones=total_transacciones,
            ticket_promedio=round(ticket_promedio, 2)
        ),
        transactions=transactions_list
    )


@router.get("/analytics/users", response_model=UsersAnalyticsResponse)
async def get_users_analytics(
    filter_type: Optional[str] = Query(None, alias="filter", description="Filtro rápido: actives_today, low_credits, critical_consumption"),
    session: AsyncSession = Depends(get_session),
    _current_user: User = Depends(admin_protector)
):
    """
    Retorna los KPIs del sistema y la lista detallada de usuarios docentes
    según el filtro seleccionado.
    """
    # 1. KPIs Globales del Sistema
    res_docentes = await session.execute(select(func.count(User.id)).where(User.role == UserRole.DOCENTE))
    total_docentes = res_docentes.scalar() or 0

    res_creds = await session.execute(select(func.sum(User.credits)).where(User.role == UserRole.DOCENTE))
    total_creditos_activos = res_creds.scalar() or 0

    res_docs = await session.execute(select(func.count(Document.id)))
    total_docs_generados = res_docs.scalar() or 0

    res_costo = await session.execute(select(func.sum(AILog.cost_soles)))
    costo_estimado_ia = res_costo.scalar() or 0.0

    # 2. Consultar todos los docentes para calcular los acumulados
    # Nota: Hacemos consultas de agregación separadas o en Python de forma controlada
    # para evitar COUNT/SUM masivos sobre tablas de producción si crecieran exponencialmente.
    # Como es un admin dashboard, estructuramos consultas de apoyo eficientes.
    users_query = select(User).where(User.role != UserRole.ADMIN)

    # Aplicar filtros
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    
    if filter_type == "actives_today":
        # Activos hoy: generaron documento o entraron al sistema hoy
        users_query = users_query.where(
            and_(
                User.last_access >= today_start,
                User.status == "activo"
            )
        )
    elif filter_type == "low_credits":
        # Créditos bajos: menos de 200 créditos
        users_query = users_query.where(User.credits < 200)
    elif filter_type == "critical_consumption":
        # Consumo crítico: consumieron más de S/. 5.00 en IA en los últimos 7 días
        seven_days_ago = now - timedelta(days=7)
        # Subquery de usuarios con consumo crítico
        subq = (
            select(AILog.user_id)
            .where(AILog.created_at >= seven_days_ago)
            .group_by(AILog.user_id)
            .having(func.sum(AILog.cost_soles) >= 5.0)
        )
        users_query = users_query.where(User.id.in_(subq))

    res_users = await session.execute(users_query)
    users_list = res_users.scalars().all()

    # Pre-cargar agregaciones agrupadas por usuario para evitar consultas N+1
    # Monto pagado completado por usuario
    res_paid = await session.execute(
        select(PaymentTransaction.user_id, func.sum(PaymentTransaction.amount))
        .where(PaymentTransaction.status == PaymentStatus.COMPLETED)
        .group_by(PaymentTransaction.user_id)
    )
    paid_map = {row[0]: row[1] for row in res_paid.all()}

    # Consumo de IA en soles por usuario
    res_ai_cons = await session.execute(
        select(AILog.user_id, func.sum(AILog.cost_soles))
        .group_by(AILog.user_id)
    )
    ai_cons_map = {row[0]: row[1] for row in res_ai_cons.all()}

    # Documentos totales por usuario
    res_docs_total = await session.execute(
        select(Document.user_id, func.count(Document.id))
        .group_by(Document.user_id)
    )
    docs_total_map = {row[0]: row[1] for row in res_docs_total.all()}

    # Documentos generados hoy por usuario
    res_docs_today = await session.execute(
        select(Document.user_id, func.count(Document.id))
        .where(Document.created_at >= today_start)
        .group_by(Document.user_id)
    )
    docs_today_map = {row[0]: row[1] for row in res_docs_today.all()}

    detailed_users = []
    for u in users_list:
        detailed_users.append(
            UserDetail(
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
                consumo_ia_soles=round(ai_cons_map.get(u.id, 0.0), 2),
                docs_total=docs_total_map.get(u.id, 0),
                docs_hoy=docs_today_map.get(u.id, 0)
            )
        )

    # Ordenar por fecha de creación desc
    detailed_users.sort(key=lambda x: x.created_at, reverse=True)

    return UsersAnalyticsResponse(
        kpis=UserKPIs(
            total_docentes=total_docentes,
            total_creditos_activos=total_creditos_activos,
            total_docs_generados=total_docs_generados,
            costo_estimado_ia=round(costo_estimado_ia, 2)
        ),
        users=detailed_users
    )


@router.get("/users/{user_id}/activity", response_model=List[DocumentMiniSchema])
async def get_user_activity(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _current_user: User = Depends(admin_protector)
):
    """
    Retorna la lista de documentos generados por un docente específico.
    """
    result = await session.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        DocumentMiniSchema(
            id=d.id,
            title=d.title,
            document_type=d.document_type,
            created_at=d.created_at
        )
        for d in docs
    ]


class AdjustCreditsPayload(BaseModel):
    amount: int

@router.post("/users/{user_id}/credits")
async def adjust_user_credits(
    user_id: uuid.UUID,
    payload: AdjustCreditsPayload,
    session: AsyncSession = Depends(get_session),
    _current_user: User = Depends(admin_protector)
):
    """
    Modifica los créditos de un docente de forma atómica en base de datos.
    Soporta valores positivos y negativos.
    """
    # Comprobar que el usuario exista
    res_user = await session.execute(select(User).where(User.id == user_id))
    user = res_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Ejecutar UPDATE atómico directo en SQL para evitar condiciones de carrera (race conditions)
    await session.execute(
        text("UPDATE users SET credits = GREATEST(0, credits + :amount), credits_total = GREATEST(0, credits_total + :amount) WHERE id = :id"),
        {"amount": payload.amount, "id": user_id}
    )
    await session.commit()

    # Recargar usuario para responder con el nuevo valor
    await session.refresh(user)
    return {
        "status": "success",
        "message": f"Créditos ajustados correctamente. Nuevos créditos: {user.credits}",
        "credits": user.credits,
        "credits_total": user.credits_total
    }


@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    _current_user: User = Depends(admin_protector)
):
    """
    Cambia el estado del usuario de activo a suspendido, o viceversa.
    """
    res_user = await session.execute(select(User).where(User.id == user_id))
    user = res_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_status = "suspendido" if user.status == "activo" else "activo"
    user.status = new_status
    session.add(user)
    await session.commit()

    return {
        "status": "success",
        "message": f"Estado del usuario actualizado a: {new_status}",
        "new_status": new_status
    }
