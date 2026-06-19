from contextlib import asynccontextmanager
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

from src.config.settings import settings
from src.config.database import init_db
from src.auth.router import router as auth_router
from src.rag.router import router as rag_router
from src.chatbot.router import router as chatbot_router
from src.documents.router import router as documents_router
from src.admin.router import router as admin_router

async def verify_gemini_connection() -> None:
    """
    Intenta una llamada de validación asíncrona rápida al SDK de Gemini
    para reportar el estado de las credenciales de la API.
    """
    try:
        # Validar si existe una API key configurada
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock-gemini-key":
            print("[WARN] GEMINI_API_KEY no declarada en el entorno. Saltando validación de conectividad real.")
            return

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        loop = asyncio.get_running_loop()
        
        # Ejecutar llamada ligera a la API en el pool de hilos
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content("Responde únicamente con la palabra OK si estás activo.")
        )
        
        res_text = (response.text or "").strip().upper()
        if "OK" in res_text:
            print("[INFO] Conexión con Google Gemini API establecida correctamente.")
        else:
            print(f"[WARN] Conexión con Gemini exitosa pero respuesta inesperada: '{res_text}'")
            
    except Exception as e:
        print(f"[ERROR] Fallo al establecer conexión con la API de Google Gemini: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manejador del ciclo de vida de la aplicación.
    Valida el estado de la API Key de Gemini en el arranque.
    """
    # Validar que la API Key de Gemini funcione
    await verify_gemini_connection()
    yield

# Inicializamos FastAPI
app = FastAPI(
    title="AVENDIA API",
    description="Backend asíncrono de AVENDIA - Generación inteligente de documentos y motor RAG con Gemini",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS
allowed_origins = [
    origin.strip()
    for origin in settings.ALLOWED_ORIGINS.split(",")
    if origin.strip()
]
allowed_origins.append("https://frontend-theta-red-11.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Registro de enrutadores
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(rag_router, prefix="/api/v1/rag", tags=["Motor RAG"])
app.include_router(chatbot_router, prefix="/api/v1/chatbot", tags=["Chatbot Inteligente (EduAsesor)"])
app.include_router(documents_router, prefix="/api/v1/documents", tags=["Generación de Documentos (.docx)"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Administración"])

@app.get("/health", tags=["Salud"])
async def health_check():
    """
    Endpoint base para comprobar la salud e integridad del servidor backend.
    """
    return {
        "status": "healthy",
        "project": "AVENDIA API"
    }

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
