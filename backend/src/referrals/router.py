import secrets
import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.models.referral import ReferralRecord, WalletTransaction, ReferralStatus

router = APIRouter()

# Helper para formatear fechas en español
SPANISH_MONTHS = {
    1: "enero", 2: "febrero", 3: "marzo", 4: "abril",
    5: "mayo", 6: "junio", 7: "julio", 8: "agosto",
    9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"
}

def format_spanish_date(dt) -> str:
    if not dt:
        return ""
    return f"{dt.day} de {SPANISH_MONTHS.get(dt.month, '')} de {dt.year}"

@router.get("/track/{code}")
async def track_referral(
    code: str,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    """
    Endpoint intermedio de rastreo. Valida el código y deposita una 
    cookie persistente de 30 días en el navegador del invitado.
    """
    query = select(User).where(User.referral_code == code)
    result = await session.execute(query)
    referrer = result.scalar_one_or_none()
    
    if not referrer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código de referido no válido."
        )
    
    # Inyectar cookie segura con expiración para atribuciones diferidas
    response.set_cookie(
        key="ref_token",
        value=code,
        max_age=30 * 24 * 60 * 60,  # 30 días
        httponly=True,
        samesite="lax",
        secure=False  # Permite pruebas en desarrollo local sin HTTPS
    )
    return {"status": "success", "message": "Código de referido asociado correctamente."}

@router.get("/me")
async def get_my_referral_data(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Obtiene estadísticas de referidos e historial de movimientos de la billetera.
    """
    # Consulta de transacciones de billetera del usuario
    tx_query = (
        select(WalletTransaction)
        .where(WalletTransaction.user_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
    )
    tx_result = await session.execute(tx_query)
    transactions = tx_result.scalars().all()
                     
    # Obtener lista de invitados
    ref_records_query = (
        select(ReferralRecord)
        .where(ReferralRecord.referrer_id == current_user.id)
        .order_by(ReferralRecord.created_at.desc())
    )
    ref_records_result = await session.execute(ref_records_query)
    ref_records = ref_records_result.scalars().all()
    invited_count = len(ref_records)
    
    return {
        "referral_code": current_user.referral_code,
        "credits": current_user.credits,
        "invited_count": invited_count,
        "transactions": [
            {
                "id": str(t.id),
                "amount": t.amount,
                "description": t.description,
                "created_at": format_spanish_date(t.created_at)
            } for t in transactions
        ],
        "invited_list": [
            {
                "email": r.referred_email,
                "status": r.status,
                "created_at": format_spanish_date(r.created_at)
            } for r in ref_records
        ]
    }

