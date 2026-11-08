# Catálogo técnico de servicios API para frontend

**Sistema UZDI · API v2 · 8 de noviembre de 2026**

Base de desarrollo: `http://localhost:3000/api/v1` · Swagger: `http://localhost:3000/api/docs`.

Este catálogo describe las rutas implementadas en NestJS. Las tablas se identifican por su esquema de PostgreSQL; los nombres JSON siguen las entidades y DTO, que en algunos casos difieren de las columnas. Los ejemplos son ficticios para integración, no datos precargados. Sustituir los ID por los del entorno.

## Contrato común

- Enviar `Authorization: Bearer <JWT>` en rutas protegidas, `Content-Type: application/json` para cuerpos JSON y `Accept: application/json`. `POST /auth/login` es público. Los permisos dependen del perfil y la acción.
- `:id` y las claves foráneas son enteros positivos. En JSON se envían como números. Las fechas son cadenas ISO (`YYYY-MM-DD`). Los DTO rechazan propiedades desconocidas; los textos pasan por sanitización.
- En los CRUD **estándar**, las rutas completas son `GET /api/v1/<ruta>` (lista, 200), `GET /api/v1/<ruta>/:id` (detalle, 200), `POST /api/v1/<ruta>` (alta, 201), `PATCH /api/v1/<ruta>/:id` (modificación parcial, 200) y `DELETE /api/v1/<ruta>/:id` (borrado lógico o revocación, 200). `PATCH` acepta los campos del alta como opcionales; `DELETE` no lleva cuerpo. El único `PUT` expuesto es el reemplazo de perfiles de usuario.
- La búsqueda textual `search?q=` existe en `/adolescente` y `/users`. Para el resto, usar los filtros expresos o filtrar una lista en frontend. No construir rutas `/search` inexistentes.
- Las tablas con estado lógico de un carácter en BD (`V`/`F`) devuelven la propiedad `estado` como booleano por el transformador de TypeORM. No enviarla en cuerpos. Los catálogos sociodemográficos, geografía y adolescentes solo permiten modificar filas activas.

### Respuestas y errores

El interceptor envuelve los éxitos. `data` es objeto en altas/detalles, arreglo en listas/búsquedas y, en varios `PATCH`/`DELETE`, el resultado de TypeORM (`{ "generatedMaps": [], "raw": [], "affected": 1 }`). En el objeto, `id` es el identificador generado; se devuelven los campos de la entidad indicados en las tablas siguientes, los valores predeterminados y, según el recurso, relaciones y metadatos de auditoría. Los campos opcionales sin valor pueden llegar como `null`. Algunos servicios devuelven un `message` específico.

```json
{
  "ok": true,
  "message": "Operación realizada correctamente",
  "data": { "id": 7, "nombre": "Ecuatoriana", "estado": true },
  "timestamp": "2026-11-08T14:30:00.000Z"
}
```

`GET` de lista sin resultados devuelve `data: []`. Varios `GET /:id` de catálogos devuelven `data: null` con 200 si no hay registro; los servicios que lanzan `NotFoundException`, incluido `/adolescente/:id`, responden 404. El frontend debe contemplar ambos.

```json
{
  "ok": false,
  "statusCode": 400,
  "message": "Error de validación en la solicitud",
  "errors": [
    "cedula debe ser una cédula de 10 dígitos o un pasaporte alfanumérico de 6 a 20 caracteres"
  ],
  "path": "/api/v1/adolescente",
  "timestamp": "2026-11-08T14:30:00.000Z"
}
```

```json
{
  "ok": false,
  "statusCode": 404,
  "message": "Adolescente activo no encontrado",
  "errors": null,
  "path": "/api/v1/adolescente/999",
  "timestamp": "2026-11-08T14:30:00.000Z"
}
```

El 500 conserva en `message` el detalle de la excepción no controlada (por ejemplo, `duplicate key value violates unique constraint "UQ_..."` al repetir una cédula), y `errors` suele ser `null`; el nombre exacto de la restricción depende de la base instalada. No se sustituye por un mensaje genérico. El 401 indica token ausente/inválido y el 403 falta de permiso. `path` es la URL real solicitada.

