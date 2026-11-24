# Catálogo Técnico de Servicios API para Frontend

**Sistema de Gestión Integral UZDI · API REST v2 · Noviembre 2026**  
**Institución:** Servicio Nacional de Atención Integral a Personas Adultas Privadas de la Libertad y a Adolescentes Infractores (SNAI) — PUCE  
**Base de Desarrollo:** `http://localhost:3000/api/v1`  
**Documentación OpenAPI / Swagger:** `http://localhost:3000/api/docs`  

---

## 1. Estructura Base de Peticiones y Respuestas (Contrato JSON Explícito)

*(Documentación explícita del estándar JSON requerida por la evaluación docente, sin depender únicamente de la interfaz interactiva de Swagger).*

### 1.1 Estructura Base de una Solicitud (HTTP Request)

Toda petición dirigida a un endpoint protegido de la API debe cumplir con la siguiente estructura de cabeceras y cuerpo:

```http
POST /api/v1/adolescente HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "cedula": "0000000011",
  "nombre": "Juan Carlos",
  "apellido": "Morales Vega",
  "fecha_nac": "2008-04-12",
  "sexo": "M",
  "fecha_ingr": "2026-01-15",
  "nacn_id": 1,
  "etcv_id": 1,
  "etna_id": 1,
  "cntn_id": 1
}
```

* **Cabecera `Authorization`:** Obligatoria en todas las rutas operativas (excepto `/api/v1/auth/login`). Formato: `Bearer <token_jwt>`.
* **Cuerpo JSON:** Solo se envía en peticiones `POST`, `PATCH` y `PUT`. En peticiones `GET` y `DELETE` el cuerpo debe ir vacío.

---

### 1.2 Estructura Base de una Respuesta Exitosa (200 OK / 201 Created)

Todas las respuestas exitosas de la API son interceptadas por `ResponseTransformInterceptor`, garantizando la siguiente forma homogénea:

```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 1,
    "nombre": "Juan Carlos",
    "apellido": "Morales Vega",
    "cedula": "0000000011",
    "estado": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "timestamp": "2026-11-23T20:15:30.125Z"
}
```

* **`ok` (`boolean`):** Siempre `true` en operaciones exitosas.
* **`message` (`string`):** Mensaje institucional descriptivo del resultado.
* **`data` (`object` | `array` | `null`):** Objeto único en altas/detalles (`id`, atributos), arreglo en listados o búsquedas, o resultado de filas afectadas en modificaciones.
* **`token` (`string`, opcional):** Nuevo token JWT encadenado para la siguiente petición del cliente (también retornado en la cabecera `x-renewed-token`).
* **`timestamp` (`string`):** Marca de tiempo ISO-8601 del servidor.

---

### 1.3 Estructura Base de una Respuesta de Error (400, 401, 403, 404, 409, 500)

Todas las fallas son interceptadas por `CustomHttpExceptionFilter`, garantizando que el frontend reciba diagnósticos claros y no genéricos:

```json
{
  "ok": false,
  "statusCode": 400,
  "message": "Error de validación en la solicitud",
  "errors": [
    "cedula debe ser una cédula de 10 dígitos o un pasaporte alfanumérico de 6 a 20 caracteres",
    "cntn_id debe ser un número entero positivo"
  ],
  "path": "/api/v1/adolescente",
  "timestamp": "2026-11-23T20:15:30.125Z"
}
```

* **`ok` (`boolean`):** Siempre `false`.
* **`statusCode` (`number`):** Código numérico HTTP (`400`, `401`, `403`, `404`, `409`, `500`).
* **`message` (`string`):** Explicación concreta de la causa del error.
* **`errors` (`string[]` | `null`):** Lista con el detalle campo por campo en errores 400 de validación de DTOs.
* **`path` (`string`):** Ruta solicitada (justificado formalmente bajo el estándar RFC 7807 para observabilidad en SPAs).
* **`timestamp` (`string`):** Fecha y hora del evento para correlación en logs.

---

## 2. Autenticación y Credenciales Semilla para Pruebas del Frontend

Para desbloquear el consumo del frontend y realizar pruebas funcionales, la base de datos inicializada (`02_seguridad_rbac.sql`) cuenta con el usuario administrador institucional:

| Campo | Valor de Prueba | Descripción |
|---|---|---|
| **URL de Login** | `POST http://localhost:3000/api/v1/auth/login` | Endpoint público de acceso |
| **Login / Usuario** | `admin` | Administrador general UZDI |
| **Contraseña** | `Admin.Uzdi2026` | Clave predeterminada de seed |
| **Perfil por defecto** | `1` (`ADMINISTRADOR`) | Perfil con acceso irrestricto |

### Ejemplo Completo de Autenticación (Petición y Respuesta):

#### Petición (Request):
```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "login": "admin",
  "password": "Admin.Uzdi2026"
}
```

