# 🚀 PLAN DE TRABAJO — FASE 2: NUEVAS DIRECTRICES TÉCNICAS, DOCUMENTACIÓN CRUD, MANUALES Y DISTRIBUCIÓN FINAL

**Proyecto:** Sistema de Gestión Integral UZDI (SNAI – PUCE)  
**Versión de Base de Datos:** DDL Versión 8 Oficial (`Back Ecologia (1).sql`)  
**Stack Tecnológico:** NestJS 11 + TypeScript + TypeORM + PostgreSQL 15 + Swagger (OpenAPI 3.0) + Docker  
**Integrantes:**  
* **Paúl Rosero** (Líder Técnico, Arquitectura Core e Infraestructura)  
* **Joan Santacruz** (Dominio Judicial, Medidas Socioeducativas y Reglas Legales)  
* **Gabriel Aguinaga** (Dominio de Seguridad ER CAI, RBAC y Despliegue en Linux)  
* **Alejandro Flores** (Dominio Sociodemográfico y Catálogo de Servicios API para Frontend)  
* **Joselyn Cadena** (Red Familiar, Talleres, Gestión Documental y Manual de Usuario)  
**Fecha de Emisión:** Noviembre 2026 — *Fase de Cierre (4 semanas para entrega y sustentación ante SNAI)*  

---

## 📌 1. ANTECEDENTES Y ESTADO DEL PROYECTO

La **Fase 1** del proyecto (contenerización inicial, DDL v8, transformadores de estado lógico, filtros de excepción, interceptor de respuestas y los CRUDs fundamentales de las tareas 1.1 a 5.3) se encuentra **100% completada y fusionada en la rama principal (`main`)**.

Este nuevo documento establece las **directrices técnicas avanzadas, los nuevos requerimientos solicitados por el docente en cátedra** (con base en el análisis de las grabaciones *Uzdi 2.m4a*, *Uzdi 2.1.m4a*, *Uzdi 3.m4a*, *Uzdi 4.m4a* y el recuadro de seguridad del diagrama *ER CAI*), así como la **distribución definitiva de responsabilidades** tanto en código como en la documentación técnica formal requerida para este viernes y la sustentación final.

---

## 🎯 2. ANÁLISIS INTEGRAL DE LAS NUEVAS INDICACIONES DEL DOCENTE

A partir de las explicaciones dadas en cátedra, se sintetizan los requerimientos clave que deben quedar totalmente cubiertos:

### 2.1. Arquitectura REST y Convenciones Semánticas
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
* **Directriz del Ingeniero:** *"Debemos recibir un token desde el backend y es quien permite realizar la siguiente petición. Hay que manejar JWT: el backend manda; si el token está malo o vencido, no se procede."*
* **Flujo Implementado:**
  1. `POST /api/v1/auth/login` valida credenciales con `bcrypt` y genera un token JWT criptográficamente firmado con tiempo de expiración (8 horas).
  2. Todas las rutas protegidas son interceptadas por un `JwtAuthGuard` global que valida el header `Authorization: Bearer <token>`.
  3. Si el token no existe, está alterado o expiró, la API corta el flujo inmediatamente y retorna `401 Unauthorized`.
  4. Únicamente las rutas marcadas explícitamente con `@Public()` (ej. login y verificación de salud) quedan exentas.

### 2.3. Control de Acceso por Perfiles — Recuadro ER CAI (`prsn`, `prfl`, `accn`, `prms`, `sesn`)
* **Directriz del Ingeniero:** En el recuadro inferior del modelo ER CAI, la seguridad no es un simple enum de texto, sino una matriz relacional:
  * `seguridad.prsn`: Persona/Usuario registrado.
  * `seguridad.prfl`: Catálogo de perfiles institucionales (`ADM`, `CORD`, `LEGAL`, `TSOC`, `PSIC`, `EDUC`, `CONS`).
  * `seguridad.accn`: Catálogo de módulos y acciones del sistema.
  * `seguridad.prms`: Permisos otorgados (relaciona perfil con acción).
  * `seguridad.sesn`: Registro de apertura (`sesnfcin`) y cierre (`sesnfcfn`) de sesiones.
