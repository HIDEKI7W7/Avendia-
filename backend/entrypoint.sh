#!/bin/sh

# Salir inmediatamente si algún comando retorna un código de error distinto a cero
set -e

echo "[ENTRYPOINT] Iniciando la preparación del ecosistema backend..."

# 1. Ejecutar el script único de migración e inicialización de la base de datos (con reintentos)
python src/init_db_prod.py

echo "[ENTRYPOINT] Base de datos lista. Arrancando el servidor ASGI con 4 workers..."

# 2. Iniciar el servidor web Uvicorn optimizado para producción reemplazando el proceso actual (PID 1)
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
