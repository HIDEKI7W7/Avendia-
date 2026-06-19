import asyncio
from typing import List, Dict
import google.generativeai as genai
from src.config.settings import settings

# Configurar API de Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_bot_response(
    user_message: str,
    context: str,
    history: List[Dict[str, str]]
) -> str:
    """
    Genera la respuesta del chatbot EduAsesor utilizando el modelo
    de Google 'gemini-1.5-flash' e inyectando las instrucciones del sistema.
    """
    # Fallback para desarrollo sin clave real
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock-gemini-key":
        return (
            f"[EduAsesor - Gemini local]: Hola. De acuerdo con el contexto de normativas indexadas, "
            f"he analizado tu duda sobre '{user_message}'. Te sugiero rellenar la plantilla de informe "
            f"y remitirla a secretaría."
        )

    if not context or not context.strip():
        system_instruction = (
            "Tu nombre es 'EduAsesor', un asistente de inteligencia artificial experto en normativa, "
            "leyes y reglamentación del sector educativo peruano. Tu misión es responder consultas de "
            "Docentes, Directores y Auxiliares de forma clara, estructurada y empática.\n\n"
            "Dado que no se ha encontrado información específica en la base de conocimientos local, "
            "responde la consulta del usuario utilizando tu conocimiento general sobre la normativa educativa peruana. "
            "Aclara al inicio de forma sutil que responderás basándote en la normativa general de educación."
        )
    else:
        system_instruction = (
            "Tu nombre es 'EduAsesor', un asistente de inteligencia artificial experto en normativa, "
            "leyes y reglamentación del sector educativo peruano. Tu misión es responder consultas de "
            "Docentes, Directores y Auxiliares de forma clara, estructurada (usando viñetas si ayuda a leer) "
            "y empática.\n\n"
            "REGLAS DE COMPORTAMIENTO:\n"
            "1. Basa tu respuesta ÚNICAMENTE en la información provista en el [CONTEXTO].\n"
            "2. Si la respuesta no se encuentra detallada en el contexto, indícalo amablemente diciendo que "
            "no dispones de la información de esa directiva en tu base de conocimientos actual. NO inventes datos, nombres ni fechas.\n\n"
            f"[CONTEXTO]:\n{context}"
        )

    # Formatear el historial de chat para el SDK de Google Gemini
    # Estructura: [{'role': 'user', 'parts': [...]}, {'role': 'model', 'parts': [...]}]
    formatted_history = []
    for chat_msg in history:
        # Google espera 'model' en lugar de 'assistant'/'bot'
        role = "model" if chat_msg.get("sender") == "bot" else "user"
        formatted_history.append({
            "role": role,
            "parts": [chat_msg.get("content", "")]
        })

    try:
        # Configurar el modelo con instrucciones del sistema
        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            system_instruction=system_instruction
        )
        
        loop = asyncio.get_running_loop()
        
        # Levantar sesión de chat con el historial estructurado
        chat = model.start_chat(history=formatted_history)
        
        # Ejecutar en el executor para no bloquear el bucle de eventos
        response = await loop.run_in_executor(
            None,
            chat.send_message,
            user_message
        )
        
        return response.text or "No he recibido texto de respuesta."
        
    except Exception as e:
        return f"Disculpa, ocurrió un error al contactar al motor Gemini de Google: {str(e)}"