```json
{
  "ok": false,
  "statusCode": 500,
  "message": "duplicate key value violates unique constraint \"UQ_...\"",
  "errors": null,
  "path": "/api/v1/adolescente",
  "timestamp": "2026-11-08T14:30:00.000Z"
}
```

## Seguridad (`seguridad`)

| Tabla                     | Rutas completas y método                                                                                                                                                                                          | Cuerpo de alta / modificación y restricciones                                                                                                                                                                                                                                                                          | Lectura / respuesta                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `prsn` (usuarios)         | `GET/POST /api/v1/users`; `GET/PATCH/DELETE /api/v1/users/:id`; `GET /api/v1/users/search?q=perez`; `GET /api/v1/persona`; `GET /api/v1/persona/:id`                                                              | `POST`: `nombres`, `apellidos`, `correo` (email), `login` (texto), `password` (mín. 8), `tppr_id` (entero positivo), `perfiles_ids` (arreglo no vacío de enteros positivos, máx. 20). Opcionales: `sexo` (`M/F/O`), `direccion`, `telefono`, `uzdi_id`, `observaciones`. `PATCH` acepta los campos de `UpdateUserDto`. | `/users/search` coincide con nombres, apellidos, login o correo. `/persona` es solo lectura. Objeto/array de usuario sin contraseña. |
| `tipo_persona`            | Sin controlador CRUD propio                                                                                                                                                                                       | Sin cuerpo de escritura público; se referencia con `tppr_id` en `/users`.                                                                                                                                                                                                                                              | Consultar a través de la relación de usuario o datos de referencia del entorno.                                                      |
| `prpf` (persona ↔ perfil) | `GET /api/v1/users/:id/perfiles`; `PUT /api/v1/users/:id/perfiles`                                                                                                                                                | `PUT`: `{ "perfiles_ids": [1, 2] }` reemplaza las asignaciones; IDs positivos.                                                                                                                                                                                                                                         | Lista de perfiles. No hay `/prpf` público.                                                                                           |
| `prfl` (perfil)           | CRUD estándar `/api/v1/perfil`; `GET /api/v1/perfil?incluirInactivos=true`; `GET /api/v1/perfil/:id/permisos`                                                                                                     | `POST`: `codigo` (2–5 mayúsculas), `nombre` (≤63); opcionales `descripcion` (≤63), `observaciones` (≤127), `padreId` (ID positivo).                                                                                                                                                                                    | Objeto/array de perfil; `/:id/permisos` lista permisos.                                                                              |
| `accn` (acción)           | CRUD estándar `/api/v1/accion`; `GET /api/v1/accion?q=users&incluirInactivos=true`                                                                                                                                | `POST`: `nombre` (dos segmentos minúsculos separados por punto, ≤63); opcionales `descripcion` (≤63), `auditable` (`0/1`), `moduloId`, `controladorId`, `tipoAccionId` (ID positivos).                                                                                                                                 | Objeto/array de acción; `q` filtra acciones.                                                                                         |
| `prms` (permiso)          | `GET/POST /api/v1/permiso`; `GET/DELETE /api/v1/permiso/:id`; `GET /api/v1/permiso?prfl_id=1&accn_id=2`; `POST /api/v1/permiso/perfil/:prflId/acciones`; `DELETE /api/v1/permiso/perfil/:prflId/acciones/:accnId` | Alta: `{ "prfl_id": 1, "accn_id": 2 }`; asignación múltiple: `{ "accn_ids": [2, 3] }`. ID positivos. No hay `PATCH`.                                                                                                                                                                                                   | Objeto/array de permisos; revocación por ID o par perfil/acción.                                                                     |
| `sesn`                    | `GET /api/v1/sesion`; `GET /api/v1/sesion/:id`; `PATCH /api/v1/sesion/:id/cerrar`                                                                                                                                 | `cerrar` sin cuerpo; el ciclo normal usa `/auth`.                                                                                                                                                                                                                                                                      | Objeto/array con persona, perfil y fechas.                                                                                           |
| `historial`               | `GET /api/v1/historial`; `GET /api/v1/historial/:id`                                                                                                                                                              | Solo lectura.                                                                                                                                                                                                                                                                                                          | Objeto/array con tabla, registro, usuario, fecha, acción, estados y descripción.                                                     |

