#!/usr/bin/env bash
# Verificación rápida de un despliegue UZDI.
#   ./deploy/scripts/verificar.sh                         → http://localhost:3000
#   API=https://api.uzdi.ejemplo.gob.ec ./deploy/scripts/verificar.sh
#   ADMIN_PASS='...' ./deploy/scripts/verificar.sh          → prueba también el login
set -uo pipefail
API="${API:-http://localhost:3000}"
ok=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "  ✔ $1"; ok=$((ok+1)); else echo "  ✘ $1 (esperado $3, obtenido $2)"; fail=$((fail+1)); fi; }

echo "Verificando $API"
check "API responde (GET /api/v1)"            "$(curl -s -o /dev/null -w '%{http_code}' "$API/api/v1")" 200
check "Swagger disponible (/api/docs)"         "$(curl -s -o /dev/null -w '%{http_code}' "$API/api/docs")" 200
check "Ruta protegida sin token → 401"         "$(curl -s -o /dev/null -w '%{http_code}' "$API/api/v1/users")" 401

if [ -n "${ADMIN_PASS:-}" ]; then
  TOKEN=$(curl -s -X POST "$API/api/v1/auth/login" -H 'Content-Type: application/json' \
    -d "{\"login\":\"${ADMIN_USER:-admin}\",\"password\":\"$ADMIN_PASS\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  check "Login de administrador"               "$([ -n "$TOKEN" ] && echo si || echo no)" si
  check "Ruta protegida con token → 200"       "$(curl -s -o /dev/null -w '%{http_code}' "$API/api/v1/users" -H "Authorization: Bearer $TOKEN")" 200
  check "Matriz RBAC cargada (/perfil/1/permisos)" "$(curl -s -o /dev/null -w '%{http_code}' "$API/api/v1/perfil/1/permisos" -H "Authorization: Bearer $TOKEN")" 200
  [ -n "$TOKEN" ] && curl -s -o /dev/null -X POST "$API/api/v1/auth/logout" -H "Authorization: Bearer $TOKEN"
fi

echo "Resultado: $ok correctas, $fail con error"
[ "$fail" -eq 0 ]
