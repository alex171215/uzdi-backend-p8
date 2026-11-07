# 📚 CATÁLOGO Y ESPECIFICACIÓN TÉCNICA DE SERVICIOS API REST
## Sistema de Gestión Integral UZDI — Guía Oficial de Integración para Frontend
### Servicio Nacional de Atención Integral (SNAI) — Pontificia Universidad Católica del Ecuador (PUCE)

---

**Código Documental:** SNAI-UZDI-API-002  
**Versión de la API:** 2.0 (NestJS 11 + TypeORM + PostgreSQL 15 DDL v8)  
**Fecha de Emisión:** Noviembre 2026  
**Audiencia Objetivo:** Desarrolladores de Frontend (`UZDI_FRONT`), Diseñadores UI/UX e Integradores de Sistemas.  
**Prefijo Global Base:** `/api/v1`  
**Servidor Local de Desarrollo:** `http://localhost:3000/api/v1`  
**Documentación Swagger Interactiva:** `http://localhost:3000/api/docs`  

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Convenciones Generales de la API](#1-convenciones-generales-de-la-api)
   * 1.1. [Esquema Institucional de Respuestas](#11-esquema-institucional-de-respuestas)
   * 1.2. [Autenticación y Encabezados Requeridos](#12-autenticación-y-encabezados-requeridos)
   * 1.3. [Políticas de CORS y Consumo en Red Local (LAN)](#13-políticas-de-cors-y-consumo-en-red-local-lan)
2. [Módulo de Seguridad y Autenticación](#2-módulo-de-seguridad-y-autenticación)
   * 2.1. [Auth (Login, Logout, Cambio de Contraseña)](#21-auth-login-logout-cambio-de-contraseña)
   * 2.2. [Usuarios Institucionales (`seguridad.prsn`)](#22-usuarios-institucionales-seguridadprsn)
   * 2.3. [Catálogo de Perfiles (`seguridad.prfl`)](#23-catálogo-de-perfiles-seguridadprfl)
   * 2.4. [Catálogo de Acciones (`seguridad.accn`)](#24-catálogo-de-acciones-seguridadaccn)
   * 2.5. [Matriz de Permisos (`seguridad.prms`)](#25-matriz-de-permisos-seguridadprms)
3. [Módulo Sociodemográfico del Adolescente](#3-módulo-sociodemográfico-del-adolescente)
   * 3.1. [Adolescente (`adolescente.adolescente`) — CRUD y Búsqueda Rápida](#31-adolescente-adolescenteadolescente--crud-y-búsqueda-rápida)
   * 3.2. [Catálogos Paramétricos (Nacionalidad, Estado Civil, Etnia, GDO)](#32-catálogos-paramétricos-nacionalidad-estado-civil-etnia-gdo)
4. [Módulo Judicial: Expedientes y Medidas CONA](#4-módulo-judicial-expedientes-y-medidas-cona)
   * 4.1. [Expedientes Judiciales (`adolescente.expediente`)](#41-expedientes-judiciales-adolescenteexpediente)
   * 4.2. [Medidas por Expediente (`adolescente.medida_expediente`)](#42-medidas-por-expediente-adolescentemedida_expediente)
   * 4.3. [Catálogos Judiciales (Infracciones y Medidas Socioeducativas)](#43-catálogos-judiciales-infracciones-y-medidas-socioeducativas)
5. [Módulo de Contexto Familiar y Tutoría Legal](#5-módulo-de-contexto-familiar-y-tutoría-legal)
   * 5.1. [Representantes Legales (`contexto_familiar.representante`)](#51-representantes-legales-contexto_familiarrepresentante)
   * 5.2. [Catálogo de Parentesco (`contexto_familiar.tipo_parentesco`)](#52-catálogo-de-parentesco-contexto_familiartipo_parentesco)
   * 5.3. [Vínculo Adolescente-Representante (`contexto_familiar.adolescente_representante`)](#53-vínculo-adolescente-representante-contexto_familiaradolescente_representante)
6. [Módulo de Talleres y Control de Asistencia](#6-módulo-de-talleres-y-control-de-asistencia)
   * 6.1. [Talleres Socioeducativos (`talleres_actividades.taller`)](#61-talleres-socioeducativos-talleres_actividadestaller)
   * 6.2. [Asistencia a Talleres (`talleres_actividades.asistencia_taller`)](#62-asistencia-a-talleres-talleres_actividadesasistencia_taller)
7. [Módulo de Gestión Documental](#7-módulo-de-gestión-documental)
   * 7.1. [Tipos de Documento (`gestion_documental.tipo_documento`)](#71-tipos-de-documento-gestion_documentaltipo_documento)
   * 7.2. [Documentos del Expediente (`gestion_documental.documento_expediente`)](#72-documentos-del-expediente-gestion_documentaldocumento_expediente)
8. [Módulo de Estructura Institucional y Geografía](#8-módulo-de-estructura-institucional-y-geografía)
   * 8.1. [Provincias, Cantones y Sedes UZDI](#81-provincias-cantones-y-sedes-uzdi)
9. [Módulo de Reportes Oficiales SNAI](#9-módulo-de-reportes-oficiales-snai)
   * 9.1. [Consultas Consolidadas y Exportación Excel / PDF](#91-consultas-consolidadas-y-exportación-excel--pdf)

---

## ⚙️ 1. CONVENCIONES GENERALES DE LA API

### 1.1. Esquema Institucional de Respuestas

Todas las respuestas emitidas por la API UZDI están normalizadas por interceptores y filtros globales de NestJS:

#### Formato Exitoso (`HTTP 200 OK`, `HTTP 201 Created`):
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": { ... },
  "timestamp": "2026-11-07T14:30:00.000Z"
}
```

#### Formato de Error (`HTTP 400`, `401`, `403`, `404`, `409`, `500`):
```json
{
  "ok": false,
  "statusCode": 400,
  "message": "Error de validación en la solicitud",
  "errors": [
    "cedula debe ser una cédula de 10 dígitos o un pasaporte alfanumérico",
    "fecha_nac debe tener formato YYYY-MM-DD"
  ],
  "path": "/api/v1/adolescente",
  "timestamp": "2026-11-07T14:30:00.000Z"
}
```

### 1.2. Autenticación y Encabezados Requeridos

Salvo los endpoints marcados con `@Public()` (como `POST /auth/login` y `GET /health`), todas las solicitudes deben incluir el encabezado de autorización:

```http
Authorization: Bearer <TOKEN_JWT_OBTENIDO_EN_LOGIN>
Content-Type: application/json
Accept: application/json
```

### 1.3. Políticas de CORS y Consumo en Red Local (LAN)

El backend escucha en `0.0.0.0:3000` y autoriza peticiones originadas desde:
* `http://localhost:5173` y `http://localhost:5174` (Vite dev server)
* `http://127.0.0.1:*`
* Direcciones IPv4 locales: `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`
* Herramientas de prueba como Postman, Insomnia, curl y Swagger UI.

---

## 🔐 2. MÓDULO DE SEGURIDAD Y AUTENTICACIÓN

### 2.1. Auth

#### `POST /api/v1/auth/login` *(Público)*
Valida credenciales, genera el token JWT institucional (vigencia de 8 horas) y registra la sesión activa en `seguridad.sesn`.

* **Request Body:**
```json
{
  "login": "admin.uzdi",
  "password": "Password123!"
}
```
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "ok": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "login": "admin.uzdi",
      "nombres": "Juan Carlos",
      "apellidos": "Pérez Gómez",
      "correo": "juan.perez@snai.gob.ec",
      "rol": "Administrador",
      "rol_codigo": "ADM",
      "sesion_id": 42
    }
  },
  "timestamp": "2026-11-07T14:30:00.000Z"
}
```
* **Error (`401 Unauthorized`):**
```json
{
  "ok": false,
  "statusCode": 401,
  "message": "Credenciales inválidas. Usuario o contraseña incorrectos.",
  "errors": null,
  "path": "/api/v1/auth/login"
}
```

#### `POST /api/v1/auth/logout` *(Protegido)*
Cierra la sesión activa del usuario, actualizando `sesnfcfn = NOW()` en `seguridad.sesn`.
* **Headers:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "ok": true,
  "message": "Sesión cerrada correctamente",
  "data": null
}
```

#### `POST /api/v1/auth/change-password` *(Protegido)*
* **Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword2026#"
}
```

---

### 2.2. Usuarios Institucionales (`seguridad.prsn`)

* **Base URI:** `/api/v1/users`
* **Permisos:** Administrador (`ADM`), Coordinador (`CORD`).

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/users` | Listado general de usuarios institucionales activos |
| `GET` | `/api/v1/users/:id` | Detalle del usuario y su perfil institucional |
| `POST` | `/api/v1/users` | Registro de nuevo usuario (exige `tppr_id` activo - Regla RF-12) |
| `PATCH` | `/api/v1/users/:id` | Actualización de datos del usuario |
| `DELETE` | `/api/v1/users/:id` | Inactivación lógica del usuario (`estado = false`) |

* **Ejemplo Request Body (`POST /api/v1/users`):**
```json
{
  "prsnnmbr": "Paúl Alejandro",
  "prsnapll": "Rosero Mena",
  "prsnsexo": "M",
  "prsntelf": "0987654321",
  "prsnmail": "paul.rosero@snai.gob.ec",
  "prsnlogn": "paul.rosero",
  "prsnpass": "ClaveSegura2026*",
  "uzdi_id": 1,
  "tppr_id": 2
}
```

---

## 🧒 3. MÓDULO SOCIODEMOGRÁFICO DEL ADOLESCENTE

### 3.1. Adolescente (`adolescente.adolescente`)

* **Base URI:** `/api/v1/adolescente`
* **Permisos:** Todos los perfiles técnicos (Lectura), Administrador y Técnico (Escritura).

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/adolescente` | Lista de todos los adolescentes activos |
| `GET` | `/api/v1/adolescente/search?q={termino}` | **Búsqueda por texto coincidente** en cédula, nombres o apellidos |
| `GET` | `/api/v1/adolescente/:id` | Consulta detallada de la ficha de un adolescente |
| `POST` | `/api/v1/adolescente` | Registro de ingreso de un nuevo adolescente |
| `PATCH` | `/api/v1/adolescente/:id` | Actualización sociodemográfica del adolescente |
| `DELETE` | `/api/v1/adolescente/:id` | Inactivación lógica (`estado = false`) |

#### Parámetro de Búsqueda Rápida:
* **Ejemplo de Consulta:** `GET /api/v1/adolescente/search?q=180123` o `GET /api/v1/adolescente/search?q=Mendoza`

#### Request Body (`POST /api/v1/adolescente`):
```json
{
  "cedula": "1804567890",
  "nombre": "Carlos Andrés",
  "apellido": "Mendoza Silva",
  "fecha_nac": "2009-06-15",
  "sexo": "M",
  "nved_nombre": "Tercero de Bachillerato",
  "hijos": 0,
  "reincide": false,
  "fecha_ingr": "2026-02-01",
  "observaciones": "Derivado por Unidad Judicial Multicompetente",
  "nacn_id": 1,
  "edcv_id": 1,
  "etna_id": 1,
  "gdo_id": 1,
  "cntn_id": 1
}
```

#### Respuesta Exitosa (`201 Created`):
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 12,
    "cedula": "1804567890",
    "nombre": "Carlos Andrés",
    "apellido": "Mendoza Silva",
    "fecha_nac": "2009-06-15",
    "sexo": "M",
    "reincide": false,
    "estado": true,
    "fcCrea": "2026-11-07T14:35:00.000Z"
  }
}
```

---

### 3.2. Catálogos Paramétricos del Adolescente

Cada catálogo cuenta con endpoints estandarizados de lectura (`GET`) y administración (`POST`, `PATCH`, `DELETE`):

* `/api/v1/nacionalidad` $\rightarrow$ Catálogo de países (`Ecuatoriana`, `Colombiana`, `Venezolana`).
* `/api/v1/estado-civil` $\rightarrow$ Catálogo civil (`Soltero`, `Unión de hecho`, `Casado`).
* `/api/v1/etnia` $\rightarrow$ Autoidentificación (`Mestizo`, `Indígena`, `Afroecuatoriano`, `Montubio`, `Blanco`).
* `/api/v1/gdo` $\rightarrow$ Grupos de Delincuencia Organizada (`Ninguno`, `Los Choneros`, `Los Lobos`, etc.).

---

## ⚖️ 4. MÓDULO JUDICIAL: EXPEDIENTES Y MEDIDAS CONA

### 4.1. Expedientes Judiciales (`adolescente.expediente`)

* **Base URI:** `/api/v1/expediente`
* **Permisos:** Profesional Jurídico (`LEGAL`), Coordinador (`CORD`), Administrador (`ADM`).

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/expediente` | Listado general de causas judiciales activas |
| `GET` | `/api/v1/expediente/:id` | Detalle completo de causa con medidas e infracción asociada |
| `POST` | `/api/v1/expediente` | Apertura de nueva causa judicial (`numero_causa` obligatorio y único) |
| `PATCH` | `/api/v1/expediente/:id` | Modificación del estado procesal o datos judiciales |
| `DELETE` | `/api/v1/expediente/:id` | Inactivación lógica del expediente |

* **Request Body (`POST /api/v1/expediente`):**
```json
{
  "adlc_id": 12,
  "uzdi_id": 1,
  "infc_id": 3,
  "numero_causa": "18201-2026-00341",
  "estado_procesal": "En proceso",
  "observaciones": "Auto de llamamiento a juicio emitido el 10-01-2026"
}
```

---

### 4.2. Medidas por Expediente (`adolescente.medida_expediente`)

* **Base URI:** `/api/v1/medida-expediente`
* **Directriz CONA:** Permite asociar múltiples medidas a un expediente ordenadas secuencial o simultáneamente mediante el campo `orden`.

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/medida-expediente` | Consulta general de medidas asignadas |
| `GET` | `/api/v1/medida-expediente/:id` | Detalle de una medida específica |
| `POST` | `/api/v1/medida-expediente` | Asignación de medida al expediente (`orden` secuencial) |
| `PATCH` | `/api/v1/medida-expediente/:id` | Actualización de fechas o estado de cumplimiento |
| `DELETE` | `/api/v1/medida-expediente/:id` | Inactivación lógica de la medida |

* **Request Body (`POST /api/v1/medida-expediente`):**
```json
{
  "expe_id": 5,
  "mdso_id": 2,
  "orden": 1,
  "fecha_inicio": "2026-02-15",
  "fecha_fin": "2026-08-15",
  "estado_cumplimiento": "En proceso",
  "observaciones": "Cumplimiento en sede UZDI Ambato los días sábados"
}
```

---

## 👨‍👩‍👧 5. MÓDULO DE CONTEXTO FAMILIAR Y TUTORÍA LEGAL

### 5.1. Representantes Legales (`contexto_familiar.representante`)

* **Base URI:** `/api/v1/representante`

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/representante` | Listado general de representantes y tutores |
| `GET` | `/api/v1/representante/cedula/:cedula` | **Consulta rápida por cédula** para autocompletar formularios |
| `GET` | `/api/v1/representante/:id` | Detalle de representante por ID |
| `POST` | `/api/v1/representante` | Alta de nuevo representante o tutor |
| `PATCH` | `/api/v1/representante/:id` | Actualización de dirección, teléfono o datos personales |
| `DELETE` | `/api/v1/representante/:id` | Inactivación lógica (`estado = false`) |

* **Request Body (`POST /api/v1/representante`):**
```json
{
  "cntn_id": 1,
  "nombre": "Rosa María",
  "apellido": "Pérez Gómez",
  "cedula": "1801234567",
  "telefono": "0991234567",
  "direccion": "Av. Cevallos y Montalvo, Ambato"
}
```

---

### 5.2. Vínculo Adolescente-Representante (`contexto_familiar.adolescente_representante`)

* **Base URI:** `/api/v1/adolescente-representante`

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/adolescente-representante` | Listado general de vínculos familiares |
| `GET` | `/api/v1/adolescente-representante/adolescente/:adlc_id` | **Obtener todos los familiares/tutores de un adolescente** |
| `GET` | `/api/v1/adolescente-representante/:id` | Detalle de un vínculo por su ID |
| `POST` | `/api/v1/adolescente-representante` | Asociar tutor con adolescente (`es_referente`, parentesco) |
| `PATCH` | `/api/v1/adolescente-representante/:id` | Actualización del vínculo |
| `DELETE` | `/api/v1/adolescente-representante/:id` | Inactivación lógica del vínculo |

* **Request Body (`POST /api/v1/adolescente-representante`):**
```json
{
  "adlc_id": 12,
  "repr_id": 8,
  "tprt_id": 1,
  "es_referente": true,
  "fecha_inicio": "2026-02-01",
  "fecha_fin": "2026-12-31"
}
```

---

## 🏫 6. MÓDULO DE TALLERES Y CONTROL DE ASISTENCIA

### 6.1. Talleres Socioeducativos (`talleres_actividades.taller`)

* **Base URI:** `/api/v1/taller`

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/taller` | Listado de talleres planificados y ejecutados |
| `GET` | `/api/v1/taller/:id` | Información detallada del taller y facilitador |
| `POST` | `/api/v1/taller` | Registro de taller (`hora_fin > hora_inicio`) |
| `PATCH` | `/api/v1/taller/:id` | Actualización de fecha, lugar u horarios |
| `DELETE` | `/api/v1/taller/:id` | Inactivación lógica del taller |

* **Request Body (`POST /api/v1/taller`):**
```json
{
  "uzdi_id": 1,
  "prsn_id": 3,
  "nombre": "Taller de Habilidades para la Vida",
  "tema": "Resolución Asertiva de Conflictos y Comunicación no Violenta",
  "objetivo": "Fortalecer habilidades de negociación interpersonal en adolescentes",
  "fecha": "2026-03-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "11:00:00",
  "lugar": "Sala de Capacitación UZDI Ambato",
  "observaciones": "Se convocó a 15 adolescentes de la zona centro"
}
```

---

### 6.2. Asistencia a Talleres (`talleres_actividades.asistencia_taller`)

* **Base URI:** `/api/v1/asistencia-taller`
* **Regla de Negocio Dual:** La restricción `chk_asistencia_taller_asistente` exige registrar de forma mutuamente excluyente si el asistente es el adolescente o su representante.

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/asistencia-taller` | Listado general de asistencias |
| `GET` | `/api/v1/asistencia-taller/taller/:tall_id` | **Lista de participantes (asistencia) de un taller específico** |
| `GET` | `/api/v1/asistencia-taller/:id` | Detalle de asistencia por ID |
| `POST` | `/api/v1/asistencia-taller` | Registro de asistencia (adolescente o tutor) |
| `PATCH` | `/api/v1/asistencia-taller/:id` | Actualización de estado de asistencia |
| `DELETE` | `/api/v1/asistencia-taller/:id` | Inactivación de registro de asistencia |

#### Caso A: Asistencia del Adolescente
```json
{
  "tall_id": 4,
  "tipo_asistente": "adolescente",
  "adlc_id": 12,
  "asistio": true,
  "observaciones": "Puntual, participación dinámica en la mesa redonda"
}
```

#### Caso B: Asistencia del Representante Legal
```json
{
  "tall_id": 4,
  "tipo_asistente": "representante",
  "adre_id": 3,
  "asistio": true,
  "observaciones": "Madre de familia asistió a la sesión de escuela para padres"
}
```

---

## 📂 7. MÓDULO DE GESTIÓN DOCUMENTAL

### 7.1. Documentos del Expediente (`gestion_documental.documento_expediente`)

* **Base URI:** `/api/v1/documento-expediente`

| Método | Endpoint URI | Descripción |
|:---:|:---|:---|
| `GET` | `/api/v1/documento-expediente` | Listado general de documentos en archivo |
| `GET` | `/api/v1/documento-expediente/expediente/:expe_id` | **Historial y archivo digital de un expediente específico** |
| `GET` | `/api/v1/documento-expediente/:id` | Detalle del documento por ID |
| `POST` | `/api/v1/documento-expediente` | Registro de documento habilitante o informe |
| `PATCH` | `/api/v1/documento-expediente/:id` | Actualización del estado del trámite |
| `DELETE` | `/api/v1/documento-expediente/:id` | Inactivación lógica del documento |

* **Request Body (`POST /api/v1/documento-expediente`):**
```json
{
  "expe_id": 5,
  "prsn_id": 2,
  "tpdc_id": 1,
  "es_habilitante": true,
  "estado_tramite": "recibido",
  "numero_documento": "OF-2026-089-JNA",
  "fecha_documento": "2026-02-14",
  "emisor": "Juzgado de Familia, Niñez y Adolescencia",
  "observaciones": "Oficio de remisión de medida socioeducativa debidamente foliado"
}
```

---

## 📈 8. MÓDULO DE REPORTES OFICIALES SNAI

* **Base URI:** `/api/v1/reportes`
* **Permisos:** Administrador (`ADM`), Coordinador (`CORD`), Jurídico (`LEGAL`), SNAI Consulta (`CONS`).

| Método | Endpoint URI | Descripción | Formato Retornado |
|:---:|:---|:---|:---:|
| `GET` | `/api/v1/reportes/uzdi/adolescentes` | Consolidado demográfico de adolescentes activos por provincia, cantón y sede UZDI | JSON |
| `GET` | `/api/v1/reportes/expedientes/medidas` | Resumen procesal de expedientes, causas y estado de cumplimiento de medidas | JSON |
| `GET` | `/api/v1/reportes/export/excel` | **Descarga de reporte consolidado en Microsoft Excel** | Binario `.xlsx` |
| `GET` | `/api/v1/reportes/export/pdf` | **Ficha ejecutiva institucional con diseño para impresión/guardar PDF** | HTML / PDF |

#### Parámetros de Filtrado Opcionales (Query Params):
* `?uzdi_id=1` $\rightarrow$ Filtrar por identificador de sede UZDI.
* `?prov_id=18` $\rightarrow$ Filtrar por código de provincia.
* `?cntn_id=1` $\rightarrow$ Filtrar por código de cantón.
* `?estado_procesal=En proceso` $\rightarrow$ Filtrar por estado de la causa judicial.

---

*Catálogo Técnico de Servicios API REST oficializado para el equipo de desarrollo de Frontend — Proyecto UZDI (SNAI – PUCE 2026).*
