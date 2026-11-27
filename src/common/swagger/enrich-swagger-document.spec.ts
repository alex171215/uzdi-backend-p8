import type { OpenAPIObject } from '@nestjs/swagger';
import { enrichSwaggerDocument } from './enrich-swagger-document';

describe('Contrato Swagger global', () => {
  it('documenta errores y el esquema de éxito sin convertir descargas en JSON', () => {
    const document: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'UZDI', version: '2' },
      servers: [],
      tags: [],
      components: { schemas: {} },
      paths: {
        '/api/v1/adolescente': {
          post: { responses: { '201': { description: 'Creado' } } },
        },
        '/api/v1/reportes/export/excel': {
          get: { responses: { '200': { description: 'Excel' } } },
        },
      },
    };
    const result = enrichSwaggerDocument(document);
    const create = result.paths['/api/v1/adolescente'].post;
    expect(create.responses['201']).toHaveProperty('content.application/json');
    for (const code of [400, 401, 403, 404, 409, 500]) {
      expect(create.responses[String(code)]).toHaveProperty(
        'content.application/json.schema.$ref',
        '#/components/schemas/ErrorResponse',
      );
    }
    expect(
      result.paths['/api/v1/reportes/export/excel'].get.responses['200'],
    ).not.toHaveProperty('content.application/json');
  });
});