* El backend debe verificar que el perfil activo del usuario tenga asignada en `seguridad.prms` la acción correspondiente a la operación solicitada.

### 2.4. Conectividad Frontend-Backend, Red Local y Políticas de CORS
* **Directriz del Ingeniero:** *"Hay que tener subido el backend (en puerto local o Docker) y darle acceso al frontend, haciendo que la IP del frontend ingrese con peticiones al backend, evitando el conflicto de cross-origin."*
* El backend debe escuchar en `0.0.0.0:3000` y manejar CORS dinámico para aceptar peticiones desde `localhost:5173`, `localhost:5174`, `127.0.0.1` y cualquier IP de red local (`192.168.x.x` o `10.x.x.x`), permitiendo que el desarrollador de Frontend consuma la API desde su propia laptop sin bloqueos del navegador.

### 2.5. Auditoría Transaccional en Base de Datos
* Se mantiene la auditoría nativa mediante triggers en PostgreSQL sobre la tabla `seguridad.historial`.
* La API propaga el usuario conectado mediante la instrucción transaccional `SET LOCAL app.usuario_id = ...` en el middleware `AuditContextMiddleware`.

### 2.6. Reportes Oficiales SNAI (Grabación Uzdi 3)
* **Directriz del Ingeniero:** No esperar a que los delegados del SNAI o la UZDI Ambato nos envíen formatos, pues suelen demorar. El equipo debe proponer y dejar listos los reportes institucionales estándar:
  1. **Consolidado de Adolescentes por Sede UZDI:** Listado con filtros de provincia, cantón, UZDI, datos del adolescente y medidas activas.
  2. **Ficha de Expedientes y Medidas Judiciales:** Resumen del estado procesal.
  3. **Exportación Dual:** Capacidad de descargar la información tanto en formato **Microsoft Excel (.xlsx)** como en **PDF (.pdf)** institucional.

### 2.7. Documentación Requerida por el Docente (Grabación Uzdi 4)
* **Documento 1: Catálogo y Especificación Técnica de Servicios (API REST para Frontend):**  
  El ingeniero recalcó que el Frontend no va a leer código TypeScript ni solo Swagger como usuario final. Se requiere un documento formal que detalle para cada endpoint:
  * URL/Dirección completa (ej. `GET /api/v1/adolescente`).
  * Método HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  * Búsquedas soportadas: Búsqueda por ID y búsqueda por texto (nombre, apellido, cédula, etc.).
  * Estructura de entrada: Parámetros URL o JSON en el Request Body.
  * Estructura de respuesta exitosa (código 200/201 con el JSON exacto esperado).
  * Estructura de respuesta en error (código 400/404/500 con el mensaje descriptivo y la causa real de la falla, no mensajes genéricos como "ocurrió un error").
* **Documento 2: Guía y Manual de Usuario Final:**  
  Manual descriptivo para el personal institucional (Coordinador, Juez, Técnico, Psicólogo, Trabajador Social, Educador) con el flujo funcional paso a paso.
* **Documento 3: Guía de Instalación y Despliegue en Servidores Linux:**  
  El docente indicó que el servidor final de producción corre en Linux (Ubuntu/Debian). Se requiere una guía paso a paso de despliegue (Docker o nativo con Node.js, PM2, PostgreSQL y Nginx).

---

