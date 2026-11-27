import type { OpenAPIObject, SchemaObject } from '@nestjs/swagger';

const errorSchema: SchemaObject = {
  type: 'object',
  required: ['ok', 'statusCode', 'message', 'errors', 'path', 'timestamp'],
  properties: {
    ok: { type: 'boolean', example: false },
    statusCode: { type: 'integer', example: 400 },
    message: { type: 'string', example: 'Error de validación en la solicitud' },
    errors: { type: 'array', nullable: true, items: { type: 'string' } },
    path: { type: 'string', example: '/api/v1/adolescente' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const successSchema: SchemaObject = {
  type: 'object',
  required: ['ok', 'message', 'data', 'timestamp'],
  properties: {
    ok: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Operación realizada correctamente' },
    data: {
      nullable: true,
      oneOf: [
        { type: 'object', additionalProperties: true },
        { type: 'array', items: {} },
      ],
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const errors: Record<string, string> = {
  '400': 'Solicitud inválida: detalles de validación en errors',
  '401': 'Token ausente, inválido o sesión cerrada',
  '403': 'El perfil no tiene permiso para la operación',
  '404': 'Recurso activo no encontrado',
  '409': 'Conflicto de unicidad o integridad referencial',
  '500': 'Error interno registrado por el servidor',
};

/** Completa el contrato global del interceptor y filtro en Swagger UI. */
export function enrichSwaggerDocument(document: OpenAPIObject): OpenAPIObject {
  document.components ??= {};
  document.components.schemas ??= {};
  document.components.schemas.ErrorResponse = errorSchema;
  document.components.schemas.SuccessResponse = successSchema;

  for (const [route, pathItem] of Object.entries(document.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = pathItem[method];
      if (!operation) continue;
      operation.responses ??= {};
      for (const [status, description] of Object.entries(errors)) {
        operation.responses[status] ??= {
          description,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        };
      }
      if (!route.startsWith('/api/v1/reportes/export/')) {
        for (const status of ['200', '201']) {
          const response = operation.responses[status];
          if (response && !('$ref' in response) && !response.content) {
            response.content = {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            };
          }
        }
      }
    }
  }
  return document;
}
