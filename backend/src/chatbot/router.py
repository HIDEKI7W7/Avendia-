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
    Recibe la consulta del usuario, intenta recuperar el contexto semántico de pgvector,
    y si la base de datos falla o no responde, aplica una contingencia directa con Gemini.
    """
    try:
        # 1. Intentar flujo RAG normal con pgvector
        context, sources = await retrieve_relevant_context(
            query_text=payload.message,
            session=session,
            limit=3
        )
        
        history_dicts = [
            {"sender": msg.sender, "content": msg.content}
            for msg in payload.history
        ]
        
        bot_reply = await generate_bot_response(
            user_message=payload.message,
            context=context,
            history=history_dicts
        )
        return {
            "response": bot_reply,
            "sources": sources
        }
    except Exception as db_error:
        # 2. Si la DB parpadea, muere o no conecta, el bypass entra al rescate
        import logging
        logging.error(f"⚠️ Alerta RAG inactivo, aplicando contingencia: {db_error}")
        print(f"⚠️ Alerta RAG inactivo, aplicando contingencia: {db_error}")
        
        try:
            history_dicts = [
                {"sender": msg.sender, "content": msg.content}
                for msg in payload.history
            ]
            # Bypass directo a Gemini (contexto vacío forzará la respuesta general en service.py)
            respuesta_general = await generate_bot_response(
                user_message=payload.message,
                context="",
                history=history_dicts
            )
            return {
                "response": respuesta_general,
                "sources": []
            }
        except Exception as gemini_error:
            logging.error(f"Error de contingencia Gemini: {gemini_error}")
            print(f"Error de contingencia Gemini: {gemini_error}")
            # Solo si Google también se cae, devolvemos un mensaje limpio de mantenimiento
            return {
                "response": "Hola. Estoy experimentando una breve interrupción en mis servicios de IA. Por favor, intenta de nuevo en unos instantes.",
                "sources": []
            }