## 👥 3. MATRIZ DEFINITIVA DE ASIGNACIÓN DE TAREAS — FASE 2 (5 INTEGRANTES)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE ASIGNACIÓN DE ROLES Y RESPONSABILIDADES — FASE 2                      │
├────────────────────┬───────┬───────────────────────────────────────────────────────────────────────────┤
│ Desarrollador      │ N° T. │ Área de Responsabilidad y Entregables Asignados                           │
├────────────────────┼───────┼───────────────────────────────────────────────────────────────────────────┤
│ Paúl Rosero        │   6   │ Arquitectura Core, JWT Guard, Multi-CORS IP, Swagger OpenAPI y Motor Rep. │
│ Alejandro Flores   │   4   │ Catálogo Técnico de Servicios API (Frontend), Búsquedas y Catálogos       │
│ Joselyn Cadena     │   4   │ Manual de Usuario del Sistema UZDI, Red Familiar y Vistas de Reportes     │
│ Gabriel Aguinaga   │   4   │ Seguridad ER CAI, Matriz RBAC en BD y Guía de Despliegue en Linux         │
│ Joan Santacruz     │   4   │ Dominio Judicial: Expedientes, MedidaExpediente CONA y Reglas Legales     │
└────────────────────┴───────┴───────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 1. Paúl Rosero — Líder Técnico, Arquitectura Core y Seguridad Base

* **Tarea 1.1: Módulo Criptográfico JWT de Producción (`@nestjs/jwt` + `JwtAuthGuard`):**  
  Implementar la firma criptográfica de tokens con tiempo de expiración (8h), payload institucional (`sub`, `username`, `email`, `prfl_id`, `rol`, `sesion_id`) y configurar el Guard global de intercepción para rechazar automáticamente cualquier petición sin token válido con HTTP 401.
* **Tarea 1.2: Configuración Dinámica de CORS Multi-Origen y Exposición LAN:**  
  Configurar en `main.ts` la resolución dinámica de orígenes permitidos (localhost, IPs locales `192.168.x.x`, `10.x.x.x` y Docker network) y poner al servidor a escuchar en `0.0.0.0:3000` para que el desarrollador de Frontend se conecte desde su propia máquina sin bloqueos de navegador.
* **Tarea 1.3: Documentación OpenAPI / Swagger 3.0 Interactiva Global:**  
  Configurar la especificación interactiva en `/api/docs` con esquemas de DTOs, ejemplos de JSON en peticiones/respuestas, códigos de retorno y botón de autorización interactiva (*Authorize Bearer JWT*).
* **Tarea 1.4: Motor Base del Módulo de Reportes Institucionales SNAI:**  
  Crear el `ReportesModule` con la lógica genérica de generación de archivos en memoria (generación tabular con formato Excel mediante `exceljs` y fichas ejecutivas con `pdfkit` / HTML-to-PDF).
* **Tarea 1.5: Verificación de Trazabilidad y Middleware de Auditoría Transaccional:**  
  Garantizar que `AuditContextMiddleware` propague de forma transparente `SET LOCAL app.usuario_id` hacia las conexiones activas de PostgreSQL para alimentar los triggers de `seguridad.historial`.
* **Tarea 1.6: Contenerización Docker Multi-Plataforma y Scripts de Inicio:**  
  Afinar `docker-compose.yml`, documentar el mapeo de puertos (`3000:3000` y `5432:5432`) y coordinar con el equipo de Frontend las pruebas de consumo en vivo.

---

### 🔹 2. Alejandro Flores — Catálogo Técnico de Servicios API (Frontend) y Núcleo Sociodemográfico

* **Tarea 2.1: ELABORACIÓN DEL DOCUMENTO DE ESPECIFICACIÓN TÉCNICA DE SERVICIOS CRUD (CATÁLOGO PARA FRONTEND):**  
  *Responsabilidad Principal según Audio Uzdi 4:* Redactar el documento formal de la API para el equipo de Frontend. Debe incluir para cada una de las tablas del sistema:
  * URL/Dirección completa (ej. `GET /api/v1/adolescente`).
  * Método HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  * Estructura de parámetros de búsqueda: búsqueda por ID y búsqueda por texto (cédula, nombres, apellidos).
  * Estructura del JSON que el frontend debe enviar (Request Body con tipos y restricciones).
  * Estructura del JSON que el backend devuelve en caso de éxito (código 200/201 con `{ ok: true, data: { ... } }`).
  * Estructura del JSON en caso de error (código 400/404/500 con mensaje explicativo del motivo del fallo, evitando mensajes genéricos).
