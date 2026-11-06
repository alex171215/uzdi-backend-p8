# 🚀 PLAN DE TRABAJO — FASE 2: NUEVAS DIRECTRICES TÉCNICAS, CATÁLOGO CRUD, MANUALES Y DISTRIBUCIÓN FINAL

**Proyecto:** Sistema de Gestión Integral de Adolescentes Infractores — UZDI (SNAI – PUCE)  
**Versión de Base de Datos:** DDL Versión 8 Oficial (`Back Ecologia (1).sql`)  
**Stack Tecnológico:** NestJS 11 + TypeScript + TypeORM + PostgreSQL 15 + Swagger (OpenAPI 3.0) + Docker  
**Integrantes:**  
* **Paúl Rosero** (Líder Técnico, Arquitectura Core e Infraestructura)  
* **Joan Santacruz** (Dominio Judicial, Medidas Socioeducativas y Diagrama ER Oficial)  
* **Gabriel Aguinaga** (Dominio de Seguridad ER CAI, RBAC y Despliegue en Servidores Linux)  
* **Alejandro Flores** (Dominio Sociodemográfico y Catálogo de Especificación API para Frontend)  
* **Joselyn Cadena** (Red Familiar, Talleres, Gestión Documental y Manual de Usuario Final)  
**Fecha de Emisión:** Noviembre 2026 — *Fase de Cierre (4 semanas para entrega y sustentación ante SNAI)*  

---

## 📌 1. ANTECEDENTES Y ESTADO DEL PROYECTO

La **Fase 1** del proyecto (contenerización inicial, DDL v8, transformadores de estado lógico `BooleanVF`, filtros de excepción, interceptor de respuestas y los CRUDs fundamentales de las tareas 1.1 a 5.3) se encuentra **100% completada y fusionada en la rama principal (`main`)**.

Este nuevo documento establece las **directrices técnicas avanzadas, los nuevos requerimientos solicitados por el docente en cátedra** (con base en el análisis minucioso de las grabaciones *Uzdi 2.m4a*, *Uzdi 2.1.m4a*, *Uzdi 3.m4a*, *Uzdi 4.m4a* y el recuadro de seguridad del diagrama *ER CAI*), así como la **distribución definitiva de responsabilidades** tanto en código como en los documentos formales requeridos para la entrega de este viernes y la sustentación final ante delegados del SNAI y la PUCE.

---

## 🎯 2. AUDITORÍA EXHAUSTIVA DE LAS INDICACIONES DEL DOCENTE

A partir de las sesiones de cátedra y las grabaciones, se auditan y consolidan los requerimientos obligatorios:

### 2.1. Arquitectura REST y Convenciones de Endpoints
* La API debe regirse bajo principios **REST estrictos**: verbos semánticos (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`).
* Códigos de estado HTTP rigurosos: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.
* Formato de respuesta institucional unificado:
  ```json
  {
    "ok": true,
    "message": "Descripción clara de la operación realizada",
    "data": { ... }
  }
  ```

### 2.2. Seguridad Criptográfica JWT (JsonWebToken)
* **Directriz del Ingeniero:** *"Debemos recibir un token desde el backend y es quien permite realizar la siguiente pregunta, hay que manejar el JWT. Entonces el back es quien maneja el jwt; si el token está malo, no se procede."*
* **Flujo Operativo:**
  1. `POST /api/v1/auth/login` valida credenciales contra la BD (mediante hash `bcrypt`) y genera un token JWT firmado criptográficamente con tiempo de expiración (8 horas).
  2. Cada petición subsiguiente a cualquier endpoint protegido debe adjuntar el encabezado `Authorization: Bearer <token>`.
  3. El guard global `JwtAuthGuard` intercepta la petición. Si el token no existe, está corrupto o expiró, responde de inmediato con `401 Unauthorized` bloqueando el procesamiento.
  4. Únicamente las rutas marcadas explícitamente con el decorador `@Public()` (ej. login y verificación de salud de la API) quedan exentas.

### 2.3. Control de Acceso por Perfiles — Recuadro Modelo ER CAI (`prsn`, `prfl`, `accn`, `prms`, `sesn`)
* **Directriz del Ingeniero:** En el recuadro inferior del diagrama ER CAI se detalla la matriz de seguridad por perfil:
  * `seguridad.prsn`: Persona/Usuario institucional.
  * `seguridad.prfl`: Catálogo de perfiles (`ADM`, `CORD`, `LEGAL`, `TSOC`, `PSIC`, `EDUC`, `CONS`).
  * `seguridad.accn`: Catálogo de acciones y módulos operativos del sistema.
  * `seguridad.prms`: Permisos otorgados (tabla asociativa que mapea `prfl_id` con `accn_id`).
  * `seguridad.sesn`: Registro de apertura (`sesnfcin`) y cierre (`sesnfcfn`) de sesiones activas.
* La autorización valida en tiempo real si el perfil del usuario autenticado tiene habilitada en `seguridad.prms` la acción correspondiente a la ruta invocada.

### 2.4. Conectividad Frontend-Backend, Red Local y Políticas de CORS
* **Directriz del Ingeniero:** *"Hay que tener subido el backend, ya sea en un puerto local o usando Docker o alguna forma, además de darle acceso al front, haciendo que la IP del front ingrese con una petición al backend, tomando en cuenta el cors para dar permisos, permitiendo que la IP del front se conecte por petición al backend, evitando el conflicto por ingreso cruzado."*
* El backend escucha en `0.0.0.0:3000` y cuenta con un manejador de CORS dinámico que autoriza peticiones desde `localhost:5173`, `localhost:5174`, `127.0.0.1` y cualquier IP de red local (`192.168.x.x` o `10.x.x.x`), permitiendo que el desarrollador de Frontend consuma los servicios desde su máquina sin bloqueos de navegador.

### 2.5. Auditoría Transaccional en Base de Datos
* Se mantiene la auditoría nativa mediante triggers en PostgreSQL sobre la tabla `seguridad.historial`.
* La API propaga el usuario conectado mediante la instrucción transaccional `SET LOCAL app.usuario_id = ...` en el middleware `AuditContextMiddleware`.

### 2.6. Reportes Oficiales SNAI (Grabación Uzdi 3)
* **Directriz del Ingeniero:** No esperar a que los delegados del SNAI o la UZDI Ambato nos envíen formatos, pues suelen demorar. El equipo debe proponer y dejar listos los reportes institucionales estándar:
  1. **Consolidado de Adolescentes por Sede UZDI:** Listado con filtros de provincia, cantón, UZDI, datos demográficos y medidas activas.
  2. **Ficha de Expedientes y Medidas Judiciales:** Resumen del estado procesal y ejecución de medidas.
  3. **Exportación Dual:** Capacidad de descargar la información tanto en formato **Microsoft Excel (.xlsx)** como en **PDF (.pdf)** institucional.

### 2.7. Documentación Técnica Formal y Manuales Requeridos (Grabación Uzdi 4)
* **Documento 1: Catálogo y Especificación Técnica de Servicios (API REST para Frontend):**  
  El docente enfatizó que el equipo de Frontend no va a consultar código fuente ni únicamente Swagger como usuario final. Se requiere un documento formal que detalle para cada endpoint:
  * URL/Dirección completa (ej. `GET /api/v1/adolescente`).
  * Método HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  * Búsquedas soportadas: Búsqueda por ID (`:id`) y búsqueda por texto coincidente (`search?q=...` por nombre, apellido, cédula).
  * Estructura de entrada: Parámetros URL o JSON en el Request Body con tipos de datos.
  * Estructura de respuesta exitosa (código 200/201 con el JSON exacto esperado).
  * Estructura de respuesta en error (código 400/404/500 con el mensaje descriptivo y la causa real de la falla, sin mensajes genéricos o vacíos como *"ocurrió un error"*).
* **Documento 2: Guía y Manual de Usuario Final:**  
  Manual descriptivo para el personal institucional (Coordinador, Juez, Técnico, Psicólogo, Trabajador Social, Educador) con el flujo funcional paso a paso y maquetas/capturas.
* **Documento 3: Guía de Instalación y Despliegue en Servidores Linux:**  
  El docente indicó que el servidor final de producción corre en Linux (Ubuntu/Debian). Se requiere una guía paso a paso de despliegue (opción Docker y opción nativa con Node.js, PM2, PostgreSQL y Nginx).
* **Documento 4: Redibujo y Actualización del Diagrama Entidad-Relación (DER Oficial):**  
  Redibujar el DER formal bajo la notación y metodología enseñada por el Ing. Guido, basándose en la imagen de referencia del EVA PUCE (`https://eva.puce.edu.ec/QUI-202602R/mod/resource/view.php?id=246449` / archivo `modelo ER CAI.jpeg`), incorporando en cada tabla los campos de auditoría obligatorios `fcCrea` y `fcMod`, y las nuevas tablas del DDL v8 (`medida_expediente`, `infraccion`, etc.).

---

## 📖 3. CATÁLOGO MAESTRO Y MATRIZ DOCUMENTAL DE SERVICIOS CRUD (TABLA POR TABLA)

Por disposición de cátedra, cada tabla del sistema debe contar con sus operaciones REST fundamentales documentadas y protegidas por perfil:

| N° | Módulo / Entidad | Tabla Fisiográfica | Método | Endpoint URI | Descripción Funcional | Perfiles con Acceso |
|:--:|:---|:---|:---:|:---|:---|:---|
| **1** | **Auth** | `seguridad.sesn` | `POST` | `/api/v1/auth/login` | Autenticación, emisión de JWT y registro de sesión (`sesnfcin`) | Público |
| **2** | **Auth** | `seguridad.sesn` | `POST` | `/api/v1/auth/logout` | Cierre de sesión activa (`sesnfcfn`) e invalidación de token | Todos (Autenticados) |
| **3** | **Usuarios** | `seguridad.prsn` | `GET` | `/api/v1/users` | Listado general de usuarios institucionales | Administrador, Coordinador |
| **4** | **Usuarios** | `seguridad.prsn` | `GET` | `/api/v1/users/:id` | Detalle de un usuario por identificador | Administrador, Coordinador |
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
| **19**| **Adolescentes**| `adolescente.adolescente`| `GET` | `/api/v1/adolescente` | Consulta general de adolescentes activos | Todos los perfiles |
| **20**| **Adolescentes**| `adolescente.adolescente`| `GET` | `/api/v1/adolescente/:id` | Ficha integral del adolescente por ID | Todos los perfiles |
| **21**| **Adolescentes**| `adolescente.adolescente`| `GET` | `/api/v1/adolescente/search` | Búsqueda por texto (nombre, apellido, cédula) | Todos los perfiles |
| **22**| **Adolescentes**| `adolescente.adolescente`| `POST` | `/api/v1/adolescente` | Registro de ingreso de adolescente (cédula/pasaporte) | Técnico, Educador, Admin |
| **23**| **Adolescentes**| `adolescente.adolescente`| `PUT` | `/api/v1/adolescente/:id` | Actualización sociodemográfica del adolescente | Técnico, Educador, Admin |
| **24**| **Adolescentes**| `adolescente.adolescente`| `DELETE`| `/api/v1/adolescente/:id`| Baja lógica del adolescente (`estado = 'F'`) | Administrador, Coordinador |
| **25**| **Catálogos** | `adolescente.etnia` | `GET/POST/PUT/DELETE` | `/api/v1/etnia` | CRUD de catálogo paramétrico de etnias | Admin (Escritura), Todos (Lectura) |
| **26**| **Catálogos** | `adolescente.nacionalidad` | `GET/POST/PUT/DELETE` | `/api/v1/nacionalidad` | CRUD de catálogo paramétrico de nacionalidades | Admin (Escritura), Todos (Lectura) |
| **27**| **Catálogos** | `adolescente.estado_civil`| `GET/POST/PUT/DELETE` | `/api/v1/estado-civil`| CRUD de catálogo de estados civiles | Admin (Escritura), Todos (Lectura) |
| **28**| **Catálogos** | `adolescente.gdo` | `GET/POST/PUT/DELETE` | `/api/v1/gdo` | CRUD de Grupos Delictivos Organizados | Admin (Escritura), Todos (Lectura) |
| **29**| **Geografía** | `estructura_institucional.provincia` | `GET/POST/PUT/DELETE` | `/api/v1/provincia` | CRUD de provincias del Ecuador | Admin (Escritura), Todos (Lectura) |
| **30**| **Geografía** | `estructura_institucional.canton` | `GET/POST/PUT/DELETE` | `/api/v1/canton` | CRUD de cantones por provincia | Admin (Escritura), Todos (Lectura) |
| **31**| **Geografía** | `estructura_institucional.uzdi` | `GET/POST/PUT/DELETE` | `/api/v1/uzdi` | CRUD de sedes UZDI zonales | Admin (Escritura), Todos (Lectura) |
| **32**| **Expedientes**| `adolescente.expediente`| `GET` | `/api/v1/expediente` | Listado de expedientes judiciales con filtros | Juez, Jurídico, Admin |
| **33**| **Expedientes**| `adolescente.expediente`| `GET` | `/api/v1/expediente/:id` | Expediente judicial completo y medidas asociadas | Juez, Jurídico, Admin |
| **34**| **Expedientes**| `adolescente.expediente`| `POST` | `/api/v1/expediente` | Creación de causa judicial (`numero_causa`) | Juez, Jurídico, Admin |
| **35**| **Expedientes**| `adolescente.expediente`| `PUT` | `/api/v1/expediente/:id` | Modificación procesal de causa judicial | Juez, Jurídico, Admin |
| **36**| **Expedientes**| `adolescente.expediente`| `DELETE`| `/api/v1/expediente/:id`| Cierre o baja lógica de expediente | Juez, Administrador |
| **37**| **Medidas Exp**| `adolescente.medida_expediente`| `GET` | `/api/v1/medida-expediente` | Consulta de medidas socioeducativas por causa | Juez, Jurídico, Técnico |
| **38**| **Medidas Exp**| `adolescente.medida_expediente`| `POST` | `/api/v1/medida-expediente` | Asignación secuencial de medida (campo `orden` CONA) | Juez, Jurídico |
| **39**| **Medidas Exp**| `adolescente.medida_expediente`| `PUT` | `/api/v1/medida-expediente/:id` | Modificación de fechas o estado de cumplimiento | Juez, Jurídico, Técnico |
| **40**| **Medidas Exp**| `adolescente.medida_expediente`| `DELETE`| `/api/v1/medida-expediente/:id` | Revocatoria o baja de medida en expediente | Juez, Jurídico |
| **41**| **Infracciones**| `adolescente.infraccion`| `GET/POST/PUT/DELETE` | `/api/v1/infraccion` | Catálogo de delitos e infracciones tipificadas | Jurídico, Admin |
| **42**| **Medidas Cat**| `adolescente.medida_socioeducativa` | `GET/POST/PUT/DELETE` | `/api/v1/medida-socioeducativa` | Catálogo de tipos de medidas (no privativas) | Jurídico, Admin |
| **43**| **Familia** | `contexto_familiar.representante` | `GET/POST/PUT/DELETE` | `/api/v1/representante` | CRUD del representante legal del adolescente | Trabajador Social, Psicólogo |
| **44**| **Parentesco**| `contexto_familiar.tipo_parentesco` | `GET/POST/PUT/DELETE` | `/api/v1/tipo-parentesco` | Catálogo de tipos de parentesco (Madre, Padre, etc.) | Admin, Técnico |
| **45**| **Adolesc-Rep**| `contexto_familiar.adolescente_representante` | `GET/POST/PUT/DELETE` | `/api/v1/adolescente-representante` | Vinculación del adolescente con su tutor legal | Trabajador Social, Técnico |
| **46**| **Talleres** | `talleres_actividades.taller` | `GET/POST/PUT/DELETE` | `/api/v1/taller` | CRUD de talleres formativos y psicoeducativos | Educador, Psicólogo, Admin |
| **47**| **Asistencia** | `talleres_actividades.asistencia_taller` | `GET/POST/PUT/DELETE` | `/api/v1/asistencia-taller` | Control de asistencia (adolescente o tutor) | Educador, Técnico |
| **48**| **Documental** | `gestion_documental.tipo_documento` | `GET/POST/PUT/DELETE` | `/api/v1/tipo-documento` | Catálogo de tipos de actas, informes y resoluciones | Jurídico, Admin |
| **49**| **Documentos** | `gestion_documental.documento_expediente` | `GET/POST/PUT/DELETE` | `/api/v1/documento-expediente` | Archivo digital de evidencias por expediente | Jurídico, Técnico |
| **50**| **Reportes** | *Consolidado UZDI* | `GET` | `/api/v1/reportes/uzdi/adolescentes` | Generación de reporte de adolescentes por UZDI | Coordinador, Admin, SNAI |
| **51**| **Reportes** | *Exportar Excel/PDF* | `GET` | `/api/v1/reportes/export/:formato` | Descarga de reporte en Microsoft Excel (.xlsx) o PDF (.pdf) | Coordinador, Admin, SNAI |

---

## 👥 4. MATRIZ DEFINITIVA DE ASIGNACIÓN DE TAREAS — FASE 2 (5 INTEGRANTES)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE ASIGNACIÓN DE ROLES Y RESPONSABILIDADES — FASE 2                      │
├────────────────────┬───────┬───────────────────────────────────────────────────────────────────────────┤
│ Desarrollador      │ N° T. │ Área de Responsabilidad y Entregables Asignados                           │
├────────────────────┼───────┼───────────────────────────────────────────────────────────────────────────┤
│ Paúl Rosero        │   6   │ Arquitectura Core, JWT Guard, Multi-CORS IP, Swagger OpenAPI y Motor Rep. │
│ Joan Santacruz     │   5   │ Dominio Judicial: Expedientes, Medidas CONA y Redibujo de Diagrama ER    │
│ Alejandro Flores   │   4   │ Documento Catálogo API (Frontend), Búsquedas y Catálogos Paramétricos     │
│ Joselyn Cadena     │   4   │ Documento Manual de Usuario Final, Red Familiar y Vistas de Reportes      │
│ Gabriel Aguinaga   │   4   │ Documento Guía Despliegue en Linux, Seguridad ER CAI y Matriz RBAC en BD  │
└────────────────────┴───────┴───────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 1. Paúl Rosero — Líder Técnico, Arquitectura Core y Seguridad Base

* **Tarea 1.1: Módulo Criptográfico JWT de Producción (`@nestjs/jwt` + `JwtAuthGuard`):**  
  Implementar la firma criptográfica de tokens con tiempo de expiración (8h), payload institucional (`sub`, `username`, `email`, `prfl_id`, `rol`, `sesion_id`) y configurar el Guard global de intercepción para rechazar automáticamente cualquier petición sin token válido con HTTP 401. *(Implementado y compilado).*
* **Tarea 1.2: Configuración Dinámica de CORS Multi-Origen y Exposición LAN:**  
  Configurar en `main.ts` la resolución dinámica de orígenes permitidos (localhost, IPs locales `192.168.x.x`, `10.x.x.x` y Docker network) y poner al servidor a escuchar en `0.0.0.0:3000` para que el desarrollador de Frontend se conecte desde su propia máquina sin bloqueos de navegador. *(Implementado).*
* **Tarea 1.3: Documentación OpenAPI / Swagger 3.0 Interactiva Global:**  
  Configurar la especificación interactiva en `/api/docs` con esquemas de DTOs, ejemplos de JSON en peticiones/respuestas, códigos de retorno y botón de autorización interactiva (*Authorize Bearer JWT*). *(Implementado).*
* **Tarea 1.4: Motor Base del Módulo de Reportes Institucionales SNAI:**  
  Crear el `ReportesModule` con la lógica genérica de generación de archivos en memoria (generación tabular con formato Excel mediante `exceljs` y fichas ejecutivas con `pdfkit` / HTML-to-PDF).
* **Tarea 1.5: Verificación de Trazabilidad y Middleware de Auditoría Transaccional:**  
  Garantizar que `AuditContextMiddleware` propague de forma transparente `SET LOCAL app.usuario_id` hacia las conexiones activas de PostgreSQL para alimentar los triggers de `seguridad.historial`.
* **Tarea 1.6: Contenerización Docker Multi-Plataforma y Scripts de Inicio:**  
  Afinar `docker-compose.yml`, documentar el mapeo de puertos (`3000:3000` y `5432:5432`) y coordinar con el equipo de Frontend las pruebas de consumo en vivo.

---

### 🔹 2. Joan Santacruz — Dominio Judicial, Medidas CONA y Redibujo de Diagrama ER

* **Tarea 2.1: CRUD Completo y DTOs del Módulo `Expedientes`:**  
  Asegurar los métodos `GET`, `POST`, `PUT`, `DELETE` (lógico) en `ExpedienteController`, implementando el campo institucional `numero_causa` con validación de unicidad y relación con el adolescente.
* **Tarea 2.2: Control Secuencial de Medidas Socioeducativas (`MedidaExpediente` según CONA):**  
  Asegurar que cada expediente pueda contener múltiples medidas socioeducativas ordenadas cronológica o simultáneamente (campo obligatorio `orden` según el Código de la Niñez y Adolescencia).
* **Tarea 2.3: Catálogo Paramétrico de Infracciones y Tipos de Medidas:**  
  Completar endpoints y DTOs para `infraccion` y `medida_socioeducativa` asegurando la persistencia de estados lógicos (`CHAR(1)` 'V'/'F') y filtros de búsqueda.
* **Tarea 2.4: Matriz de Control de Acceso Judicial y Reglas Legales:**  
  Asociar los decoradores de seguridad y validar que únicamente perfiles con competencia jurídica (`LEGAL`, `JUEZ`, `ADM`) puedan modificar resoluciones judiciales o añadir medidas a los expedientes.
* **Tarea 2.5: REDIBUJO Y ACTUALIZACIÓN DEL DIAGRAMA ENTIDAD-RELACIÓN (DER) OFICIAL SEGÚN METODOLOGÍA DEL ING. GUIDO:**  
  *Responsabilidad Principal según directriz de cátedra y recurso EVA PUCE (`https://eva.puce.edu.ec/QUI-202602R/mod/resource/view.php?id=246449` / archivo `modelo ER CAI.jpeg`):*
  * Redibujar el Diagrama Entidad-Relación oficial aplicando la notación formal enseñada por el Ing. Guido.
  * Incorporar en **cada una de las tablas** los atributos de auditoría obligatorios: `fcCrea` (fecha de creación) y `fcMod` (fecha de modificación).
  * Reflejar con precisión las relaciones del recuadro de seguridad ER CAI (`prsn`, `prfl`, `accn`, `prms`, `sesn`).
  * Incluir la nueva relación de expedientes y medidas (`medida_expediente` con el atributo `orden` según el CONA, eliminando la FK directa `mdso_id` de expediente).
  * Incluir las entidades del contexto familiar (`representante`, `tipo_parentesco`, `adolescente_representante`), talleres (`taller`, `asistencia_taller`), gestión documental (`tipo_documento`, `documento_expediente`), estructura geográfica (`provincia`, `canton`, `uzdi`) y catálogos (`etnia`, `nacionalidad`, `estado_civil`, `gdo`).
  * Entregar el diagrama en alta resolución (PNG/PDF) y archivo editable para ser incluido en la documentación técnica de entrega de este viernes.

---

### 🔹 3. Alejandro Flores — Documento de Catálogo Técnico de Servicios API (Frontend) y Núcleo Sociodemográfico

* **Tarea 3.1: ELABORACIÓN DEL DOCUMENTO DE ESPECIFICACIÓN TÉCNICA DE SERVICIOS CRUD (CATÁLOGO PARA FRONTEND):**  
  *Responsabilidad Principal según Audio Uzdi 4:* Redactar el documento formal de la API para el equipo de Frontend. Debe incluir para cada una de las tablas del sistema:
  * URL/Dirección completa (ej. `GET /api/v1/adolescente`).
  * Método HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  * Estructura de parámetros de búsqueda: búsqueda por ID (`:id`) y búsqueda por texto coincidente (`search?q=...` por cédula, nombres, apellidos).
  * Estructura del JSON que el frontend debe enviar (Request Body con tipos y restricciones).
  * Estructura del JSON que el backend devuelve en caso de éxito (código 200/201 con `{ ok: true, data: { ... } }`).
  * Estructura del JSON en caso de error (código 400/404/500 con mensaje explicativo real y detallado del motivo del fallo, evitando mensajes genéricos como *"ocurrió un error"*).
* **Tarea 3.2: Endpoints de Búsqueda Avanzada de Adolescentes (ID y Texto):**  
  Asegurar en `AdolescenteController` el soporte para búsqueda por identificador (`/adolescente/:id`) y búsqueda por texto/coincidencia (`/adolescente/search?q=...`) por nombre, apellido o cédula.
* **Tarea 3.3: Catálogos Paramétricos del Adolescente con Ejemplos Documentados:**  
  Completar los DTOs y respuestas de `nacionalidad`, `estado_civil`, `etnia` y `gdo`, asegurando que cuenten con datos de prueba realistas para el frontend.
* **Tarea 3.4: Estructura Geográfica Institucional en Cascada:**  
  Verificar los endpoints de `provincia`, `canton` y `uzdi` garantizando que el Frontend pueda cargar los selectores en cascada (cantones por provincia y UZDIs por cantón).

---

### 🔹 4. Joselyn Cadena (Lizz) — Manual de Usuario Final, Red Familiar y Vistas de Reporte

* **Tarea 4.1: ELABORACIÓN DEL DOCUMENTO DE GUÍA Y MANUAL DE USUARIO DEL SISTEMA UZDI:**  
  *Responsabilidad Principal según Audios Uzdi 2.1 y Uzdi 4:* Redactar el manual de usuario institucional dirigido al personal administrativo y técnico del SNAI/UZDI:
  * Introducción y propósitos del sistema de gestión de medidas socioeducativas.
  * Guía de acceso al sistema (inicio de sesión, cambio de contraseña, roles).
  * Manual de operación por perfiles (Coordinador, Profesional Legal, Psicólogo, Trabajador Social, Educador).
  * Flujo operativo paso a paso: ingreso de adolescentes, consulta de expediente, registro de familiares/tutores, asignación a talleres y registro de asistencia.
  * Formato estructurado con capturas de pantalla, pasos numerados y advertencias institucionales.
* **Tarea 4.2: Módulo de Contexto Familiar y Tutoría Legal:**  
  Asegurar los endpoints CRUD de `representante`, `tipo_parentesco` y la relación `adolescente_representante`, garantizando que la ficha familiar esté vinculada al adolescente.
* **Tarea 4.3: Módulo de Talleres y Regla de Negocio de Asistencia:**  
  Implementar en `taller` y `asistencia_taller` la validación requerida en cátedra: registrar si la asistencia al taller corresponde al adolescente infractor o al representante legal.
* **Tarea 4.4: Implementación de Endpoints y Vistas de Reportes SNAI:**  
  Consumir el motor base de reportes para exponer las consultas operativas del SNAI: Listado de adolescentes por sede UZDI y endpoints para descarga de archivos en formato Excel y PDF.

---

### 🔹 5. Gabriel Aguinaga — Seguridad ER CAI, Matriz RBAC en BD y Despliegue en Linux

* **Tarea 5.1: ELABORACIÓN DEL DOCUMENTO / GUÍA DE INSTALACIÓN Y DESPLIEGUE EN SERVIDORES LINUX:**  
  *Responsabilidad Principal según Audio Uzdi 4:* Redactar la guía técnica de instalación en servidores de producción basados en Linux (Ubuntu Server / Debian):
  * Requisitos previos del sistema (versiones de Linux, memoria RAM, puertos abiertos 80, 443, 3000, 5432).
  * Opción 1 (Despliegue con Docker y Docker Compose en Linux): instalación de Docker Engine, variables de entorno, arranque de contenedores.
  * Opción 2 (Despliegue Nativo en Linux): instalación de Node.js 20+, PostgreSQL 15, configuración de PM2 como gestor de procesos y Nginx como proxy inverso.
  * Comandos de verificación, diagnóstico de logs y respaldo de base de datos.
* **Tarea 5.2: CRUD Completo del Recuadro ER CAI (`prfl`, `accn`, `prms`, `sesn`):**  
  Asegurar los controladores y servicios para gestionar perfiles institucionales (`prfl`), catálogo de acciones del sistema (`accn`) y la asignación relacional de permisos en `seguridad.prms`.
* **Tarea 5.3: Guard de Autorización Dinámica RBAC contra Base de Datos:**  
  Ajustar el `RolesGuard` para consultar la tabla `seguridad.prms` y corroborar en tiempo real si el perfil asignado al usuario logueado tiene habilitada la acción requerida por el endpoint.
* **Tarea 5.4: Gestión de Usuarios (`prsn`) y Precedencia Institucional (RF-12):**  
  Asegurar en `UsersService` que no se permita el registro de una persona sin haber asignado previamente un perfil válido y activo en el sistema.

---

## 📅 5. CRONOGRAMA DE ENTREGABLES (4 SEMANAS HACIA LA SUSTENTACIÓN)

| Semana | Hito Principal | Entregables Clave | Criterio de Aceptación del Ingeniero |
|:---:|:---|:---|:---|
| **Semana 1 (Este Viernes)** | **Seguridad JWT, CORS LAN y Estructura de Documentos** | JWT Guard + CORS Multi-IP + Estructura del Catálogo de Servicios, Manual de Usuario y Borrador del DER | Login emite token real; peticiones sin token devuelven 401; Frontend se conecta por IP local; estructura documental aprobada por cátedra. |
| **Semana 2** | **Expedientes CONA, Búsquedas y Red Familiar** | Búsquedas por texto/ID + Medidas con orden secuencial + CRUD Familiar y Asistencia | Medidas múltiples por causa funcionando; relación tutor-adolescente; catálogo técnico con ejemplos de Request/Response. |
| **Semana 3** | **Motor de Reportes SNAI y Despliegue en Linux** | Generación de reportes UZDI (Excel y PDF) + Guía de Despliegue en Linux + DER Finalizado | Descarga funcional de archivos `.xlsx` y `.pdf`; servidor probado en entorno Linux/Docker; diagrama ER en alta resolución. |
| **Semana 4** | **Swagger Final, Auditoría y Simulacro SNAI** | API 100% documentada en `/api/docs` + Manual de Usuario Completo + Pruebas E2E | Demostración integral sin errores ante delegados del SNAI y docentes de cátedra. |

---

*Documento de Fase 2 oficializado para el equipo de desarrollo de Backend — Proyecto SNAI / UZDI — PUCE 2026.*
