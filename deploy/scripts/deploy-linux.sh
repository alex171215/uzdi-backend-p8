#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado para Linux (Ubuntu / Debian / RHEL)
# Sistema UZDI - Backend API & Base de Datos PostgreSQL
# Autor: Paúl Rosero (Backend Core)
# ==============================================================================

set -e

echo "🚀 [UZDI] Iniciando proceso de despliegue en servidor Linux..."

# 1. Verificar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado en este sistema."
    echo "👉 Instale Docker ejecutando: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose (plugin) no está disponible."
    exit 1
fi

echo "✅ Docker y Docker Compose detectados."

# 2. Configurar variables de entorno
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${DEPLOY_DIR}/.." && pwd)"

ENV_FILE="${DEPLOY_DIR}/.env.production"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️ Archivo .env.production no encontrado. Creando a partir de la plantilla..."
    cp "${DEPLOY_DIR}/.env.production.example" "$ENV_FILE"
    echo "🔑 Generando clave secreta para JWT_SECRET..."
    RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    sed -i "s/cambiar_por_clave_secreta_fuerte/${RANDOM_SECRET}/g" "$ENV_FILE"
    echo "ℹ️ Se generó un archivo .env.production base. Si requiere cambiar contraseñas de BD, edítelo en: $ENV_FILE"
fi

# 3. Construir y levantar contenedores
echo "📦 Construyendo imágenes Docker y levantando servicios (PostgreSQL + NestJS API)..."
docker compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" --env-file "$ENV_FILE" down --remove-orphans || true
docker compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" --env-file "$ENV_FILE" up -d --build

echo "⏳ Esperando inicialización del contenedor de base de datos y healthcheck..."
sleep 10

# 4. Verificar salud del servicio
echo "🔍 Comprobando estado de los servicios..."
docker compose -f "${DEPLOY_DIR}/docker-compose.prod.yml" ps

echo "=============================================================================="
echo "🎉 ¡Despliegue completado exitosamente!"
echo "📍 API disponible internamente en: http://127.0.0.1:3000/api/v1"
echo "📖 Swagger Docs: http://127.0.0.1:3000/api/docs"
echo "🩺 Health Check: http://127.0.0.1:3000/api/v1/health"
echo "=============================================================================="