* **Tarea 2.2: Endpoints de Búsqueda Avanzada de Adolescentes (ID y Texto):**  
  Asegurar en `AdolescenteController` el soporte para búsqueda por identificador (`/adolescente/:id`) y búsqueda por texto/coincidencia (`/adolescente/search?q=...`) por nombre, apellido o cédula.
* **Tarea 2.3: Catálogos Paramétricos del Adolescente con Ejemplos Documentados:**  
  Completar los DTOs y respuestas de `nacionalidad`, `estado_civil`, `etnia` y `gdo`, asegurando que cuenten con datos de prueba realistas para el frontend.
* **Tarea 2.4: Estructura Geográfica Institucional en Cascada:**  
  Verificar los endpoints de `provincia`, `canton` y `uzdi` garantizando que el Frontend pueda cargar los selectores en cascada (cantones por provincia y UZDIs por cantón).

---

### 🔹 3. Joselyn Cadena (Lizz) — Manual de Usuario Final, Red Familiar y Vistas de Reporte

* **Tarea 3.1: ELABORACIÓN DEL DOCUMENTO DE GUÍA Y MANUAL DE USUARIO DEL SISTEMA UZDI:**  
  *Responsabilidad Principal según Audios Uzdi 2.1 y Uzdi 4:* Redactar el manual de usuario institucional dirigido al personal administrativo y técnico del SNAI/UZDI. Debe contemplar:
  * Introducción y propósitos del sistema de gestión de medidas socioeducativas.
  * Guía de acceso al sistema (inicio de sesión, cambio de contraseña, roles).
  * Manual de operación por perfiles (Coordinador, Profesional Legal, Psicólogo, Trabajador Social, Educador).
  * Flujo operativo paso a paso: ingreso de adolescentes, consulta de expediente, registro de familiares/tutores, asignación a talleres y registro de asistencia.
  * Formato estructurado con capturas de pantalla, pasos numerados y advertencias institucionales.
* **Tarea 3.2: Módulo de Contexto Familiar y Tutoría Legal:**  
  Asegurar los endpoints CRUD de `representante`, `tipo_parentesco` y la relación `adolescente_representante`, garantizando que la ficha familiar esté vinculada al adolescente.
* **Tarea 3.3: Módulo de Talleres y Regla de Negocio de Asistencia:**  
  Implementar en `taller` y `asistencia_taller` la validación requerida en cátedra: registrar si la asistencia al taller corresponde al adolescente infractor o al representante legal.
* **Tarea 3.4: Implementación de Endpoints y Vistas de Reportes SNAI:**  
  Consumir el motor base de reportes para exponer las consultas operativas del SNAI: Listado de adolescentes por sede UZDI y endpoints para descarga de archivos en formato Excel y PDF.

---

### 🔹 4. Gabriel Aguinaga — Seguridad ER CAI, Matriz RBAC en BD y Despliegue en Linux

* **Tarea 4.1: ELABORACIÓN DEL DOCUMENTO / GUÍA DE INSTALACIÓN Y DESPLIEGUE EN SERVIDORES LINUX:**  
  *Responsabilidad Principal según Audio Uzdi 4:* Redactar la guía técnica de instalación en servidores de producción basados en Linux (Ubuntu Server / Debian). Debe incluir:
  * Requisitos previos del sistema (versiones de Linux, memoria RAM, puertos abiertos 80, 443, 3000, 5432).
  * Opción 1 (Despliegue con Docker y Docker Compose en Linux): instalación de Docker Engine, variables de entorno, arranque de contenedores.
  * Opción 2 (Despliegue Nativo en Linux): instalación de Node.js 20+, PostgreSQL 15, configuración de PM2 como gestor de procesos y Nginx como proxy inverso.
  * Comandos de verificación, diagnóstico de logs y respaldo de base de datos.