#### Respuesta (Response - 200 OK):
```json
{
  "ok": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNibmFpLmdvYi5lYyIsInByZmxfaWQiOjEsInJvbCI6IkFETUlOSVNUUkFET1IiLCJyb2xfY29kaWdvIjoiQURNIiwic2VzaW9uX2lkIjoxLCJpYXQiOjE3OTU0ODIwMDAsImV4cCI6MTc5NTUxMDgwMH0.ejemplo_firma",
    "sesion": {
      "id": 1,
      "inicio": "2026-11-23T20:00:00.000Z"
    },
    "usuario": {
      "id": 1,
      "nombres": "Administrador",
      "apellidos": "Sistema",
      "login": "admin",
      "correo": "admin@snai.gob.ec"
    },
    "perfilActivo": {
      "id": 1,
      "codigo": "ADM",
      "nombre": "ADMINISTRADOR"
    }
  },
  "timestamp": "2026-11-23T20:00:00.000Z"
}
```

> **Cadena de Tokens:** En cada petición subsecuente, el frontend debe enviar el último token recibido en la cabecera `Authorization: Bearer <token>`. El servidor validará el token y devolverá uno nuevo en la cabecera `x-renewed-token` y en la propiedad `token` del cuerpo de respuesta.

---

## 3. Matriz de Endpoints: Diferenciación Estricta por URL y Acción

*(Enfatizando la distinción clara entre endpoints que comparten la misma URL mediante el método HTTP y la acción de negocio).*

### 3.1 Módulo Adolescentes (`/api/v1/adolescente`)

| Método | URL Completa | Acción de Negocio Específica | Rol Mínimo | Cuerpo (Body) |
|---|---|---|---|---|
| `GET` | `http://localhost:3000/api/v1/adolescente` | **Listar todos los adolescentes activos** | Todos | Vacío |
| `POST` | `http://localhost:3000/api/v1/adolescente` | **Registrar (Crear) un nuevo adolescente infractor** | `TSOC`, `ADM` | `CreateAdolescenteDto` |
| `GET` | `http://localhost:3000/api/v1/adolescente/:id` | **Consultar el detalle integral de un adolescente por su ID** | Todos | Vacío |
| `PATCH` | `http://localhost:3000/api/v1/adolescente/:id` | **Actualizar parcialmente datos del adolescente** | `TSOC`, `ADM` | `UpdateAdolescenteDto` |
| `DELETE` | `http://localhost:3000/api/v1/adolescente/:id` | **Inactivar lógicamente (baja) al adolescente** | `ADM`, `SUP` | Vacío |
| `GET` | `http://localhost:3000/api/v1/adolescente/search?q=texto` | **Búsqueda textual coincidente por cédula, nombre o apellido** | Todos | Vacío |

#### Ejemplo Real Completo: Registrar Adolescente (`POST /api/v1/adolescente`)
**Petición:**
```http
POST /api/v1/adolescente HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "cedula": "1720304050",
  "nombre": "Mateo Alexander",
  "apellido": "Cárdenas Vaca",
  "fecha_nac": "2008-07-22",
  "sexo": "M",
  "fecha_ingr": "2026-02-15",
  "nacn_id": 1,
  "etcv_id": 1,
  "etna_id": 1,
  "cntn_id": 1,
  "hijos": 0,
  "reincide": false,
  "hijoPpl": false,
  "observaciones": "Ingreso remitido desde juzgado de menores"
}
```

**Respuesta (201 Created):**
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 6,
    "cedula": "1720304050",
    "nombre": "Mateo Alexander",
    "apellido": "Cárdenas Vaca",
    "fecha_nac": "2008-07-22",
    "sexo": "M",
    "fecha_ingr": "2026-02-15",
    "nacn_id": 1,
    "etcv_id": 1,
    "etna_id": 1,
    "cntn_id": 1,
    "estado": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.siguiente_token_encadenado",
  "timestamp": "2026-11-23T20:16:00.000Z"
}
```

---

### 3.2 Módulo Expedientes Judiciales (`/api/v1/expediente`)

| Método | URL Completa | Acción de Negocio Específica | Rol Mínimo | Cuerpo (Body) |
|---|---|---|---|---|
| `GET` | `http://localhost:3000/api/v1/expediente` | **Listar expedientes activos (con filtros opcionales adlc_id, uzdi_id)** | Todos | Vacío |
| `POST` | `http://localhost:3000/api/v1/expediente` | **Aperturar un nuevo expediente judicial para un adolescente** | `JURIDICO`, `JUEZ`, `ADM` | `CreateExpedienteDto` |
| `GET` | `http://localhost:3000/api/v1/expediente/:id` | **Obtener detalle de expediente con sus medidas socioeducativas ordenadas** | Todos | Vacío |
| `PUT` | `http://localhost:3000/api/v1/expediente/:id` | **Actualizar completamente los datos del expediente (PUT)** | `JURIDICO`, `JUEZ`, `ADM` | `UpdateExpedienteDto` |
| `PATCH` | `http://localhost:3000/api/v1/expediente/:id` | **Actualizar parcialmente un expediente (PATCH)** | `JURIDICO`, `JUEZ`, `ADM` | `UpdateExpedienteDto` |
| `DELETE` | `http://localhost:3000/api/v1/expediente/:id` | **Inactivar lógicamente un expediente judicial** | `JURIDICO`, `JUEZ`, `ADM` | Vacío |