`POST /api/v1/auth/login` recibe `{ "login": "mperez", "password": "ClaveSegura2026" }` y opcional `prfl_id`; devuelve token y sesión en `data`. `GET /api/v1/auth/me` consulta la sesión. `POST /api/v1/auth/logout` la cierra (cuerpo opcional `{ "sesionId": 4 }`). `POST /api/v1/auth/change-password` recibe `currentPassword` y `newPassword` (mín. 8; `userId` opcional).

## Núcleo sociodemográfico (`adolescente`)

### `adolescente.adolescente`

CRUD estándar `/api/v1/adolescente`. Además, `GET /api/v1/adolescente/search?q=Pérez` busca coincidencia parcial, sin distinguir mayúsculas, en `nombre`, `apellido` o `cedula`, solo activos. `q` es obligatorio, 1–100 caracteres; admite letras Unicode, números, espacio, punto, apóstrofo, barra y guion. `GET /api/v1/adolescente/7` consulta por ID positivo. ID ausente/inactivo produce el 404 mostrado. `q` vacío o con caracteres inválidos produce 400, sin convertir la búsqueda en listado general.

| Campo de `POST /api/v1/adolescente`        | Tipo y restricción                                                                 | Obligatorio |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | ----------- |
| `cedula`                                   | Cadena: 10 dígitos o pasaporte alfanumérico ASCII de 6–20, sin espacios ni guiones | Sí          |
| `nombre`, `apellido`                       | Cadena 1–100, letras Unicode y signos de nombre ` ./'-`                            | Sí          |
| `fecha_nac`, `fecha_ingr`                  | Fecha ISO                                                                          | Sí          |
| `sexo`                                     | `M`, `F` u `O`                                                                     | Sí          |
| `nacn_id`, `etcv_id`, `etna_id`, `cntn_id` | Enteros positivos; nacionalidad, estado civil, etnia y cantón                      | Sí          |
| `nved_nombre`                              | Texto de nombre ≤100                                                               | No          |
| `hijos`                                    | Entero ≥0                                                                          | No          |
| `reincide`, `hijoPpl`                      | Booleano JSON                                                                      | No          |
| `observaciones`                            | Texto ≤255                                                                         | No          |
| `gdo_id`                                   | Entero positivo                                                                    | No          |

`PATCH /api/v1/adolescente/:id` admite estos campos como opcionales. Ejemplo de alta:

```json
{
  "cedula": "AB1234567",
  "nombre": "María José",
  "apellido": "Pérez López",
  "fecha_nac": "2009-03-15",
  "sexo": "F",
  "fecha_ingr": "2026-02-10",
  "nacn_id": 1,
  "etcv_id": 2,
  "etna_id": 1,
  "cntn_id": 5,
  "hijos": 0,
  "reincide": false,
  "hijoPpl": false
}
```

En 201, `data` contiene el adolescente creado, `id` y `estado: true`. En `GET /search`, `data` es un arreglo. `PATCH` y `DELETE` devuelven un resultado de actualización con `affected: 1`; una fila inactiva produce 404.

### Catálogos paramétricos

Cada fila usa CRUD estándar. `POST` exige únicamente `nombre`; `PATCH` admite `nombre` opcional; `estado` no forma parte del DTO. Nacionalidad, estado civil y etnia admiten 1–100 caracteres, letras Unicode, espacios y `./'-`; GDO admite dígitos y hasta 255. Listas/detalle muestran activos. Alta devuelve 201 y objeto `{ id, nombre, estado: true }` en `data`. Modificar o eliminar inactivo responde 404 con el nombre del catálogo.

