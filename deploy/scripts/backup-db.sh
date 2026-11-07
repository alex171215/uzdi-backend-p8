#!/usr/bin/env bash
# Respaldo comprimido de la BD UZDI. Conserva los últimos N días.
# Docker : MODO=docker ./deploy/scripts/backup-db.sh
# Nativo : MODO=nativo DATABASE_URL=postgresql://... ./deploy/scripts/backup-db.sh
# Cron diario 02:30 → 30 2 * * * MODO=docker /opt/uzdi/uzdi-backend-p8/deploy/scripts/backup-db.sh
set -euo pipefail

MODO="${MODO:-docker}"
DESTINO="${DESTINO:-/var/backups/uzdi}"
DIAS="${DIAS:-14}"
FECHA="$(date +%Y%m%d_%H%M%S)"
ARCHIVO="$DESTINO/uzdi_db_$FECHA.sql.gz"

mkdir -p "$DESTINO"
if [ "$MODO" = "docker" ]; then
  docker exec uzdi_db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' | gzip > "$ARCHIVO"
else
  : "${DATABASE_URL:?Defina DATABASE_URL}"
  pg_dump "$DATABASE_URL" --no-owner | gzip > "$ARCHIVO"
fi

find "$DESTINO" -name 'uzdi_db_*.sql.gz' -mtime +"$DIAS" -delete
echo "Respaldo creado: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"