#### Ejemplo Real Completo: Apertura de Expediente (`POST /api/v1/expediente`)
**Petición:**
```http
POST /api/v1/expediente HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "adlc_id": 1,
  "uzdi_id": 1,
  "infc_id": 1,
  "numero_causa": "EXP-2026-QUITO-0089",
  "estado_procesal": "En proceso",
  "observaciones": "Causa aperturada con medida socioeducativa no privativa de libertad"
}
```

**Respuesta (201 Created):**
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 6,
    "adlc_id": 1,
    "uzdi_id": 1,
    "infc_id": 1,
    "numero_causa": "EXP-2026-QUITO-0089",
    "estado_procesal": "En proceso",
    "observaciones": "Causa aperturada con medida socioeducativa no privativa de libertad",
    "estado": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_renovado",
  "timestamp": "2026-11-23T20:17:00.000Z"
}
```

---

### 3.3 Módulo Medidas por Expediente (`/api/v1/medida-expediente`)

| Método | URL Completa | Acción de Negocio Específica | Rol Mínimo | Cuerpo (Body) |
|---|---|---|---|---|
| `GET` | `http://localhost:3000/api/v1/medida-expediente` | **Listar medidas asignadas (filtros opcionales expe_id, mdso_id)** | Todos | Vacío |
| `POST` | `http://localhost:3000/api/v1/medida-expediente` | **Asignar medida socioeducativa con orden secuencial CONA al expediente** | `JURIDICO`, `JUEZ`, `ADM` | `CreateMedidaExpedienteDto` |
| `GET` | `http://localhost:3000/api/v1/medida-expediente/:id` | **Consultar detalle y avance de una medida asignada** | Todos | Vacío |
| `PUT` | `http://localhost:3000/api/v1/medida-expediente/:id` | **Actualizar completamente la medida asignada (PUT)** | `JURIDICO`, `JUEZ`, `ADM` | `UpdateMedidaExpedienteDto` |
| `PATCH` | `http://localhost:3000/api/v1/medida-expediente/:id` | **Actualizar fechas o estado de cumplimiento de la medida (PATCH)** | `JURIDICO`, `JUEZ`, `ADM` | `UpdateMedidaExpedienteDto` |
| `DELETE` | `http://localhost:3000/api/v1/medida-expediente/:id` | **Inactivar lógicamente la medida de un expediente** | `JURIDICO`, `JUEZ`, `ADM` | Vacío |

#### Ejemplo Real Completo: Asignación de Medida CONA (`POST /api/v1/medida-expediente`)
**Petición:**
```http
POST /api/v1/medida-expediente HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "expe_id": 1,
  "mdso_id": 1,
  "orden": 1,
  "fecha_inicio": "2026-03-01",
  "fecha_fin": "2026-06-01",
  "estado_cumplimiento": "En proceso",
  "observaciones": "Asignado a programa de orientación comunitaria y apoyo socioeducativo"
}
```

**Respuesta (201 Created):**
```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 6,
    "expe_id": 1,
    "mdso_id": 1,
    "orden": 1,
    "fecha_inicio": "2026-03-01",
    "fecha_fin": "2026-06-01",
    "estado_cumplimiento": "En proceso",
    "observaciones": "Asignado a programa de orientación comunitaria y apoyo socioeducativo",
    "estado": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_renovado",
  "timestamp": "2026-11-23T20:18:00.000Z"
}
```

---

### 3.4 Catálogos y Estructura Institucional (Selectores en Cascada)

Para cargar los selectores del frontend en cascada:

1. **Provincias:** `GET /api/v1/provincia`  
   → Selecciona `id` de provincia (`prov_id = 1`).
2. **Cantones:** `GET /api/v1/canton?prov_id=1`  
   → Selecciona `id` de cantón (`cntn_id = 1`).
3. **Sedes UZDI:** `GET /api/v1/uzdi?cntn_id=1`  
   → Selecciona la sede UZDI responsable (`uzdi_id = 1`).
4. **Catálogos Sociodemográficos:**  
   - Nacionalidad: `GET /api/v1/nacionalidad`
   - Estado Civil: `GET /api/v1/estado-civil`
   - Etnia: `GET /api/v1/etnia`
   - Grado de Organización (GDO): `GET /api/v1/gdo`
   - Infracciones: `GET /api/v1/infraccion`
   - Tipos de Medida: `GET /api/v1/medida-socioeducativa`
