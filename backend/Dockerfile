FROM python:3.11-slim

WORKDIR /app

# Configurar variables de entorno para evitar prompts interactivos
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Instalar dependencias con -y y limpiar la caché en la misma capa para reducir peso
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de configuración del proyecto
COPY pyproject.toml .

# Instalar dependencias directamente desde el pip cache
RUN pip install --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn[standard]>=0.28.0" \
    "sqlmodel>=0.0.16" \
    "pgvector>=0.2.5" \
    "pydantic-settings>=2.2.0" \
    "asyncpg>=0.29.0" \
    "bcrypt>=4.1.0" \
    "pyjwt>=2.8.0" \
    "openai>=1.12.0" \
    "pypdf>=4.0.0" \
    "google-generativeai>=0.8.0" \
    "email-validator>=2.0.0" \
    "python-docx" \
    "python-multipart"

# Copiar el código fuente del backend
COPY src/ ./src/

# Configurar PYTHONPATH para que se resuelvan las importaciones de src.* correctamente
ENV PYTHONPATH=/app

# Copiar y configurar el script de entrada seguro
COPY entrypoint.sh .
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

# Exponer el puerto del API
EXPOSE 8000

# Usar el script de entrada seguro como punto de inicio por defecto
ENTRYPOINT ["./entrypoint.sh"]
