# 🚀 PLAN DE TRABAJO, DISTRIBUCIÓN DE ROLES Y GUÍA DE INTEGRACIÓN — BACKEND UZDI

**Proyecto:** Sistema de Gestión Integral UZDI (SNAI – PUCE)  
**Versión de Base de Datos:** DDL Versión 8 (`Back Ecologia (1).sql`)  
**Stack Tecnológico:** NestJS 11 + TypeScript + TypeORM + PostgreSQL 14+  
**Integrantes:** Paúl Rosero, Joan Santacruz, Gabriel Aguinaga, Alejandro Flores, Joselyn Cadena  
**Fecha de Emisión:** Noviembre 2026  

---

## 📌 1. OBJETIVO DEL DOCUMENTO

Este documento establece las directrices técnicas obligatorias, el flujo de versionamiento con Git, los estándares de codificación y la asignación formal de responsabilidades para completar y refactorizar el Backend del proyecto UZDI. El objetivo principal es garantizar que el trabajo se desarrolle de forma colaborativa, continua y ordenada en la nube, evitando el aislamiento en máquinas locales y preparando la API para una integración fluida e inmediata con el Frontend (`UZDI_FRONT`).

---

## 🛠️ 2. PASOS PREVIOS E INFRAESTRUCTURA DE DESARROLLO (ANTES DE EMPEZAR)

Para evitar incompatibilidades o bloqueos entre compañeros, **todos los integrantes deben realizar los siguientes pasos en este orden exacto**:

### 2.1. Creación y Configuración del Repositorio Central (GitHub / GitLab)
1. **Inicialización y Enlace:** Repositorio oficial creado y configurado:
   `https://github.com/alex171215/uzdi-backend-p8.git`
2. **Subida de Base Limpia y Docker:** Subir la base del proyecto `UZDI_BACK` junto con `docker-compose.yml` y el script de base de datos oficial `Back Ecologia (1).sql`.
3. **Protección de Rama Principal (`main` o `develop`):**
   * Ningún integrante debe hacer `git push origin main` directamente.
   * Todos los cambios deben ingresar exclusivamente mediante **Pull Requests (PR)** revisados.

### 2.2. Configuración de Base de Datos Local con Docker (Opción Rápida Recomendada)
Para evitar instalaciones manuales y asegurar que todos tengan exactamente la misma versión de PostgreSQL sin alterar la máquina de nadie:

1. **Levantar el contenedor con Docker Compose:**
   En la raíz del proyecto backend (`UZDI_BACK/UZDI_BACK`), ejecutar:
   ```bash
   docker compose up -d
   ```
   *Nota:* El archivo `docker-compose.yml` ya está preconfigurado para levantar PostgreSQL 15 y montar de forma automática el script `Back Ecologia (1).sql` (`01_ddl_v8.sql`) en el arranque inicial.

2. **Verificar que el contenedor esté corriendo:**
   ```bash
   docker ps
   ```

3. *(Alternativa sin Docker)* Si algún compañero prefiere usar PostgreSQL instalado directamente en Windows/Linux:
   ```sql
   CREATE DATABASE uzdi_db;
   ```
   Y ejecutar el script DDL Versión 8:
   ```bash
   psql -U postgres -d uzdi_db -f "Back Ecologia (1).sql"
   ```

### 2.3. Variables de Entorno (`.env`)
Cada desarrollador debe crear un archivo `.env` en la raíz de su carpeta de backend (`UZDI_BACK/UZDI_BACK/`):
```env
# Conexión a Base de Datos Local (compatible con Docker Compose por defecto)
DATABASE_URL=postgresql://postgres:password@localhost:5432/uzdi_db

# Puerto del Servidor
PORT=3000
NODE_ENV=development

# Seguridad y CORS (Frontend Vite de desarrollo)
CORS_ORIGIN=http://localhost:5174
JWT_SECRET=super_secret_uzdi_jwt_key_2026
```

---

## 🌿 3. POLÍTICA DE RAMAS Y FLUJO DE TRABAJO CON GIT (GITFLOW SIMPLIFICADO)

Para que el avance sea visible y no se pierdan cambios en computadoras personales:

### 3.1. Convención de Nombres de Ramas
Cada integrante debe crear una rama a partir de `main` con la nomenclatura:
`feature/<modulo>-<nombre>`

Ejemplos:
* `feature/arquitectura-base-paul`
* `feature/expedientes-medidas-joan`
* `feature/seguridad-usuarios-gabriel`
* `feature/adolescentes-catalogos-alejo`
* `feature/talleres-familia-lizz`

