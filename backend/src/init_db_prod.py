import asyncio
import sys
from src.config.database import init_db

async def run_migrations_with_retry():
    print("[INFO] Iniciando script de migración y preparación RAG...")
    retries = 20
    delay = 3
    
    for attempt in range(1, retries + 1):
        try:
            print(f"[INFO] Intentando conectar a la base de datos (Intento {attempt}/{retries})...")
            # Ejecutar init_db que crea la extensión vector y las tablas
            await init_db()
            print("[SUCCESS] Base de datos inicializada: Extensión vector y tablas creadas exitosamente.")
            return
        except Exception as e:
            print(f"[WARN] Error al conectar a la base de datos: {str(e)}")
            if attempt < retries:
                print(f"[INFO] Reintentando en {delay} segundos...")
                await asyncio.sleep(delay)
            else:
                print("[ERROR] Se agotaron los reintentos de conexión. La inicialización falló.")
                sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_migrations_with_retry())
