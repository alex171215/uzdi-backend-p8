# Guía de Instalación y Despliegue en Servidores Linux — Backend UZDI

**Sistema de Gestión Integral UZDI (SNAI – PUCE)** · API REST NestJS 11 + PostgreSQL
**Responsable:** Alejandro Flores · Tarea 5.1
**Sistemas probados:** Ubuntu Server 22.04 / 24.04 LTS, Debian 12

---

## Índice

1. [Arquitectura del despliegue](#1-arquitectura-del-despliegue)
2. [Requisitos previos](#2-requisitos-previos)
3. [Preparación del servidor (común a ambas opciones)](#3-preparación-del-servidor-común-a-ambas-opciones)
4. [Opción 1 — Despliegue con Docker y Docker Compose](#4-opción-1--despliegue-con-docker-y-docker-compose-recomendada)
5. [Opción 2 — Despliegue nativo (Node.js + PM2 + PostgreSQL + Nginx)](#5-opción-2--despliegue-nativo-nodejs--pm2--postgresql--nginx)
6. [Nginx como proxy inverso y HTTPS](#6-nginx-como-proxy-inverso-y-https)
7. [Primer ingreso y seguridad inicial](#7-primer-ingreso-y-seguridad-inicial)
8. [Verificación del despliegue](#8-verificación-del-despliegue)
9. [Logs y diagnóstico de problemas](#9-logs-y-diagnóstico-de-problemas)
10. [Respaldo y restauración de la base de datos](#10-respaldo-y-restauración-de-la-base-de-datos)
11. [Actualización a una nueva versión](#11-actualización-a-una-nueva-versión)
12. [Anexo: archivos de despliegue del repositorio](#12-anexo-archivos-de-despliegue-del-repositorio)

---

## 1. Arquitectura del despliegue

```
   Frontend (navegador)
          │  HTTPS 443 / HTTP 80
          ▼
 ┌──────────────────────┐
 │ Nginx (proxy inverso)│  ← único servicio expuesto a la red
 └─────────┬────────────┘
           │ http://127.0.0.1:3000
           ▼
 ┌──────────────────────┐        ┌────────────────────────┐
 │ API NestJS (Node 20) │──────▶ │ PostgreSQL 15          │
 │ /api/v1  /api/docs   │  5432  │ esquemas DDL v8        │
 └──────────────────────┘ local  └────────────────────────┘
```

- La API **solo escucha en localhost**; Nginx la publica.
- PostgreSQL **nunca** se expone a Internet.
- La base se inicializa con dos scripts, en este orden:
  1. `Back Ecologia (1).sql` → DDL v8 (esquemas, tablas, triggers, catálogos).
  2. `db/02_seguridad_rbac.sql` → tabla persona-perfil (`seguridad.prpf`), usuario administrador inicial y matriz RBAC (`seguridad.accn` / `seguridad.prms`).

---

## 2. Requisitos previos

### 2.1 Hardware mínimo

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disco | 20 GB | 40 GB SSD (BD + respaldos) |

### 2.2 Software

| Componente | Versión | Opción 1 (Docker) | Opción 2 (Nativo) |
|---|---|:---:|:---:|
| Ubuntu Server / Debian | 22.04+ / 12 | ✔ | ✔ |
| Docker Engine + Compose v2 | 24+ | ✔ | — |
| Node.js | 20 LTS | (dentro del contenedor) | ✔ |
| PostgreSQL | 15 | (dentro del contenedor) | ✔ |
| PM2 | 5+ | — | ✔ |
| Nginx | 1.18+ | ✔ | ✔ |
| Git | cualquiera | ✔ | ✔ |

### 2.3 Puertos

| Puerto | Servicio | Abierto a la red |
|---|---|---|
| 22 | SSH (administración) | Sí, idealmente solo IP institucional |
| 80 | HTTP (Nginx) | Sí |
| 443 | HTTPS (Nginx) | Sí |
| 3000 | API NestJS | **No**, solo `127.0.0.1` |
| 5432 | PostgreSQL | **No**, solo `127.0.0.1` |

### 2.4 Variables de entorno

| Variable | Obligatoria | Ejemplo | Descripción |
|---|:---:|---|---|
| `DATABASE_URL` | ✔ | `postgresql://uzdi:clave@localhost:5432/uzdi_db` | Conexión a PostgreSQL |
| `JWT_SECRET` | ✔ | salida de `openssl rand -hex 32` | Firma de los tokens. **En producción la API no arranca sin ella** |
| `PORT` | | `3000` | Puerto de la API |
| `NODE_ENV` | ✔ | `production` | Activa las políticas estrictas de CORS |
| `CORS_ORIGIN` | | `https://uzdi.ejemplo.gob.ec` | Orígenes del frontend permitidos, separados por coma |

---

## 3. Preparación del servidor (común a ambas opciones)

```bash
# 3.1 Actualizar el sistema y zona horaria
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone America/Guayaquil
sudo apt install -y git curl ca-certificates ufw

# 3.2 Usuario de servicio (no usar root para la aplicación)
sudo adduser --disabled-password --gecos "" uzdi
sudo usermod -aG sudo uzdi

# 3.3 Firewall: solo SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status

# 3.4 Descargar el código
sudo mkdir -p /opt/uzdi && sudo chown uzdi:uzdi /opt/uzdi
sudo -iu uzdi
cd /opt/uzdi
git clone https://github.com/alex171215/uzdi-backend-p8.git
cd uzdi-backend-p8
git checkout main
```

---

## 4. Opción 1 — Despliegue con Docker y Docker Compose (recomendada)

### 4.1 Instalar Docker Engine

```bash
# Repositorio oficial de Docker (Ubuntu; en Debian cambiar "ubuntu" por "debian")
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permitir al usuario uzdi usar docker (cerrar y abrir sesión después)
sudo usermod -aG docker uzdi
docker --version && docker compose version
```

### 4.2 Configurar variables de producción

```bash
cd /opt/uzdi/uzdi-backend-p8
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

Generar los secretos y pegarlos en el archivo:

```bash
openssl rand -hex 24   # → POSTGRES_PASSWORD
openssl rand -hex 32   # → JWT_SECRET
chmod 600 deploy/.env.production
```

### 4.3 Construir y levantar

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build
```

En el **primer arranque** PostgreSQL ejecuta automáticamente el DDL v8 y `db/02_seguridad_rbac.sql`. La API espera a que la base esté `healthy` antes de iniciar.

### 4.4 Comprobar estado

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production ps
# Ambos contenedores deben decir (healthy)

curl -s http://127.0.0.1:3000/api/v1
# {"ok":true,"message":"Operación realizada correctamente","data":"Hello World!",...}
```

### 4.5 Comandos de operación

| Acción | Comando |
|---|---|
| Ver logs de la API | `docker logs -f uzdi_api` |
| Ver logs de la BD | `docker logs -f uzdi_db` |
| Reiniciar la API | `docker restart uzdi_api` |
| Detener todo | `docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production down` |
| Consola SQL | `docker exec -it uzdi_db psql -U uzdi -d uzdi_db` |

> ⚠️ `down -v` **borra el volumen de la base de datos**. Úselo solo si quiere reinstalar desde cero.

Los contenedores tienen `restart: unless-stopped`, así que vuelven a levantarse solos tras un reinicio del servidor.

Continúe en la sección [6. Nginx](#6-nginx-como-proxy-inverso-y-https).

---

## 5. Opción 2 — Despliegue nativo (Node.js + PM2 + PostgreSQL + Nginx)

### 5.1 Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential   # build-essential: compila bcrypt
node -v   # v20.x
```

### 5.2 Instalar PostgreSQL 15

```bash
# Repositorio oficial PGDG
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo $VERSION_CODENAME)-pgdg main" \
  | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update && sudo apt install -y postgresql-15
sudo systemctl enable --now postgresql
```

PostgreSQL escucha por defecto solo en `localhost`; **no** cambie `listen_addresses`.

### 5.3 Crear base de datos y usuario

```bash
sudo -u postgres psql <<'SQL'
CREATE USER uzdi WITH PASSWORD 'CAMBIAR_clave_segura_bd';
CREATE DATABASE uzdi_db OWNER uzdi;
SQL
```

### 5.4 Cargar el esquema (DDL v8 + seguridad RBAC)

```bash
cd /opt/uzdi/uzdi-backend-p8
export DATABASE_URL='postgresql://uzdi:CAMBIAR_clave_segura_bd@localhost:5432/uzdi_db'

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "Back Ecologia (1).sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/02_seguridad_rbac.sql
```

El segundo script muestra al final cuántos permisos tiene cada perfil (ADM 108, CORD 43, LEGAL 37…). Es **idempotente**: puede ejecutarse otra vez sin duplicar datos.

### 5.5 Compilar la API

```bash
cd /opt/uzdi/uzdi-backend-p8
npm ci
npm run build
npm prune --omit=dev     # deja solo dependencias de producción
```

### 5.6 Archivo `.env`

```bash
cat > .env <<EOF
DATABASE_URL=postgresql://uzdi:CAMBIAR_clave_segura_bd@localhost:5432/uzdi_db
PORT=3000
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://uzdi.ejemplo.gob.ec
EOF
chmod 600 .env
```

### 5.7 PM2 como gestor de procesos

```bash
sudo npm install -g pm2
sudo mkdir -p /var/log/uzdi && sudo chown uzdi:uzdi /var/log/uzdi

pm2 start deploy/ecosystem.config.js
pm2 status                      # uzdi-api → online
pm2 save                        # recordar procesos
pm2 startup systemd -u uzdi --hp /home/uzdi
# Copiar y ejecutar con sudo el comando que imprime pm2 startup
```

| Acción | Comando |
|---|---|
| Ver logs | `pm2 logs uzdi-api` |
| Reiniciar | `pm2 restart uzdi-api` |
| Monitor | `pm2 monit` |
| Detener | `pm2 stop uzdi-api` |

---

## 6. Nginx como proxy inverso y HTTPS

```bash
sudo apt install -y nginx
sudo cp /opt/uzdi/uzdi-backend-p8/deploy/nginx/uzdi-api.conf /etc/nginx/sites-available/uzdi-api
sudo nano /etc/nginx/sites-available/uzdi-api      # cambiar server_name por el dominio o la IP
sudo ln -s /etc/nginx/sites-available/uzdi-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS con Let's Encrypt (si el servidor tiene dominio público)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.uzdi.ejemplo.gob.ec
# Certbot configura la redirección 80 → 443 y la renovación automática
sudo certbot renew --dry-run
```

En una red interna sin dominio, use el certificado que provea el área de TI institucional.

---

## 7. Primer ingreso y seguridad inicial

El script `db/02_seguridad_rbac.sql` crea un administrador inicial:

| Usuario | Contraseña inicial | Perfil |
|---|---|---|
| `admin` | `Admin.Uzdi2026` | ADM (Administrador) |

**Cambie la contraseña inmediatamente:**

```bash
API=https://api.uzdi.ejemplo.gob.ec/api/v1

TOKEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"login":"admin","password":"Admin.Uzdi2026"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

curl -s -X POST $API/auth/change-password -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"Admin.Uzdi2026","newPassword":"NUEVA_CLAVE_SEGURA"}'
```

Después cree los usuarios reales. Cada usuario debe tener un tipo de persona y al menos un perfil (RF-12 antes de RF-01):

```bash
curl -s -X POST $API/users -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{
  "nombres":"María","apellidos":"López","correo":"mlopez@uzdi.gob.ec",
  "login":"mlopez","password":"Clave.Inicial1","tppr_id":1,"perfiles_ids":[3]
}'
```

Los permisos de cada perfil se administran en `/api/v1/permiso` y se aplican al instante, sin reiniciar el servidor. Ver `docs/SEGURIDAD_RBAC.md`.

---

## 8. Verificación del despliegue

El repositorio trae un script de verificación:

```bash
cd /opt/uzdi/uzdi-backend-p8
# Desde el propio servidor
./deploy/scripts/verificar.sh
# Contra el dominio público, probando también el login
API=https://api.uzdi.ejemplo.gob.ec ADMIN_PASS='NUEVA_CLAVE_SEGURA' ./deploy/scripts/verificar.sh
```

Salida esperada:

```
Verificando http://localhost:3000
  ✔ API responde (GET /api/v1)
  ✔ Swagger disponible (/api/docs)
  ✔ Ruta protegida sin token → 401
  ✔ Login de administrador
  ✔ Ruta protegida con token → 200
  ✔ Matriz RBAC cargada (/perfil/1/permisos)
Resultado: 6 correctas, 0 con error
```

Comprobaciones manuales adicionales:

```bash
sudo ss -tlnp | grep -E ':80|:443|:3000|:5432'   # 3000 y 5432 deben estar en 127.0.0.1
curl -I http://localhost/api/docs                 # a través de Nginx → 200
```

---

## 9. Logs y diagnóstico de problemas

| Dónde | Docker | Nativo |
|---|---|---|
| API | `docker logs -f uzdi_api` | `pm2 logs uzdi-api` · `/var/log/uzdi/` |
| PostgreSQL | `docker logs -f uzdi_db` | `sudo journalctl -u postgresql -f` |
| Nginx | `/var/log/nginx/uzdi-api.*.log` | igual |
| Auditoría de datos | `GET /api/v1/historial` (perfil ADM/CORD) | igual |
| Sesiones activas | `GET /api/v1/sesion?activas=true` | igual |

| Síntoma | Causa probable | Solución |
|---|---|---|
| La API no arranca: `JWT_SECRET es obligatorio en producción` | Falta `JWT_SECRET` | Definirla en `.env` o `deploy/.env.production` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL apagado o `DATABASE_URL` incorrecta | `systemctl status postgresql` / revisar URL |
| `relation "seguridad.prpf" does not exist` | No se ejecutó `db/02_seguridad_rbac.sql` | Ejecutarlo (sección 5.4) |
| Login responde 403 "no tiene perfiles asignados" | Usuario sin filas en `seguridad.prpf` | `PUT /api/v1/users/:id/perfiles` |
| Todas las rutas dan 401 tras iniciar sesión | La sesión fue cerrada o el usuario fue desactivado | Iniciar sesión nuevamente |
| 403 "no tiene habilitada la acción …" | El perfil no tiene ese permiso en `seguridad.prms` | Otorgarlo con `POST /api/v1/permiso` |
| 502 Bad Gateway en Nginx | La API no está corriendo | `pm2 status` / `docker ps` |
| Error de CORS en el navegador | Origen del frontend no permitido | Agregarlo en `CORS_ORIGIN` y reiniciar |
| Docker no ejecutó los scripts SQL | El volumen ya existía | Los scripts solo corren con volumen vacío; ejecutarlos a mano con `docker exec -i uzdi_db psql ...` |

---

## 10. Respaldo y restauración de la base de datos

### 10.1 Respaldo manual

```bash
# Docker
MODO=docker ./deploy/scripts/backup-db.sh
# Nativo
MODO=nativo DATABASE_URL='postgresql://uzdi:...@localhost:5432/uzdi_db' ./deploy/scripts/backup-db.sh
```

Genera `/var/backups/uzdi/uzdi_db_AAAAMMDD_HHMMSS.sql.gz` y borra los respaldos de más de 14 días (variable `DIAS`).

### 10.2 Respaldo automático diario (cron)

```bash
sudo mkdir -p /var/backups/uzdi && sudo chown uzdi:uzdi /var/backups/uzdi
crontab -e
# Todos los días a las 02:30
30 2 * * * MODO=docker /opt/uzdi/uzdi-backend-p8/deploy/scripts/backup-db.sh >> /var/log/uzdi/backup.log 2>&1
```

Se recomienda copiar periódicamente `/var/backups/uzdi` a otro servidor o almacenamiento institucional.

### 10.3 Restaurar

```bash
# Detener la API para que nadie escriba durante la restauración
docker stop uzdi_api            # o: pm2 stop uzdi-api

# Docker
gunzip -c /var/backups/uzdi/uzdi_db_20261107_023000.sql.gz | \
  docker exec -i uzdi_db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
# Nativo (sobre una base vacía recién creada)
gunzip -c /var/backups/uzdi/uzdi_db_20261107_023000.sql.gz | psql "$DATABASE_URL"

docker start uzdi_api           # o: pm2 start uzdi-api
```

---

## 11. Actualización a una nueva versión

```bash
cd /opt/uzdi/uzdi-backend-p8
MODO=docker ./deploy/scripts/backup-db.sh        # 1. Respaldo previo SIEMPRE
git pull origin main                             # 2. Traer cambios

# 3a. Docker
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build

# 3b. Nativo
npm ci && npm run build && npm prune --omit=dev && pm2 restart uzdi-api

# 4. Si hubo cambios en db/02_seguridad_rbac.sql (es idempotente)
psql "$DATABASE_URL" -f db/02_seguridad_rbac.sql

./deploy/scripts/verificar.sh                    # 5. Verificar
```

---

## 12. Anexo: archivos de despliegue del repositorio

| Archivo | Uso |
|---|---|
| `Dockerfile` | Imagen multi-etapa de la API (Node 20 Alpine) |
| `.dockerignore` | Evita copiar `node_modules`, `.env` y `.git` a la imagen |
| `docker-compose.yml` | Solo PostgreSQL, para **desarrollo local** |
| `deploy/docker-compose.prod.yml` | API + PostgreSQL para **producción** |
| `deploy/.env.production.example` | Plantilla de variables de producción |
| `deploy/ecosystem.config.js` | Configuración de PM2 (despliegue nativo) |
| `deploy/nginx/uzdi-api.conf` | Sitio Nginx (proxy inverso) |
| `deploy/scripts/verificar.sh` | Pruebas rápidas post-despliegue |
| `deploy/scripts/backup-db.sh` | Respaldo con rotación |
| `Back Ecologia (1).sql` | DDL v8 |
| `db/02_seguridad_rbac.sql` | Persona-perfil, admin inicial y matriz RBAC |
| `render.yaml` | Despliegue alternativo en Render.com (nube) |

> **Validación:** el despliegue con Docker de esta guía se probó de punta a punta (base creada desde cero con ambos scripts, contenedores `healthy`, `verificar.sh` 6/6 y respaldo generado).