### 3.2. Ciclo de Trabajo Diario (Commit y Push Frecuente)
1. **Antes de empezar a programar:** Actualizar tu copia local con lo último de la rama principal:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/tu-rama
   git merge main
   ```
2. **Commits descriptivos:**
   * ✅ `feat(expediente): agregar campo numero_causa y tabla asociativa medida_expediente`
   * ✅ `fix(dto): flexibilizar validacion de cedula para pasaporte`
   * ❌ `cambios`, `subiendo cosas`, `arтивное`
3. **Subir al repositorio al menos una vez al día:**
   ```bash
   git add .
   git commit -m "feat(modulo): descripción clara del avance"
   git push origin feature/tu-rama
   ```
4. **Pull Requests (PR):** Al finalizar tus tareas, abrir el PR en GitHub hacia `main`, adjuntando captura de que la compilación (`npm run build`) pasa sin errores y que las pruebas en Postman funcionan.

---

## 📐 4. ESTÁNDARES DE DESARROLLO Y COMPATIBILIDAD CON EL FRONTEND

Para que el Frontend en Vue 3 (`UZDI_FRONT`) se conecte sin contratiempos:

1. **Prefijo Global Obligatorio:** Todos los endpoints deben responder bajo `/api/v1/...` (ya configurado en `main.ts`).
2. **Formato Unificado de Respuestas JSON (Indicación del Ingeniero):**
   Toda respuesta exitosa debe incluir el flag de ejecución y la estructura estándar:
   ```json
   {
     "ok": true,
     "message": "Operación realizada correctamente",
     "data": { ... }
   }
   ```
3. **Manejo Estricto de Estados (`estado` CHAR(1)):**
   * En base de datos el campo es `CHAR(1)` ('V' / 'F') por directriz del ingeniero.
   * En TypeORM usar el transformador `BooleanVF` para que el JSON reciba y envíe `true` / `false`.
   * **Borrado Lógico Obligatorio:** En los métodos `remove()`, no ejecutar `DELETE` SQL físico; en su lugar, hacer un update de `estado = 'F'`.
4. **Validación Declarativa con DTOs:**
   * Usar decoradores de `class-validator` (`@IsNotEmpty()`, `@IsString()`, `@IsOptional()`).
   * No dejar campos sin tipado estricto.

---

## 👥 5. MATRIZ FORMAL DE DISTRIBUCIÓN DE RESPONSABILIDADES

La división de módulos se estructuró separando tablas independientes y dependientes según la recomendación de cátedra:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     MATRIZ DE ASIGNACIÓN DE TAREAS Y MÓDULOS DE DOMINIO                          │
├────────────────────┬───────┬─────────────────────────────────────────────────────────────────────┤
│ Integrante         │ N° T. │ Módulos y Responsabilidades Asignadas                               │
├────────────────────┼───────┼─────────────────────────────────────────────────────────────────────┤
│ Paúl Rosero        │   6   │ Repositorio, Docker, Arquitectura Core, Interceptores, Filtros      │
│ Joan Santacruz     │   3   │ Módulo Expedientes Judiciales, Medidas y Nueva Tabla Asociativa     │
│ Gabriel Aguinaga   │   3   │ Módulo Seguridad, Matriz de Permisos RBAC y Cuentas de Usuario      │
│ Alejandro Flores   │   3   │ Módulo Central de Adolescentes y Catálogos Paramétricos             │
│ Joselyn Cadena     │   3   │ Módulos de Soporte: Contexto Familiar, Talleres y Documental        │
└────────────────────┴───────┴─────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 1. Infraestructura Inicial, Arquitectura Transversal y Seguridad Base

* **Tarea 1.1:** *Inicialización del Repositorio Central y Contenerización:*  
  Creación, configuración y protección del repositorio GitHub (`https://github.com/alex171215/uzdi-backend-p8.git`), inicialización de branches base y creación del entorno Dockerizado con `docker-compose.yml` para el aprovisionamiento automático de PostgreSQL.
* **Tarea 1.2:** *Sincronización y Configuración del DDL v8 en TypeORM:*  
  Validación de variables de entorno y mapeo de conexión en `app.module.ts` hacia PostgreSQL con el esquema físico multiesquema y verificación de tipos nativos.
* **Tarea 1.3:** *Implementación del ResponseTransformInterceptor Global:*  
  Creación del interceptor de serialización para homologar todas las respuestas HTTP de la API bajo el formato institucional requerido por el docente (`ok: true`, `message`, `data`).
* **Tarea 1.4:** *Configuración del CustomHttpExceptionFilter:*  
  Estandarización del manejador global de excepciones para captura de errores relacionales de base de datos y validaciones de DTOs en formato unificado.
* **Tarea 1.5:** *Estandarización del ValueTransformer `BooleanVF` para Soft-Delete:*  
  Adaptación y registro del transformador bidireccional (`CHAR(1)` 'V'/'F' ↔ `boolean`) en el decorador base para dar soporte al nuevo campo `estado` en todas las entidades.