| Tabla          | Rutas completas (métodos CRUD estándar)            | Ejemplo de `POST`                       | Ejemplo de `data` en 200/201                                     |
| -------------- | -------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `nacionalidad` | `/api/v1/nacionalidad`, `/api/v1/nacionalidad/:id` | `{ "nombre": "Ecuatoriana" }`           | `{ "id": 1, "nombre": "Ecuatoriana", "estado": true }`           |
| `estado_civil` | `/api/v1/estado-civil`, `/api/v1/estado-civil/:id` | `{ "nombre": "Soltero" }`               | `{ "id": 2, "nombre": "Soltero", "estado": true }`               |
| `etnia`        | `/api/v1/etnia`, `/api/v1/etnia/:id`               | `{ "nombre": "Mestiza" }`               | `{ "id": 1, "nombre": "Mestiza", "estado": true }`               |
| `gdo`          | `/api/v1/gdo`, `/api/v1/gdo/:id`                   | `{ "nombre": "Grupo de referencia 1" }` | `{ "id": 3, "nombre": "Grupo de referencia 1", "estado": true }` |

Son mocks realistas para formularios Vue, no semillas de producción. Los cuatro `GET /:id` pueden responder `data: null` si no hay fila activa. No existe búsqueda textual en servidor para estos catálogos.

### Expedientes y catálogos judiciales

| Tabla                   | Rutas completas y método                                                                           | Cuerpo `POST` (en `PATCH`, campos opcionales)                                                                                                                                                                                                                      | Filtros / respuesta                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `expediente`            | CRUD estándar `/api/v1/expediente`                                                                 | `adlc_id`, `uzdi_id`, `infc_id`: ID positivos obligatorios. Opcionales: `numero_causa` (≤100, mayúsculas/números/`-./ `), `estado_procesal` (enum del DTO), `observaciones`. Ej.: `{ "adlc_id": 7, "uzdi_id": 3, "infc_id": 2, "numero_causa": "EXP-2026-0042" }`. | `GET /api/v1/expediente?adlc_id=7&infc_id=2&uzdi_id=3`; objeto/array de expediente.  |
| `medida_expediente`     | CRUD estándar `/api/v1/medida-expediente`                                                          | `expe_id`, `mdso_id`, `orden`: ID/entero positivos; `fecha_inicio`: fecha ISO. Opcionales: `fecha_fin`, `estado_cumplimiento` (enum), `observaciones`. Ej.: `{ "expe_id": 4, "mdso_id": 2, "orden": 1, "fecha_inicio": "2026-03-01" }`.                            | `GET /api/v1/medida-expediente?expe_id=4&mdso_id=2`; objeto/array.                   |
| `infraccion`            | CRUD estándar `/api/v1/infraccion`; `GET /api/v1/infraccion/:id/expedientes`                       | `nombre` (≤255), `categoria` (≤127) obligatorios; `articulo_cona` (≤50), `descripcion` opcionales. Ej.: `{ "nombre": "Infracción de prueba", "categoria": "Contra la propiedad" }`.                                                                                | La lista admite filtro de estado; `/:id/expedientes` devuelve expedientes asociados. |
| `medida_socioeducativa` | CRUD estándar `/api/v1/medida-socioeducativa`; `GET /api/v1/medida-socioeducativa/:id/expedientes` | `nombre` (≤255) obligatorio; `duracion_meses` (entero positivo) opcional. Ej.: `{ "nombre": "Servicio a la comunidad", "duracion_meses": 3 }`.                                                                                                                     | La lista admite filtro de estado; `/:id/expedientes` devuelve expedientes asociados. |

Valores de `estado_procesal`: `En proceso`, `Atraso`, `Incomparecencia`, `Concluido`, `Archivado`. Valores de `estado_cumplimiento`: `En proceso`, `Cumplida`, `Incumplida`, `Sustituida`, `Suspendida`. Para incluir registros inactivos en `infraccion` y `medida-socioeducativa`, enviar `?incluirInactivos=true`.

En altas, `data` incluye los campos enviados más `id` y valores predeterminados. En listas, `data` es arreglo. Los 400 de validación detallan el campo en `errors`.

## Geografía institucional (`estructura_institucional`)