* **Tarea 4.2: CRUD Completo del Recuadro ER CAI (`prfl`, `accn`, `prms`, `sesn`):**  
  Asegurar los controladores y servicios para gestionar perfiles institucionales (`prfl`), catálogo de acciones del sistema (`accn`) y la asignación relacional de permisos en `seguridad.prms`.
* **Tarea 4.3: Guard de Autorización Dinámica RBAC contra Base de Datos:**  
  Ajustar el `RolesGuard` para consultar la tabla `seguridad.prms` y corroborar en tiempo real si el perfil asignado al usuario logueado tiene habilitada la acción requerida por el endpoint.
* **Tarea 4.4: Gestión de Usuarios (`prsn`) y Precedencia Institucional (RF-12):**  
  Asegurar en `UsersService` que no se permita el registro de una persona sin haber asignado previamente un perfil válido y activo en el sistema.

---

### 🔹 5. Joan Santacruz — Dominio Judicial, Medidas y Ejecución Procesal

* **Tarea 5.1: CRUD Completo y DTOs del Módulo `Expedientes`:**  
  Asegurar los métodos `GET`, `POST`, `PUT`, `DELETE` (lógico) en `ExpedienteController`, implementando el campo institucional `numero_causa` con validación de unicidad y relación con el adolescente.
* **Tarea 5.2: Control Secuencial de Medidas Socioeducativas (`MedidaExpediente` según CONA):**  
  Asegurar que cada expediente pueda contener múltiples medidas socioeducativas ordenadas cronológica o simultáneamente (campo obligatorio `orden` según el Código de la Niñez y Adolescencia).
* **Tarea 5.3: Catálogo Paramétrico de Infracciones y Tipos de Medidas:**  
  Completar endpoints y DTOs para `infraccion` y `medida_socioeducativa` asegurando la persistencia de estados lógicos (`CHAR(1)` 'V'/'F') y filtros de búsqueda.
* **Tarea 5.4: Matriz de Control de Acceso Judicial y Reglas Legales:**  
  Asociar los decoradores de seguridad y validar que únicamente perfiles con competencia jurídica (`LEGAL`, `JUEZ`, `ADM`) puedan modificar resoluciones judiciales o añadir medidas a los expedientes.

---

## 📅 4. CRONOGRAMA DE ENTREGABLES (4 SEMANAS HACIA LA SUSTENTACIÓN)

| Semana | Hito Principal | Entregables Clave | Criterio de Aceptación del Ingeniero |
|:---:|:---|:---|:---|
| **Semana 1** | **Seguridad JWT, CORS LAN y Documentos Base** | JWT Guard + CORS Multi-IP + Estructura del Catálogo de Servicios y Manual de Usuario | Login emite token real; peticiones sin token devuelven 401; Frontend se conecta por IP local; estructura de documentos presentada. |
| **Semana 2** | **Expedientes CONA, Búsquedas y Red Familiar** | Búsquedas por texto/ID + Medidas con orden secuencial + CRUD Familiar y Asistencia | Medidas múltiples por causa funcionando; relación tutor-adolescente; catálogo técnico con ejemplos de Request/Response. |
| **Semana 3** | **Motor de Reportes SNAI y Despliegue en Linux** | Generación de reportes UZDI (Excel y PDF) + Guía de Despliegue en Linux | Descarga funcional de archivos `.xlsx` y `.pdf`; servidor probado en entorno Linux/Docker. |
| **Semana 4** | **Swagger Final, Auditoría y Simulacro SNAI** | API 100% documentada en `/api/docs` + Manual de Usuario Completo + Pruebas E2E | Demostración integral sin errores ante delegados del SNAI y docentes de cátedra. |

---

*Documento de Fase 2 oficializado para el equipo de desarrollo de Backend — Proyecto SNAI / UZDI — PUCE 2026.*
