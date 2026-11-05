# UZDI_BACK — Backend NestJS

API REST del Sistema de Gestión Integral UZDI. Construida con NestJS 11 y TypeORM sobre PostgreSQL.

---

## Stack

| Dependencia | Rol |
| --- | --- |
| NestJS 11 + TypeScript 5.7 | Framework modular para el servidor |
| TypeORM | ORM para PostgreSQL con entidades decoradas |
| PostgreSQL | Base de datos relacional |
| bcrypt | Hash de contraseñas |
| class-validator | Validación declarativa de DTOs |
| class-transformer | Transformación de payloads |
| DOMPurify + jsdom | Sanitización de inputs de texto (SanitizationPipe) |

---

## Estructura

```text
src/
├── main.ts                             # Bootstrap: prefix /api/v1, ValidationPipe, SanitizationPipe
├── app.module.ts                       # Módulo raíz con TypeORM y todos los módulos de dominio
├── app.controller.ts                   # GET / → health check
│
├── auth/                               # Autenticación
│   ├── auth.controller.ts              # POST /api/v1/auth/login, /auth/change-password
│   ├── auth.service.ts                 # Validación de credenciales con bcrypt
│   ├── dto/login.dto.ts
│   └── dto/change-password.dto.ts
│
├── users/                              # Usuarios del sistema
│   ├── users.controller.ts             # GET|POST|PUT /api/v1/users
│   ├── users.service.ts
│   ├── entities/user.entity.ts
│   └── dto/
│
├── adolescente/                        # Dominio principal
│   ├── adolescente/                    # CRUD adolescente
│   ├── expediente/                     # CRUD expediente
│   ├── medida-socioeducativa/          # CRUD medida socioeducativa
│   ├── infraccion/                     # CRUD infracción
│   ├── gdo/                            # Grupos de desarrollo obligatorio
│   ├── etnia/                          # Catálogo de etnias
│   ├── estado-civil/                   # Catálogo de estados civiles
│   └── nacionalidad/                   # Catálogo de nacionalidades
│
├── contexto-familiar/                  # Familia y representantes
│   ├── representante/
│   ├── tipo-parentesco/
│   └── adolescente-representante/      # Relación N:M
│
├── estructura-institucional/           # Geografía institucional
│   ├── uzdi/                           # Unidades UZDI
│   ├── provincia/
│   └── canton/
│
├── gestion-documental/                 # Documentos adjuntos
│   ├── documento-expediente/
│   └── tipo-documento/
│
├── seguridad/                          # RBAC y auditoría
│   ├── persona/                        # Entidad base de personas del sistema
│   ├── perfil/                         # Roles/perfiles de acceso
│   ├── permiso/                        # Permisos por perfil
│   ├── accion/                         # Acciones registrables
│   ├── sesion/                         # Control de sesiones activas
│   └── historial/                      # Log de auditoría
│
├── talleres-actividades/               # Talleres socioeducativos
│   ├── taller/
│   └── asistencia-taller/
│
└── common/
    ├── pipes/sanitization.pipe.ts      # DOMPurify en todos los strings de entrada
    ├── guards/roles.guard.ts           # Guard de RBAC
    ├── decorators/roles.decorator.ts   # @Roles(...) para controladores
    ├── enums/rol.enum.ts               # Enum de roles disponibles
    └── middleware/mock-auth.middleware.ts  # Auth simulada para desarrollo
```

---

## Endpoints

### Auth

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "login": "usuario", "password": "contraseña" }
```

Respuesta exitosa: `{ token, user }` con datos del usuario autenticado.

```http
POST /api/v1/auth/change-password
Content-Type: application/json

{ "userId": 1, "currentPassword": "actual", "newPassword": "nueva" }
```

Respuesta exitosa: `{ message: "Contraseña actualizada" }`. Si la contraseña actual es incorrecta → `401 Unauthorized`.

### Users

```http
GET    /api/v1/users          → Listar todos los usuarios
POST   /api/v1/users          → Crear usuario
PATCH  /api/v1/users/:id      → Actualizar usuario
```

### Adolescentes

```http
GET    /api/v1/adolescentes
POST   /api/v1/adolescentes
PATCH  /api/v1/adolescentes/:id
DELETE /api/v1/adolescentes/:id
```

### Expedientes

```http
GET    /api/v1/expedientes
POST   /api/v1/expedientes
PATCH  /api/v1/expedientes/:id
```

### Medidas socioeducativas

```http
GET    /api/v1/medidas-socioeducativas
POST   /api/v1/medidas-socioeducativas
PATCH  /api/v1/medidas-socioeducativas/:id
DELETE /api/v1/medidas-socioeducativas/:id
```

Los demás módulos de catálogo (etnia, estado-civil, nacionalidad, uzdi, provincia, cantón, etc.) siguen el mismo patrón CRUD bajo `/api/v1/<recurso>`.

---

## Configuración global

| Aspecto | Valor |
| --- | --- |
| Prefijo global | `/api/v1` |
| Puerto | `process.env.PORT` o `3000` |
| ValidationPipe | `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` |
| SanitizationPipe | DOMPurify en todos los strings — aplicado globalmente |
| TypeORM synchronize | `false` — usar migraciones manuales |
| TypeORM autoLoadEntities | `true` |

---

## Variables de entorno

Crear `.env` en la raíz de `UZDI_BACK/`:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/uzdi_db
PORT=3000
```

---

## Desarrollo

```bash
npm install

# Servidor con hot reload
npm run start:dev

# Build TypeScript
npm run build

# Producción
npm run start:prod
```

### Tests

```bash
npm run test        # Unitarios (Jest)
npm run test:e2e    # End-to-end
npm run test:cov    # Cobertura
```

### Calidad de código

```bash
npm run lint        # ESLint
npm run format      # Prettier
```

---

## Seguridad

- Las contraseñas se almacenan con `bcrypt` (salt rounds configurables).
- Todos los inputs de tipo `string` pasan por `SanitizationPipe` que aplica DOMPurify antes de llegar al servicio.
- El guard `RolesGuard` evalúa el decorador `@Roles()` en cada endpoint para RBAC.
- `MockAuthMiddleware` inyecta un usuario simulado en desarrollo — reemplazar con JWT real en producción.
- `synchronize: false` en TypeORM evita modificaciones automáticas al esquema en producción.
