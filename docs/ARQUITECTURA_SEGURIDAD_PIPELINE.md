# Documento Técnico: Arquitectura de Seguridad, Pipeline y Persistencia UZDI

**Autor:** Paúl Rosero (Backend Core & Arquitectura)  
**Proyecto:** UZDI - Sistema de Gestión Integral de Medidas Socioeducativas  
**Versión API:** 1.0.0  
**Fecha:** Noviembre 2026  

---

## 1. Justificación Arquitectónica: Modelo de Conexión a Base de Datos vs RBAC

Durante la revisión técnica se planteó la siguiente interrogante arquitectónica:
> *¿Por qué el backend utiliza una única conexión administrativa a PostgreSQL (`uzdi_user`) en lugar de crear un usuario de base de datos por cada usuario humano del sistema?*

### Fundamentos Técnicos:
1. **Connection Pooling y Escalabilidad:**
   - La arquitectura de NestJS con TypeORM maneja un grupo de conexiones concurrentes (*Pool de Conexiones*). Abrir una conexión TCP/TLS por cada usuario humano saturaría rápidamente los límites de memoria y conexiones simultáneas de PostgreSQL (`max_connections`).
2. **Desacoplamiento de Capas:**
   - En aplicaciones empresariales modernas, la autenticación y autorización se resuelven a nivel de la capa de aplicación (*Application-Level Authorization*). La base de datos almacena los permisos (`seguridad.prms`, `seguridad.rol_prms`), pero no gestiona sesiones ni tokens criptográficos.
3. **Auditoría Transaccional Contextual:**
   - Aunque la base de datos se conecta con `uzdi_user`, las operaciones quedan auditadas con el ID del usuario real gracias a los decoradores `@Auditoria()` y a la lectura del JWT firmado, guardando en `seguridad.historial` el usuario exacto, la IP y la máquina cliente.

---

## 2. Pipeline Secuencial de Peticiones HTTP en NestJS

Toda petición dirigida a `https://uzdi-backend-api.onrender.com/api/v1/*` atraviesa una secuencia determinística de procesamiento:

```
[ Cliente HTTP (Frontend Vue 3 / Postman) ]
                    │
                    ▼  (Petición con cabecera Authorization: Bearer <JWT>)
┌────────────────────────────────────────────────────────┐
│ 1. JwtAuthGuard (Passport JWT Strategy)                │
│    - Extrae y valida criptográficamente el token       │
│    - Si es ruta pública (@Public), continúa directo    │
│    - Si el token expiró o la firma es inválida: HTTP 401
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. RolesGuard (RBAC Basado en BD)                      │
│    - Lee los roles requeridos definidos en decorador   │
│    - Evalúa el perfil y permisos activos del usuario   │
│    - Si no tiene permisos suficientes: HTTP 403        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. ValidationPipe Global (class-validator)             │
│    - whitelist: true (descarta campos no permitidos)   │
│    - transform: true (castea tipos según DTO)          │
│    - Si los datos son inválidos: HTTP 400 con detalle  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Controlador (Controller) & Inyección de Dependencias│
│    - Mapea el verbo HTTP y ruta                        │
│    - Invoca al Servicio correspondiente                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 5. Servicio de Negocio (Service) + TypeORM             │
│    - Ejecuta reglas de negocio y validaciones          │
│    - Realiza transacciones hacia PostgreSQL            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 6. Auditoría Automática (seguridad.historial)          │
│    - Registra INSERT/UPDATE/DELETE con usuario_id real │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 7. Interceptor Global (ResponseTransformInterceptor)   │
│    - Estandariza la respuesta:                         │
│      { ok: true, message: "...", data: { ... } }       │
└────────────────────────────────────────────────────────┘
```

---

## 3. Estándar Oficial de Respuestas JSON

Para evitar redundancias observadas por el docente (donde el campo `path` no aportaba valor en respuestas exitosas pero sí en trazabilidad de errores):

### Respuesta Exitosa (200 / 201 OK):
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": { ... },
  "timestamp": "2026-11-14T00:52:57.812Z"
}
```

### Respuesta de Error (400 / 401 / 403 / 404 / 500):
```json
{
  "ok": false,
  "statusCode": 403,
  "message": "Acceso denegado. Permisos insuficientes para esta operación.",
  "errors": null,
  "path": "/api/v1/adolescente",
  "timestamp": "2026-11-14T00:52:35.828Z"
}
```
*El campo `path` se conserva exclusivamente en los payloads de error para permitir al equipo de Frontend y monitoreo correlacionar incidencias con la ruta exacta de la solicitud.*

---

## 4. Ciclo de Vida y Seguridad del JWT

1. **Emisión (`POST /api/v1/auth/login`):**
   - Se valida el usuario y hash bcrypt en `seguridad.prsn`.
   - Se consulta el rol y perfil activo (`rol_codigo`, `prfl_id`).
   - Se genera un token HMAC-SHA256 con tiempo de vida (TTL) de 8 horas (`8h`).
2. **Payload Estructurado del Token:**
   ```json
   {
     "sub": 1,
     "username": "admin",
     "email": "admin@uzdi.local",
     "prfl_id": 1,
     "rol": "Administrador",
     "rol_codigo": "ADM",
     "sesion_id": 35,
     "iat": 1794617565,
     "exp": 1794646365
   }
   ```
3. **Consumo Seguro:**
   - Debe enviarse en el encabezado `Authorization: Bearer <token>`.
   - Toda solicitud sin cabecera o con firma inválida es rechazada de inmediato en el paso 1 del pipeline.