Para selectores en cascada: `GET /api/v1/provincia` → elegir `prov_id` → `GET /api/v1/canton?prov_id=1` → elegir `cntn_id` → `GET /api/v1/uzdi?cntn_id=5`. Cada `data` es un arreglo con `id`, `nombre` y la FK (`prov_id` o `cntn_id`). Los servicios omiten filas inactivas y descendientes de padres inactivos. Los filtros son opcionales; sin ellos se devuelve la lista activa completa. Los ID de filtro deben ser enteros positivos.

| Tabla       | Rutas completas (CRUD estándar)                                | Cuerpo `POST` / `PATCH`                                                                                                                                                     | Ejemplo de `data` en 200/201                                                               |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `provincia` | `/api/v1/provincia`, `/api/v1/provincia/:id`                   | `{ "nombre": "Pichincha" }`; nombre obligatorio ≤100.                                                                                                                       | `{ "id": 1, "nombre": "Pichincha", "estado": true }`                                       |
| `canton`    | `/api/v1/canton`, `/api/v1/canton/:id`; lista con `?prov_id=1` | `{ "prov_id": 1, "nombre": "Quito" }`; ID positivo, nombre ≤100.                                                                                                            | `{ "id": 5, "prov_id": 1, "nombre": "Quito", "estado": true }`                             |
| `uzdi`      | `/api/v1/uzdi`, `/api/v1/uzdi/:id`; lista con `?cntn_id=5`     | `{ "cntn_id": 5, "nombre": "UZDI Quito Norte", "zona": "Norte" }`; nombre ≤255 y zona ≤100 obligatorios. Opcionales: `direccion` ≤255, `telefono` ≤20, `correo` email ≤100. | `{ "id": 3, "cntn_id": 5, "nombre": "UZDI Quito Norte", "zona": "Norte", "estado": true }` |

Crear o trasladar un cantón a provincia inactiva devuelve 404 `Provincia activa no encontrada`; crear o trasladar una UZDI a cantón inactivo o con provincia inactiva devuelve 404 `Cantón activo no encontrado`. `PATCH` y `DELETE` solo afectan filas activas. No hay `/search` geográfico.

## Contexto familiar (`contexto_familiar`)

| Tabla                       | Rutas completas y método                                                                                        | Cuerpo `POST` (en `PATCH`, campos opcionales)                                                                                                                                                                                   | Lectura / respuesta                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `tipo_parentesco`           | CRUD estándar `/api/v1/tipo-parentesco`                                                                         | `{ "nombre": "Madre" }`; nombre obligatorio ≤100.                                                                                                                                                                               | Objeto/array `{ id, nombre, ... }`.       |
| `representante`             | CRUD estándar `/api/v1/representante`; `GET /api/v1/representante/cedula/:cedula`                               | `cntn_id` ID positivo, `nombre`, `apellido` (≤100), `cedula` (cadena ≤20) obligatorios; `telefono` (≤20), `direccion` (≤255) opcionales. Ej.: `{ "cntn_id": 5, "nombre": "Ana", "apellido": "Pérez", "cedula": "1712345678" }`. | Objeto/array; consulta exacta por cédula. |
| `adolescente_representante` | CRUD estándar `/api/v1/adolescente-representante`; `GET /api/v1/adolescente-representante/adolescente/:adlc_id` | `adlc_id`, `repr_id`, `tprt_id` ID positivos obligatorios; `es_referente` booleano, `fecha_inicio`, `fecha_fin` ISO opcionales. Ej.: `{ "adlc_id": 7, "repr_id": 4, "tprt_id": 1, "es_referente": true }`.                      | Objeto/array; filtro por adolescente.     |

## Talleres y asistencia (`talleres_actividades`)

