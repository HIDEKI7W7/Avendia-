from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from src.config.database import get_session
from src.auth.dependencies import RoleChecker
from src.models.user import UserRole
from src.chatbot.search import retrieve_relevant_context
from src.chatbot.service import generate_bot_response

router = APIRouter()

# Esquemas de entrada y salida
class ChatMessageSchema(BaseModel):
    sender: str  # "user" o "bot"
    content: str

class ChatbotRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessageSchema]] = []

class ChatbotResponse(BaseModel):
    response: str
    sources: List[str]

@router.post("/ask", response_model=ChatbotResponse, status_code=status.HTTP_200_OK)
async def ask_chatbot(
    payload: ChatbotRequest,
    session: AsyncSession = Depends(get_session),
    _current_user = Depends(RoleChecker([
        UserRole.DOCENTE,
        UserRole.DIRECTOR,
        UserRole.AUXILIAR,
        UserRole.ADMIN
    ]))
):
    """
    Endpoint protegido para usuarios escolares autenticados.
    Recibe la consulta del usuario, recupera el contexto semántico de pgvector y
    retorna la respuesta de la IA sustentada por fuentes.
    """
    # 1. Recuperar contexto y fuentes desde pgvector
    try:
        context, sources = await retrieve_relevant_context(
            query_text=payload.message,
            session=session,
            limit=3
        )
    except Exception as e:
        import logging
        logging.error(f"Error de base de datos en endpoint /ask: {e}")
        print(f"Error de base de datos en endpoint /ask: {e}")
        context = ""
        sources = []
    
    # 2. Formatear historial para el formato de dict que espera el servicio
    history_dicts = [
        {"sender": msg.sender, "content": msg.content}
        for msg in payload.history
    ]
    
    # 3. Consultar respuesta de EduAsesor
    bot_reply = await generate_bot_response(
        user_message=payload.message,
        context=context,
        history=history_dicts
    )
    
    return {
        "response": bot_reply,
        "sources": sources
    }
