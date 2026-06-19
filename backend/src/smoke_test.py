import asyncio
import urllib.request
import json
import sys
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import google.generativeai as genai

from src.config.settings import settings
from src.config.database import async_session_maker
from src.models.user import User
from src.models.vector_knowledge import LegalEmbedding

async def check_health_endpoint() -> bool:
    try:
        url = "http://localhost:8000/health"
        print(f"[INFO] 1/4 Verificando endpoint de salud en {url}...")
        
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = json.loads(response.read().decode())
            
            if status == 200 and body.get("status") == "healthy":
                print("🟢 [SUCCESS] El backend está activo y saludable.")
                return True
            else:
                print(f"🔴 [ERROR] Respuesta de salud inesperada. Status: {status}, Body: {body}")
                return False
    except Exception as e:
        print(f"🔴 [ERROR] Falló la conexión HTTP al backend: {str(e)}")
        return False

async def check_db_connection() -> bool:
    try:
        print("[INFO] 2/4 Verificando conexión básica a PostgreSQL...")
        async with async_session_maker() as session:
            statement = select(User).limit(1)
            result = await session.execute(statement)
            result.scalars().first()
            print("🟢 [SUCCESS] Conexión a PostgreSQL establecida y consulta básica ejecutada con éxito.")
            return True
    except Exception as e:
        print(f"🔴 [ERROR] Falló la conexión o consulta en PostgreSQL: {str(e)}")
        return False

async def check_pgvector_syntax() -> bool:
    try:
        print("[INFO] 3/4 Verificando sintaxis vectorial de pgvector...")
        async with async_session_maker() as session:
            # Crear un vector simulado de 768 dimensiones rellenado con 0.0
            mock_vector = [0.0] * 768
            statement = (
                select(LegalEmbedding)
                .order_by(LegalEmbedding.embedding.cosine_distance(mock_vector))
                .limit(1)
            )
            await session.execute(statement)
            print("🟢 [SUCCESS] Sintaxis de ordenamiento vectorial en pgvector verificada con éxito.")
            return True
    except Exception as e:
        print(f"🔴 [ERROR] Falló la verificación de operadores vectoriales en PostgreSQL: {str(e)}")
        return False

async def check_gemini_api() -> bool:
    try:
        print("[INFO] 4/4 Verificando conectividad y credenciales de Google Gemini API...")
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock-gemini-key" or not settings.GEMINI_API_KEY.startswith("AIzaSy"):
            print("🟡 [WARN] API Key de Gemini ausente, simulada o de desarrollo (no comienza con 'AIzaSy'). Saltando prueba real.")
            return True
            
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-3.5-flash")
        
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content("OK")
        )
        
        if response.text:
            print("🟢 [SUCCESS] Conexión establecida con Gemini API y generación de contenido exitosa.")
            return True
        else:
            print("🔴 [ERROR] Respuesta vacía de la API de Gemini.")
            return False
            
    except Exception as e:
        print(f"🔴 [ERROR] Falló la llamada a la API de Google Gemini: {str(e)}")
        return False

async def main():
    print("="*60)
    print("   INICIANDO PRUEBA DE HUMO (SMOKE TEST) - AVENDIA PRODUCTION   ")
    print("="*60)
    
    health_ok = await check_health_endpoint()
    print("-" * 50)
    db_ok = await check_db_connection()
    print("-" * 50)
    vector_ok = await check_pgvector_syntax()
    print("-" * 50)
    gemini_ok = await check_gemini_api()
    print("="*60)
    
    if health_ok and db_ok and vector_ok and gemini_ok:
        print("🎉 [INFO] ¡SISTEMA 100% SALUDABLE Y LISTO PARA OPERAR EN PRODUCCIÓN! 🎉")
        sys.exit(0)
    else:
        print("❌ [ERROR] Fallaron algunas pruebas de sanidad. Revisa los logs. ❌")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