* **Tarea 1.6:** *Middleware de Auditoría y Trazabilidad Transaccional:*  
  Configuración del `AuditContextMiddleware` para la propagación de `SET LOCAL app.usuario_id` en las sesiones de base de datos hacia los triggers de `seguridad.historial`.

---

### 🔹 2. Dominio de Expedientes, Medidas y Ejecución Procesal

* **Tarea 2.1:** *Refactorización de ExpedientesModule:*  
  Eliminar la llave foránea directa `mdso_id` de la entidad `expediente`, incorporar el campo `numero_causa` y ajustar el DTO de creación/actualización con sus validaciones.
* **Tarea 2.2:** *Implementación de la Nueva Entidad y CRUD `MedidaExpediente`:*  
  Crear el módulo completo (`Controller`, `Service`, `Entity`, `DTOs`) para la tabla `adolescente.medida_expediente` con el atributo obligatorio `orden` (para medidas sucesivas/simultáneas según el CONA).
* **Tarea 2.3:** *Módulo de Infracciones y Catálogo de Medidas:*  
  Actualizar `InfraccionModule` y `MedidaSocioeducativaModule` con el campo `estado`, garantizando endpoints de consulta y asociación al expediente.

---

### 🔹 3. Seguridad, Control de Acceso (RBAC) y Usuarios

* **Tarea 3.1:** *Entidades y Mapeo del Esquema `seguridad`:*  
  Actualizar las entidades `prsn`, `tipo_persona`, `prfl`, `accn`, `prms` y `sesn` al DDL v8, integrando el campo `estado` y el alias de dominio `UsuarioEntity`.
* **Tarea 3.2:** *Gestión de Usuarios y Roles:*  
  Actualizar `UsersService` para la asignación de perfiles institucionales obligatorios previo al alta de usuarios (precedencia RF-12 antes de RF-01).
* **Tarea 3.3:** *Auditoría de Sesiones en Login:*  
  Modificar `AuthService` para que al emitir el token registre la sesión activa en la tabla `seguridad.sesn` (`sesnfcin`) y su posterior cierre (`sesnfcfn`).

---

### 🔹 4. Núcleo Sociodemográfico y Catálogos Geográficos

* **Tarea 4.1:** *Actualización de la Entidad y Validaciones de Adolescente:*  
  Ajustar `AdolescenteEntity` con el campo `estado` y actualizar `CreateAdolescenteDto` con expresión regular alfanumérica para admitir cédulas de 10 dígitos o pasaportes en el campo `cedula`.
* **Tarea 4.2:** *Catálogos Paramétricos del Adolescente:*  
  Actualizar entidades y servicios CRUD de tablas independientes: `nacionalidad`, `estado_civil`, `etnia` y `gdo`, incorporando borrado lógico por `estado`.
* **Tarea 4.3:** *Estructura Geográfica Institucional:*  
  Actualizar el módulo `estructura-institucional` (`provincia`, `canton` y `uzdi`) adaptando las relaciones jerárquicas y los filtros requeridos por el frontend.

---

### 🔹 5. Red Familiar, Talleres y Archivo Documental

* **Tarea 5.1:** *Módulo de Contexto Familiar:*  
  Actualizar entidades y controladores de `representante`, `tipo_parentesco` y la tabla asociativa `adolescente_representante`, implementando el borrado lógico por `estado`.
* **Tarea 5.2:** *Módulo de Talleres y Asistencia:*  
  Adaptar `talleres_actividades.taller` y `asistencia_taller` validando la restricción de asistente (`adolescente` vs `adolescente_representante`).
* **Tarea 5.3:** *Módulo de Gestión Documental:*  
  Actualizar `tipo_documento` y `documento_expediente` para vincular evidencias y documentos habilitantes a los expedientes judiciales bajo el nuevo esquema.

---

## 🧪 6. PROTOCOLO DE VALIDACIÓN ANTES DE MERGEAR A `main`

Cada desarrollador debe verificar localmente antes de solicitar revisión de su PR:
1. **Compilación limpia de TypeScript:**
   ```bash
   npm run build
   ```
   *(No debe haber errores de tipos ni imports rotos)*.
2. **Verificación de Linter y Formato:**
   ```bash
   npm run lint
   npm run format
   ```
3. **Prueba funcional en Postman o cliente HTTP:**
   * Probar al menos un `POST` y verificar que guarde con `estado = 'V'`.
   * Probar un `GET` y verificar que la respuesta contenga `{ ok: true, data: [...] }`.
   * Probar un `DELETE` y verificar que no borre físicamente, sino que cambie `estado = 'F'`.

---

*Documento aprobado y oficializado para el equipo de desarrollo de Backend UZDI.*
