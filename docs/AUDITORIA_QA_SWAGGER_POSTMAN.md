# Auditoría de calidad: Swagger, Postman y códigos HTTP

**Fecha:** 15 de noviembre de 2026

**Rama:** `feature/qa-swagger-postman`

**Render:** `https://uzdi-backend-api.onrender.com`

## Colección para demostración

Importar [`UZDI_API.postman_collection.json`](../UZDI_API.postman_collection.json) en Postman o Thunder Client. La colección incluye **148 operaciones** del OpenAPI publicado en Render, agrupadas en Salud, Auth, Adolescentes, Expedientes, Medidas, Talleres, Reportes, Catálogos, Geografía, Familia, Documentos y Seguridad. Se genera con:

Se verificó que las 148 combinaciones de método y ruta coinciden con OpenAPI y que el archivo cumple el esquema oficial Postman Collection v2.1.

```sh
node scripts/generate-postman-collection.js openapi.json UZDI_API.postman_collection.json
```

`openapi.json` puede descargarse de `https://uzdi-backend-api.onrender.com/api/docs-json`. El generador toma rutas, métodos, parámetros y ejemplos de los esquemas OpenAPI; la colección contiene peticiones de escritura que modifican datos, por lo que deben ejecutarse en un entorno de demostración.

1. `baseUrl` apunta a Render. Para backend local, cambiarlo a `http://localhost:3000` (sin `/api/v1`).
2. Completar `login` y `password` con credenciales de prueba válidas. La colección no guarda contraseñas ni tokens reales.
3. Ejecutar **Auth → POST /auth/login**. Su script guarda `data.token` en `{{token}}`; las demás peticiones heredan Bearer `{{token}}`.
4. Ajustar los ID de las variables de colección a los registros de prueba. Las consultas opcionales aparecen desactivadas hasta que se requieran.
5. La prueba de colección comprueba que ninguna petición devuelva 500 y que las respuestas JSON respeten el envoltorio `ok`.

## Swagger UI en Render

Se comprobó `GET /api/docs` y `GET /api/docs-json`: la especificación devuelve **75 rutas, 148 operaciones y 50 esquemas DTO**. Todas las operaciones POST, PUT o PATCH que reciben JSON declaran `requestBody` con esquema; `PATCH /sesion/{id}/cerrar` no requiere cuerpo. Las rutas protegidas declaran Bearer JWT; las públicas son la raíz, `/health` y `POST /auth/login`.

En la UI se abrió **POST /api/v1/auth/login**, se observó el esquema `LoginDto`, se pulsó **Try it out**, se envió `{}` y Render devolvió **400** con `errors` específicos para `login` y `password`. El despliegue actual mostraba ese 400 como “Undocumented”. Esta rama incorpora las respuestas 400, 401, 403, 404, 409 y 500 en todas las operaciones Swagger, junto con el contrato JSON de éxito donde corresponde. El cambio se verá en Render tras desplegar la rama o fusionarla.

## Códigos HTTP

| Código | Verificación |
| --- | --- |
| 200 | `GET /api/v1/health` en Render devuelve `ok: true`. Prueba local del interceptor. |
| 201 | Prueba HTTP local de creación con cuerpo válido. El login se ajustó a 200, acorde con su anotación Swagger. |
| 400 | `Try it out` en Render con login vacío devuelve errores de DTO. Prueba HTTP local del filtro. |
| 401 | `GET /api/v1/adolescente` sin token en Render devuelve 401 con explicación concreta. Prueba existente del guard. |
| 403 | Prueba local de excepción y prueba RBAC existente para perfil sin permiso. Requiere credenciales de perfil limitado para probarlo en Render. |
| 404 | Ruta inexistente en Render devuelve 404. Las consultas por ID de catálogos y geografía ahora lanzan 404 si no hay fila activa, con pruebas para los siete recursos. |
| 409 | Prueba local de violación PostgreSQL `23505` traducida por el filtro. Para probarlo en Render haría falta autenticación y crear un duplicado. |
| 500 | Excepciones imprevistas quedan registradas en el servidor y devuelven un error JSON controlado sin exponer el mensaje interno. La prueba local cubre este contrato; un fallo real de infraestructura aún puede producir 500. |

La prueba de CORS en Render (`OPTIONS /api/v1/auth/login` con el origen de Render) devolvió **204** y `Access-Control-Allow-Origin`, necesario para que Swagger UI haga solicitudes desde el navegador.
