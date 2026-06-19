#!/bin/sh

# Salir inmediatamente si algún comando retorna un código de error distinto a cero
set -e

echo "[ENTRYPOINT] Iniciando la preparación del ecosistema backend..."

# La base de datos ya fue inicializada y sembrada desde la terminal de forma externa
# Para acelerar el inicio en Render y evitar fallos en la detección de puertos, no lo ejecutamos en el entrypoint
echo "[ENTRYPOINT] Omitiendo init_db_prod.py en el arranque del contenedor."

echo "[ENTRYPOINT] Base de datos lista. Arrancando el servidor ASGI con 4 workers..."

# 2. Iniciar el servidor web Uvicorn optimizado para producción reemplazando el proceso actual (PID 1)
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
