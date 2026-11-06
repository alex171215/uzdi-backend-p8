# 🚀 PLAN MAESTRO DE TRABAJO, DIRECTRICES TÉCNICAS Y MATRIZ DE SERVICIOS CRUD — BACKEND UZDI

**Proyecto:** Sistema de Gestión Integral de Adolescentes Infractores — UZDI (SNAI – PUCE)  
**Versión de Base de Datos:** DDL Versión 8 Oficial (`Back Ecologia (1).sql`)  
**Stack Tecnológico:** NestJS 11 + TypeScript + TypeORM + PostgreSQL 15 + Swagger (OpenAPI 3.0) + Docker  
**Integrantes del Equipo:**  
1. **Paúl Rosero** (Líder Técnico, Arquitectura Core e Infraestructura)  
2. **Joan Santacruz** (Dominio Judicial, Medidas Socioeducativas y Causas)  
3. **Gabriel Aguinaga** (Dominio de Seguridad, Perfiles ER CAI y Control de Acceso RBAC)  
4. **Alejandro Flores** (Dominio Sociodemográfico y Estructura Geográfica Institucional)  
5. **Joselyn Cadena** (Dominio de Red Familiar, Talleres, Archivo Documental y Reportes SNAI)  
**Repositorio Central Oficial:** `https://github.com/alex171215/uzdi-backend-p8.git`  
**Fecha de Actualización:** Noviembre 2026 — *Fase Final de Integración (Cierre en 4 semanas)*

---

## 📌 1. ANÁLISIS DE REQUERIMIENTOS DEL DOCENTE Y DIAGNÓSTICO DE ESTADO

A partir de las indicaciones presenciales del docente y el análisis exhaustivo de las grabaciones de cátedra (*Uzdi 2.m4a*, *Uzdi 2.1.m4a*, *Uzdi 3.m4a* y el modelo *ER CAI*), se establecen los siguientes lineamientos obligatorios para el cierre del proyecto:

### 1.1. Principios REST y Estandarización de Endpoints
* La API debe ser estrictamente **RESTful**: uso riguroso de verbos HTTP semánticos (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`).
* Respuestas estandarizadas mediante códigos HTTP estándar:
  * `200 OK`: Consulta o actualización exitosa.
  * `201 Created`: Registro creado satisfactoriamente.
  * `400 Bad Request`: Error de validación de datos en el cliente (DTOs).
  * `401 Unauthorized`: Token ausente, corrupto o expirado.
  * `403 Forbidden`: Usuario autenticado pero sin permiso/acción para el recurso solicitado.
  * `404 Not Found`: Recurso no encontrado.
  * `500 Internal Server Error`: Falla no controlada en el servidor.
* Envoltura unificada de respuesta obligatoria:
  ```json
  {
    "ok": true,
    "message": "Operación ejecutada con éxito",
    "data": { ... }
  }
  ```

### 1.2. Seguridad Criptográfica con JWT (JsonWebToken)
* **Directriz del Ingeniero:** *"Debemos recibir un token desde el backend y es quien permite realizar la siguiente petición. Hay que manejar JWT: el backend manda, si el token está malo o vencido, no se procede."*
* **Flujo Operativo:**
  1. El cliente envía `POST /api/v1/auth/login` con credenciales.
  2. El backend valida contra la base de datos (con `bcrypt`).
  3. Si es válido, firma un token JWT con payload seguro (`sub`, `username`, `prfl_id`, `rol`) y tiempo de expiración (ej. 8 horas).
  4. En cada petición posterior a cualquier endpoint protegido, el cliente debe adjuntar el header `Authorization: Bearer <token>`.
  5. Un Guard global de NestJS (`JwtAuthGuard`) intercepta la petición. Si el token no existe, está alterado o expiró, responde de inmediato con `401 Unauthorized` bloqueando el procesamiento.

### 1.3. Matriz de Permisos por Perfil (Recuadro Modelo ER CAI)
* El recuadro inferior del diagrama ER CAI define el subsistema de autorización:
  * `seguridad.prsn` (Persona/Usuario)
  * `seguridad.prfl` (Perfil de usuario: Juez, Administrador, Técnico, Educador, Psicólogo, Coordinador)
  * `seguridad.accn` (Catálogo de acciones o módulos del sistema: crear expediente, ver adolescentes, registrar asistencia, etc.)
  * `seguridad.prms` (Tabla asociativa que vincula `prfl_id` con `accn_id`: permisos otorgados por perfil)
  * `seguridad.sesn` (Registro de sesiones activas e histórico de conexiones)
* **Regla de Negocio:** La autorización no es un simple texto fijo; el sistema debe verificar en la base de datos si el perfil activo del usuario logueado cuenta con la tupla en `seguridad.prms` para ejecutar la acción solicitada.

### 1.4. Conectividad Frontend-Backend, Red Local y Políticas de CORS
* **Directriz del Ingeniero:** *"El backend debe estar levantado (puerto local o Docker) y darle acceso al frontend, permitiendo que la IP del frontend ingrese con peticiones al backend sin conflictos de Cross-Origin (CORS)."*
* **Implementación:**
  * Configurar `enableCors` en NestJS para admitir peticiones desde `localhost:5173`, `localhost:5174`, `127.0.0.1`, así como cualquier dirección IP de la red de área local (`192.168.x.x` o `10.x.x.x`), permitiendo que el desarrollador de Frontend pruebe directamente desde su máquina hacia la máquina del Backend.
  * Habilitar métodos completos: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
  * Permitir headers esenciales: `Content-Type, Authorization, x-usuario-id`.

### 1.5. Módulo Oficial de Reportes Institucionales (SNAI)
* **Directriz del Ingeniero (Grabación 3):** No esperar a que los delegados del SNAI o la UZDI Ambato envíen formatos, pues suelen demorar o no asistir a tiempo. El equipo de Backend debe proponer y dejar operativos los reportes institucionales estándar:
  1. **Reporte R-01 (Consolidado de Adolescentes por UZDI):** Filtro por provincia, cantón y centro UZDI, listando adolescentes activos, etnia, edad y medidas asociadas.
  2. **Reporte R-02 (Ficha Judicial de Expedientes y Medidas):** Resumen de causas, infracciones tipificadas y estado de cumplimiento de las medidas socioeducativas.
  3. **Exportación Dual Obligatoria:** Capacidad de exportar la data estructurada tanto en **formato Excel (.xlsx)** como en **formato PDF institucional (.pdf)**.

### 1.6. Auditoría y Trazabilidad en Base de Datos
* Se mantiene la arquitectura de auditoría nativa por triggers de PostgreSQL sobre la tabla `seguridad.historial`. El backend inyecta la variable de sesión transaccional `SET LOCAL app.usuario_id = ...` mediante el `AuditContextMiddleware` en cada petición autenticada.

---

## 🛠️ 2. GUÍA DE INFRAESTRUCTURA, DOCKER Y CONECTIVIDAD MULTI-IP

Para garantizar que cualquier compañero del Frontend o Backend pueda levantar y conectar el sistema sin fricción:

### 2.1. Despliegue con Docker Compose (Recomendado)
Desde la carpeta raíz del backend (`UZDI_BACK/UZDI_BACK`):
```bash
# Levantar base de datos PostgreSQL 15 preconfigurada con el DDL v8
docker compose up -d

# Verificar estado de los contenedores
docker compose ps
```

### 2.2. Configuración de Variables de Entorno (`.env`)
Crear el archivo `.env` en `UZDI_BACK/UZDI_BACK/.env`:
```env
# Puerto del Servidor Backend
PORT=3000
NODE_ENV=development

# Conexión a Base de Datos PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=uzdi_db

# Clave Criptográfica JWT (JsonWebToken)
JWT_SECRET=super_secret_snai_uzdi_jwt_key_2026_puce
JWT_EXPIRES_IN=8h

# CORS Multi-Origen (Admite localhost y red local)
CORS_ORIGIN=*
```

### 2.3. Acceso desde el Frontend en Red Local (Multi-Máquina)
Si el compañero de Frontend está en otra laptop conectada a la misma red Wi-Fi:
1. El anfitrión del Backend obtiene su IP local ejecutando en PowerShell:
   ```powershell
   ipconfig
   # Buscar la 'Dirección IPv4' (ejemplo: 192.168.1.45)
   ```
2. El desarrollador de Frontend configura su cliente (Vite / Axios) apuntando a:
   `http://192.168.1.45:3000/api/v1`
3. En el navegador se puede comprobar la conectividad abriendo la documentación Swagger en:
   `http://192.168.1.45:3000/api/docs`

---

## 📖 3. CATÁLOGO MAESTRO Y MATRIZ DOCUMENTAL DE SERVICIOS CRUD (TABLA POR TABLA)

Por disposición de cátedra, cada tabla del sistema debe contar con sus 4 operaciones REST fundamentales documentadas y protegidas por perfil:

| N° | Módulo / Entidad | Tabla Fisiográfica | Método | Endpoint URI | Descripción Funcional | Perfiles con Acceso |
|:--:|:---|:---|:---:|:---|:---|:---|
| **1** | **Auth** | `seguridad.sesn` | `POST` | `/api/v1/auth/login` | Autenticación, emisión de JWT y registro de sesión (`sesnfcin`) | Público |
| **2** | **Auth** | `seguridad.sesn` | `POST` | `/api/v1/auth/logout` | Cierre de sesión activa (`sesnfcfn`) e invalidación | Todos (Autenticados) |
| **3** | **Usuarios** | `seguridad.prsn` | `GET` | `/api/v1/users` | Listado general de usuarios institucionales | Administrador, Coordinador |
| **4** | **Usuarios** | `seguridad.prsn` | `GET` | `/api/v1/users/:id` | Detalle de un usuario por ID | Administrador, Coordinador |
| **5** | **Usuarios** | `seguridad.prsn` | `POST` | `/api/v1/users` | Registro de nuevo usuario (valida perfil obligatorio) | Administrador |
| **6** | **Usuarios** | `seguridad.prsn` | `PUT` | `/api/v1/users/:id` | Actualización de perfil y datos personales | Administrador |
| **7** | **Usuarios** | `seguridad.prsn` | `DELETE` | `/api/v1/users/:id` | Inactivación lógica de usuario (`estado = 'F'`) | Administrador |
| **8** | **Perfiles** | `seguridad.prfl` | `GET` | `/api/v1/perfil` | Catálogo de perfiles institucionales (Juez, Técnico, etc.) | Todos (Autenticados) |
| **9** | **Perfiles** | `seguridad.prfl` | `POST` | `/api/v1/perfil` | Creación de nuevo perfil en el sistema | Administrador |
| **10**| **Perfiles** | `seguridad.prfl` | `PUT` | `/api/v1/perfil/:id` | Modificación de nombre o descripción de perfil | Administrador |
| **11**| **Perfiles** | `seguridad.prfl` | `DELETE`| `/api/v1/perfil/:id` | Inactivación de perfil | Administrador |
| **12**| **Acciones** | `seguridad.accn` | `GET` | `/api/v1/accion` | Catálogo de acciones y permisos del sistema | Administrador |
| **13**| **Acciones** | `seguridad.accn` | `POST` | `/api/v1/accion` | Registro de nueva acción operativa | Administrador |
| **14**| **Acciones** | `seguridad.accn` | `PUT` | `/api/v1/accion/:id` | Actualización de acción | Administrador |
| **15**| **Acciones** | `seguridad.accn` | `DELETE`| `/api/v1/accion/:id` | Inactivación de acción | Administrador |
| **16**| **Permisos** | `seguridad.prms` | `GET` | `/api/v1/permiso` | Matriz de permisos vinculados (Perfil ↔ Acción) | Administrador |
| **17**| **Permisos** | `seguridad.prms` | `POST` | `/api/v1/permiso` | Asignación de acción a un perfil | Administrador |
| **18**| **Permisos** | `seguridad.prms` | `DELETE`| `/api/v1/permiso/:id`| Revocatoria de permiso a perfil | Administrador |
| **19**| **Adolescentes**| `adolescente.adolescente`| `GET` | `/api/v1/adolescente` | Consulta paginada y filtrada de adolescentes | Todos los perfiles |
| **20**| **Adolescentes**| `adolescente.adolescente`| `GET` | `/api/v1/adolescente/:id` | Ficha integral del adolescente infractor | Todos los perfiles |
| **21**| **Adolescentes**| `adolescente.adolescente`| `POST` | `/api/v1/adolescente` | Registro de ingreso de adolescente (cédula/pasaporte) | Técnico, Educador, Admin |
| **22**| **Adolescentes**| `adolescente.adolescente`| `PUT` | `/api/v1/adolescente/:id` | Actualización sociodemográfica del adolescente | Técnico, Educador, Admin |
| **23**| **Adolescentes**| `adolescente.adolescente`| `DELETE`| `/api/v1/adolescente/:id`| Baja lógica del adolescente (`estado = 'F'`) | Administrador, Coordinador |
| **24**| **Catálogos** | `adolescente.etnia` | `GET/POST/PUT/DELETE` | `/api/v1/etnia` | CRUD de catálogo paramétrico de etnias | Admin (Escritura), Todos (Lectura) |
| **25**| **Catálogos** | `adolescente.nacionalidad` | `GET/POST/PUT/DELETE` | `/api/v1/nacionalidad` | CRUD de catálogo paramétrico de nacionalidades | Admin (Escritura), Todos (Lectura) |
| **26**| **Catálogos** | `adolescente.estado_civil`| `GET/POST/PUT/DELETE` | `/api/v1/estado-civil`| CRUD de catálogo de estados civiles | Admin (Escritura), Todos (Lectura) |
| **27**| **Catálogos** | `adolescente.gdo` | `GET/POST/PUT/DELETE` | `/api/v1/gdo` | CRUD de Grupos Delictivos Organizados | Admin (Escritura), Todos (Lectura) |
| **28**| **Geografía** | `estructura_institucional.provincia` | `GET/POST/PUT/DELETE` | `/api/v1/provincia` | CRUD de provincias del Ecuador | Admin (Escritura), Todos (Lectura) |
| **29**| **Geografía** | `estructura_institucional.canton` | `GET/POST/PUT/DELETE` | `/api/v1/canton` | CRUD de cantones por provincia | Admin (Escritura), Todos (Lectura) |
| **30**| **Geografía** | `estructura_institucional.uzdi` | `GET/POST/PUT/DELETE` | `/api/v1/uzdi` | CRUD de sedes UZDI zonales | Admin (Escritura), Todos (Lectura) |
| **31**| **Expedientes**| `adolescente.expediente`| `GET` | `/api/v1/expediente` | Listado de expedientes judiciales con filtros | Juez, Jurídico, Admin |
| **32**| **Expedientes**| `adolescente.expediente`| `GET` | `/api/v1/expediente/:id` | Expediente judicial completo y medidas asociadas | Juez, Jurídico, Admin |
| **33**| **Expedientes**| `adolescente.expediente`| `POST` | `/api/v1/expediente` | Creación de causa judicial (`numero_causa`) | Juez, Jurídico, Admin |
| **34**| **Expedientes**| `adolescente.expediente`| `PUT` | `/api/v1/expediente/:id` | Modificación procesal de causa judicial | Juez, Jurídico, Admin |
| **35**| **Expedientes**| `adolescente.expediente`| `DELETE`| `/api/v1/expediente/:id`| Cierre o baja lógica de expediente | Juez, Administrador |
| **36**| **Medidas Exp**| `adolescente.medida_expediente`| `GET` | `/api/v1/medida-expediente` | Consulta de medidas socioeducativas por causa | Juez, Jurídico, Técnico |
| **37**| **Medidas Exp**| `adolescente.medida_expediente`| `POST` | `/api/v1/medida-expediente` | Asignación secuencial de medida (campo `orden`) | Juez, Jurídico |
| **38**| **Medidas Exp**| `adolescente.medida_expediente`| `PUT` | `/api/v1/medida-expediente/:id` | Modificación de fechas o estado de cumplimiento | Juez, Jurídico, Técnico |
| **39**| **Medidas Exp**| `adolescente.medida_expediente`| `DELETE`| `/api/v1/medida-expediente/:id` | Revocatoria o baja de medida en expediente | Juez, Jurídico |
| **40**| **Infracciones**| `adolescente.infraccion`| `GET/POST/PUT/DELETE` | `/api/v1/infraccion` | Catálogo de delitos e infracciones tipificadas | Jurídico, Admin |
| **41**| **Medidas Cat**| `adolescente.medida_socioeducativa` | `GET/POST/PUT/DELETE` | `/api/v1/medida-socioeducativa` | Catálogo de tipos de medidas (no privativas) | Jurídico, Admin |
| **42**| **Familia** | `contexto_familiar.representante` | `GET/POST/PUT/DELETE` | `/api/v1/representante` | CRUD del representante legal del adolescente | Trabajador Social, Psicólogo |
| **43**| **Parentesco**| `contexto_familiar.tipo_parentesco` | `GET/POST/PUT/DELETE` | `/api/v1/tipo-parentesco` | Catálogo de tipos de parentesco (Madre, Padre, etc.) | Admin, Técnico |
| **44**| **Adolesc-Rep**| `contexto_familiar.adolescente_representante` | `GET/POST/PUT/DELETE` | `/api/v1/adolescente-representante` | Vinculación del adolescente con su tutor legal | Trabajador Social, Técnico |
| **45**| **Talleres** | `talleres_actividades.taller` | `GET/POST/PUT/DELETE` | `/api/v1/taller` | CRUD de talleres formativos y psicoeducativos | Educador, Psicólogo, Admin |
| **46**| **Asistencia** | `talleres_actividades.asistencia_taller` | `GET/POST/PUT/DELETE` | `/api/v1/asistencia-taller` | Control de asistencia (adolescente o tutor) | Educador, Técnico |
| **47**| **Documental** | `gestion_documental.tipo_documento` | `GET/POST/PUT/DELETE` | `/api/v1/tipo-documento` | Catálogo de tipos de actas, informes y resoluciones | Jurídico, Admin |
| **48**| **Documentos** | `gestion_documental.documento_expediente` | `GET/POST/PUT/DELETE` | `/api/v1/documento-expediente` | Archivo digital de evidencias por expediente | Jurídico, Técnico |
| **49**| **Reportes** | *Consolidado UZDI* | `GET` | `/api/v1/reportes/uzdi/adolescentes` | Generación de reporte de adolescentes por UZDI | Coordinador, Admin, SNAI |
| **50**| **Reportes** | *Exportar Excel* | `GET` | `/api/v1/reportes/export/excel` | Descarga de reporte en formato Microsoft Excel (.xlsx) | Coordinador, Admin, SNAI |
| **51**| **Reportes** | *Exportar PDF* | `GET` | `/api/v1/reportes/export/pdf` | Descarga de ficha ejecutiva en PDF institucional | Coordinador, Admin, SNAI |

---

## 👥 4. NUEVA MATRIZ DE ASIGNACIÓN DE ROLES Y RESPONSABILIDADES (5 INTEGRANTES)

La distribución balancea rigurosamente el liderazgo técnico, la seguridad transversal, la consistencia de datos y los módulos de soporte:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ MAESTRA DE RESPONSABILIDADES — BACKEND UZDI                              │
├────────────────────┬───────┬───────────────────────────────────────────────────────────────────────────┤
│ Desarrollador      │ N° T. │ Área de Responsabilidad y Módulos Asignados                               │
├────────────────────┼───────┼───────────────────────────────────────────────────────────────────────────┤
│ Paúl Rosero        │   6   │ Arquitectura Core, JWT Guard, Multi-CORS IP, Swagger OpenAPI y Motor Rep. │
│ Joan Santacruz     │   4   │ Dominio Judicial: Expedientes, Medidas por Causa, Infracciones y CONA     │
│ Gabriel Aguinaga   │   4   │ Dominio Seguridad: Login Criptográfico, Sesiones, Perfiles y RBAC ER CAI  │
│ Alejandro Flores   │   4   │ Dominio Central de Adolescentes, Catálogos Paramétricos y Geografía UZDI  │
│ Joselyn Cadena     │   4   │ Red Familiar, Talleres/Asistencia, Gestión Documental y Vistas de Reporte │
└────────────────────┴───────┴───────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 1. Paúl Rosero — Líder Técnico, Arquitectura Core y Seguridad Base
* **Tarea 1.1: Módulo Criptográfico JWT de Producción (`@nestjs/jwt` + `JwtAuthGuard`):**  
  Implementar el servicio de firma y verificación de tokens con clave secreta y tiempo de expiración. Configurar el Guard global que extrae el token del header `Authorization: Bearer <token>`, valida su autenticidad y rechaza peticiones no autorizadas con HTTP 401.
* **Tarea 1.2: Configuración Dinámica de CORS Multi-Origen y Acceso por Red Local:**  
  Actualizar `main.ts` con resolución dinámica de orígenes permitidos (localhost, IPs locales `192.168.x.x` y Docker network) permitiendo que cualquier miembro del Frontend consuma la API desde su propia laptop sin bloqueos de navegador.
* **Tarea 1.3: Documentación OpenAPI / Swagger 3.0 Exhaustiva (`/api/docs`):**  
  Configurar la especificación interactiva completa con esquemas de DTOs, ejemplos de JSON en peticiones/respuestas, códigos de retorno y botón de autorización interactiva (*Authorize Bearer JWT*).
* **Tarea 1.4: Motor Base del Módulo de Reportes Institucionales SNAI:**  
  Crear el `ReportesModule` con la lógica genérica de generación de archivos en memoria (generación tabular con formato Excel mediante `exceljs` y fichas ejecutivas con `pdfkit` / HTML-to-PDF).
* **Tarea 1.5: Verificación de Trazabilidad y Middleware de Auditoría Transaccional:**  
  Garantizar que `AuditContextMiddleware` propague de forma transparente `SET LOCAL app.usuario_id` hacia las conexiones activas de PostgreSQL para alimentar los triggers de `seguridad.historial`.
* **Tarea 1.6: Contenerización y Guía de Despliegue Frontend-Backend:**  
  Afinar `docker-compose.yml`, documentar el mapeo de puertos (`3000:3000` y `5432:5432`) y coordinar con el equipo de Frontend las pruebas de consumo en vivo.

---

### 🔹 2. Joan Santacruz — Dominio Judicial, Medidas y Ejecución Procesal
* **Tarea 2.1: CRUD Completo y DTOs del Módulo `Expedientes`:**  
  Asegurar los métodos `GET`, `POST`, `PUT`, `DELETE` (lógico) en `ExpedienteController`, implementando el campo institucional `numero_causa` con validación de unicidad y relación con el adolescente infractor.
* **Tarea 2.2: Implementación y Control Secuencial de `MedidaExpediente`:**  
  Asegurar que cada expediente pueda contener múltiples medidas socioeducativas ordenadas cronológica o simultáneamente (campo obligatorio `orden` según el Código de la Niñez y Adolescencia - CONA).
* **Tarea 2.3: Catálogo Paramétrico de Infracciones y Medidas Socioeducativas:**  
  Completar endpoints y DTOs para `infraccion` y `medida_socioeducativa` asegurando la persistencia de estados lógicos (`CHAR(1)` 'V'/'F').
* **Tarea 2.4: Matriz de Control de Acceso Judicial (Juez y Defensor):**  
  Asociar los decoradores `@Roles` y validar que únicamente perfiles con competencia jurídica puedan modificar sentencias o añadir nuevas medidas a los expedientes.

---

### 🔹 3. Gabriel Aguinaga — Dominio de Seguridad, Perfiles y Matriz ER CAI
* **Tarea 3.1: Ciclo de Vida de Autenticación y Registro de Sesiones (`sesn`):**  
  Integrar en `AuthService` el hashing seguro de contraseñas con `bcrypt` y el registro obligatorio de apertura de sesión (`sesnfcin`) y cierre de sesión (`sesnfcfn`).
* **Tarea 3.2: CRUD Completo del Recuadro ER CAI (`prfl`, `accn`, `prms`):**  
  Asegurar los controladores y servicios para administrar perfiles (`prfl`), acciones del sistema (`accn`) y la asignación relacional de permisos en la tabla asociativa `seguridad.prms`.
* **Tarea 3.3: Guard de Autorización Dinámica RBAC basado en Base de Datos:**  
  Refactorizar el `RolesGuard` para consultar la tabla `seguridad.prms` y corroborar en tiempo real si el perfil asignado al usuario logueado tiene habilitada la acción requerida por el endpoint.
* **Tarea 3.4: Gestión de Usuarios (`prsn`) y Precedencia Institucional (RF-12):**  
  Validar en `UsersService` que no se permita el registro de una persona sin haber asignado previamente un perfil válido y activo en el sistema.

---

### 🔹 4. Alejandro Flores — Núcleo Sociodemográfico y Catálogos Geográficos
* **Tarea 4.1: CRUD Integral y Validaciones Robustas de `Adolescente`:**  
  Asegurar los endpoints de registro, consulta y actualización de adolescentes infractores, permitiendo el ingreso flexible de cédula ecuatoriana (10 dígitos) o pasaporte mediante expresiones regulares en los DTOs.
* **Tarea 4.2: Catálogos Paramétricos Sociodemográficos:**  
  Garantizar el funcionamiento completo de los CRUDs de soporte demográfico: `nacionalidad`, `estado_civil`, `etnia` y Grupos Delictivos Organizados (`gdo`).
* **Tarea 4.3: Estructura Geográfica Institucional (`provincia`, `canton`, `uzdi`):**  
  Asegurar las relaciones de integridad referencial y endpoints de filtrado jerárquico (obtener cantones por provincia y UZDIs por cantón) para alimentar los selectores dinámicos del Frontend.
* **Tarea 4.4: Documentación y Validación de Integración Demográfica:**  
  Generar los DTOs con decoradores de Swagger (`@ApiProperty`) para que los catálogos aparezcan auto-documentados con ejemplos reales en `/api/docs`.

---

### 🔹 5. Joselyn Cadena (Lizz) — Red Familiar, Talleres, Gestión Documental y Reportes
* **Tarea 5.1: Módulo de Contexto Familiar (`representante` y `tipo_parentesco`):**  
  Implementar el CRUD de representantes legales y la tabla asociativa `adolescente_representante`, garantizando el registro de parentesco y datos de contacto actualizados.
* **Tarea 5.2: Módulo de Talleres y Control de Asistencia:**  
  Implementar el registro de talleres psicoeducativos (`taller`) y la asistencia (`asistencia_taller`), validando la regla de negocio explicada en cátedra: si asiste el propio adolescente o acude el representante legal.
* **Tarea 5.3: Módulo de Gestión Documental (`tipo_documento` y `documento_expediente`):**  
  Crear los endpoints para asociar actas, informes de cumplimiento y documentos judiciales escaneados a las causas activas en los expedientes.
* **Tarea 5.4: Implementación de Endpoints y Vistas de Reportes SNAI:**  
  Consumir el motor base de reportes para exponer las consultas operativas requeridas por el SNAI: Listado de adolescentes por sede UZDI y exportación en formatos descargables (Excel y PDF).

---

## 🌿 5. PROTOCOLO DE TRABAJO CON GIT Y GITHUB DESKTOP

Para evitar conflictos de fusión y trabajar con total transparencia:

### 5.1. Nombres de Ramas Obligatorios
* `feature/arquitectura-jwt-paul`
* `feature/expedientes-medidas-joan`
* `feature/seguridad-rbac-gabriel`
* `feature/adolescentes-geografia-alejo`
* `feature/familiar-talleres-reportes-lizz`

### 5.2. Uso Recomendado con GitHub Desktop
1. **Abrir el repositorio:** En GitHub Desktop, seleccionar `File -> Add Local Repository` y elegir la carpeta `UZDI_BACK/UZDI_BACK`.
2. **Sincronizar `main`:** Antes de comenzar el día, ubicarse en la rama `main` y presionar **Fetch origin** / **Pull origin**.
3. **Crear o cambiar a tu rama:** En el selector de ramas superior, hacer clic en tu rama `feature/...`.
4. **Hacer commits diarios:** Escribir un resumen claro en el recuadro inferior izquierdo (ejemplo: `feat(expedientes): agregar endpoints CRUD con DTOs`) y presionar **Commit to feature/...**.
5. **Subir al servidor:** Presionar el botón superior **Push origin**.
6. **Crear Pull Request:** Al completar las tareas, presionar **Create Pull Request** para que el líder técnico revise la compilación e integre a `main`.

---

## 📅 6. CRONOGRAMA DE ENTREGABLES (4 SEMANAS HACIA LA SUSTENTACIÓN)

| Semana | Hito Principal | Entregable Técnico Clave | Criterio de Aceptación |
|:---:|:---|:---|:---|
| **Semana 1** | **Seguridad, JWT y Conectividad** | JWT Guard operativo + CORS Multi-IP + CRUDs de Seguridad y Catálogos | Login emite token real; peticiones sin token devuelven 401; Frontend se conecta por IP local sin error CORS. |
| **Semana 2** | **Expedientes, Medidas y Red Familiar** | CRUDs de Expediente, MedidaExpediente, Representante y Talleres | Registro secuencial de medidas según CONA; relación adolescente-tutor verificada en base de datos. |
| **Semana 3** | **Gestión Documental y Motor de Reportes** | Subida de documentos + Endpoints de Reportes UZDI (Excel y PDF) | Generación de reporte consolidado en Swagger y descarga de archivos `.xlsx` y `.pdf` funcionales. |
| **Semana 4** | **Auditoría, Swagger Final y Simulacro** | API 100% documentada en `/api/docs` + Pruebas E2E con Frontend | Demostración integral del flujo ante delegados del SNAI y docentes de cátedra. |

---

*Documento técnico oficializado para el equipo de desarrollo de Backend — Proyecto SNAI / UZDI — PUCE 2026.*