| Tabla               | Rutas completas y método                                                                   | Cuerpo `POST` (en `PATCH`, campos opcionales)                                                                                                                                                                                                                                                                                                                                           | Lectura / respuesta              |
| ------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `taller`            | CRUD estándar `/api/v1/taller`                                                             | `uzdi_id`, `prsn_id` ID positivos; `nombre`, `tema` textos ≤255; `fecha` ISO, `hora_inicio`, `hora_fin` formato `HH:MM` o `HH:MM:SS`, todos obligatorios. `objetivo`, `lugar` ≤255, `observaciones` opcionales. Ej.: `{ "uzdi_id": 3, "prsn_id": 2, "nombre": "Convivencia", "tema": "Resolución de conflictos", "fecha": "2026-04-10", "hora_inicio": "09:00", "hora_fin": "11:00" }`. | Objeto/array de taller.          |
| `asistencia_taller` | CRUD estándar `/api/v1/asistencia-taller`; `GET /api/v1/asistencia-taller/taller/:tall_id` | `tall_id` ID positivo y `tipo_asistente` (`adolescente` o `representante`) obligatorios; enviar solo uno de `adlc_id` o `adre_id` según el tipo. `asistio` booleano y `observaciones` opcionales. Ej.: `{ "tall_id": 2, "tipo_asistente": "adolescente", "adlc_id": 7, "asistio": true }`.                                                                                              | Objeto/array; filtro por taller. |

## Gestión documental (`gestion_documental`)

| Tabla                  | Rutas completas y método                                                                             | Cuerpo `POST` (en `PATCH`, campos opcionales)                                                                                                                                                                                                                                                                                      | Lectura / respuesta                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `tipo_documento`       | CRUD estándar `/api/v1/tipo-documento`                                                               | `{ "nombre": "Oficio", "descripcion": "Comunicación oficial" }`; nombre obligatorio ≤255, descripción opcional.                                                                                                                                                                                                                    | Objeto/array de tipos.               |
| `documento_expediente` | CRUD estándar `/api/v1/documento-expediente`; `GET /api/v1/documento-expediente/expediente/:expe_id` | `expe_id`, `prsn_id`, `tpdc_id` ID positivos obligatorios; opcionales `es_habilitante` booleano, `estado_tramite` enum, `numero_documento` ≤100, `fecha_documento` ISO, `emisor` ≤255, `observaciones`. Ej.: `{ "expe_id": 4, "prsn_id": 2, "tpdc_id": 1, "numero_documento": "OFI-2026-0045", "fecha_documento": "2026-02-20" }`. | Objeto/array; filtro por expediente. |

Valores de `estado_tramite`: `pendiente`, `recibido`, `verificado`, `no aplica`, `rechazado`.

## Reportes (servicios sin tabla CRUD propia)

`GET /api/v1/reportes/uzdi/adolescentes` y `GET /api/v1/reportes/expedientes/medidas` devuelven consolidados en el envoltorio común. Las cuatro rutas de reporte aceptan opcionalmente `uzdi_id`, `prov_id`, `cntn_id` (enteros) y `estado_procesal` (texto), por ejemplo `?prov_id=1&cntn_id=5`. `GET /api/v1/reportes/export/excel` entrega un archivo `.xlsx` binario: tratarlo como `Blob`. `GET /api/v1/reportes/export/pdf` entrega HTML imprimible (`text/html`) para que el navegador lo guarde como PDF; no devuelve un PDF binario ni JSON.

## Guía de errores por operación

| Caso                                                                              | HTTP                             | Respuesta relevante                                                                                                                   |
| --------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| DTO inválido, ID mal formado o `q` inválido                                       | 400                              | `message: "Error de validación en la solicitud"` y `errors` con las reglas fallidas; otras excepciones 400 llevan mensaje específico. |
| Sin JWT válido o sesión cerrada                                                   | 401                              | `ok: false`, `statusCode: 401`, mensaje del guard.                                                                                    |
| Perfil sin permiso                                                                | 403                              | `ok: false`, `statusCode: 403`, mensaje del guard.                                                                                    |
| Adolescente no activo, FK geográfica inactiva o modificación de catálogo inactivo | 404                              | Mensaje específico como `Adolescente activo no encontrado` o `Cantón activo no encontrado`.                                           |
| Restricción de unicidad o FK en PostgreSQL                                        | 500 si el servicio no la captura | `message` incluye el detalle técnico de la excepción; registrar `path` y código para diagnóstico.                                     |

En formularios de adolescentes, cargar antes los cuatro catálogos y el cantón. `GET /:id` usa el ID interno, no la cédula. Enviar en `PATCH` solo los campos que cambiaron.
