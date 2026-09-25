#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE DESPLIEGUE AUTOMATIZADO - BACKEND AVENDIA 3.0 EN VPS
# ==============================================================================
# Ejecutar en el servidor VPS (Ubuntu / Debian):
#   chmod +x scripts/deploy-vps-backend.sh
#   sudo ./scripts/deploy-vps-backend.sh
# ==============================================================================

set -euo pipefail

# Colores para la terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   AVENDIA 3.0 - DESPLIEGUE DEL BACKEND EN VPS        ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verificar privilegios de root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Este script debe ejecutarse como root o con sudo.${NC}"
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# 2. Instalar Docker y dependencias si no existen
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Docker Engine y Docker Compose...${NC}"
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker instalado correctamente.${NC}"
else
    echo -e "${GREEN}✅ Docker ya está instalado.${NC}"
fi

# 3. Instalar Nginx y Certbot si no existen
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🌐 Instalando Nginx y Certbot para HTTPS/SSL...${NC}"
    apt-get update -y
    apt-get install -y nginx certbot python3-certbot-nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✅ Nginx instalado.${NC}"
fi

# 4. Verificar archivo de configuración .env
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️ No se encontró .env. Creando desde .env.production.example...${NC}"
    if [ -f "$APP_DIR/.env.production.example" ]; then
        cp "$APP_DIR/.env.production.example" "$APP_DIR/.env"
        echo -e "${GREEN}✅ Archivo .env generado. Recuerda revisar POSTGRES_PASSWORD y JWT_SECRET_KEY si deseas personalizarlos.${NC}"
    else
        echo -e "${RED}❌ Falta .env.production.example en el proyecto.${NC}"
        exit 1
    fi
fi

# 5. Levantar contenedores Docker (PostgreSQL + FastAPI con LibreOffice)
echo -e "${BLUE}🐳 Compilando e iniciando servicios en Docker (PostgreSQL 17 + FastAPI)...${NC}"
docker compose -f docker-compose.backend.yml down --remove-orphans || true
docker compose -f docker-compose.backend.yml up -d --build

# 6. Esperar a que la base de datos y la API estén listas
echo -e "${YELLOW}⏳ Esperando a que el backend inicialice las migraciones y el usuario administrador...${NC}"
MAX_RETRIES=30
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -fsS http://127.0.0.1:8000/api/v1/health &> /dev/null; then
        HEALTHY=true
        break
    fi
    sleep 2
    COUNT=$((COUNT + 1))
    echo -n "."
done
echo ""

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ Backend en ejecución y saludable en http://127.0.0.1:8000${NC}"
else
    echo -e "${RED}❌ El backend no respondió a tiempo. Verificando logs del contenedor:${NC}"
    docker logs avendia-api --tail 40
    exit 1
fi

# 7. Configuración de Nginx
echo -e "${BLUE}🔧 Verificando configuración de Nginx...${NC}"
if [ -f "$APP_DIR/nginx/avendia-api.conf" ]; then
    cp "$APP_DIR/nginx/avendia-api.conf" /etc/nginx/sites-available/avendia-api
    if [ ! -f /etc/nginx/sites-enabled/avendia-api ]; then
        ln -s /etc/nginx/sites-available/avendia-api /etc/nginx/sites-enabled/
    fi
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✅ Configuración de Nginx aplicada.${NC}"
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🎉 ¡DESPLIEGUE DEL BACKEND COMPLETADO CON ÉXITO!     ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Información de servicio:"
echo -e "  • API Interna:  http://127.0.0.1:8000/api/v1/health"
echo -e "  • Base de datos: PostgreSQL 17 (pgvector) puerto interno 5432"
echo -e "  • Usuario Admin: admin@avendia.com / Avendia2026!"
echo -e ""
echo -e "Pasos siguientes para SSL y Vercel:"
echo -e "  1. Configura tu dominio en /etc/nginx/sites-available/avendia-api"
echo -e "  2. Genera el certificado SSL gratuito: certbot --nginx -d tu-dominio.com"
echo -e "  3. En Vercel, define la variable de entorno: VITE_API_URL=https://tu-dominio.com/api/v1"
