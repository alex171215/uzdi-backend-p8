#!/usr/bin/env node
// Genera una colección Postman v2.1 desde el OpenAPI publicado por NestJS.
// Uso: node scripts/generate-postman-collection.js <openapi.json> [salida.json]
const fs = require('node:fs');
const path = require('node:path');

const input = process.argv[2];
const output = process.argv[3] || 'UZDI_API.postman_collection.json';
if (!input) {
  console.error('Uso: node scripts/generate-postman-collection.js <openapi.json> [salida.json]');
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(input, 'utf8'));
const schemas = spec.components?.schemas || {};
const methods = ['get', 'post', 'put', 'patch', 'delete'];
const folders = [
  'Salud', 'Auth', 'Adolescentes', 'Expedientes', 'Medidas', 'Talleres',
  'Reportes', 'Catálogos', 'Geografía', 'Familia', 'Documentos', 'Seguridad',
];
const items = Object.fromEntries(folders.map((name) => [name, []]));
const routeFolders = {
  undefined: 'Salud', health: 'Salud',
  auth: 'Auth', adolescente: 'Adolescentes', expediente: 'Expedientes',
  'medida-expediente': 'Medidas', 'medida-socioeducativa': 'Medidas',
  taller: 'Talleres', 'asistencia-taller': 'Talleres', reportes: 'Reportes',
  nacionalidad: 'Catálogos', 'estado-civil': 'Catálogos', etnia: 'Catálogos',
  gdo: 'Catálogos', infraccion: 'Catálogos', 'tipo-parentesco': 'Catálogos',
  'tipo-documento': 'Catálogos', provincia: 'Geografía', canton: 'Geografía',
  uzdi: 'Geografía', representante: 'Familia',
  'adolescente-representante': 'Familia', 'documento-expediente': 'Documentos',
  users: 'Seguridad', persona: 'Seguridad', sesion: 'Seguridad',
  historial: 'Seguridad', perfil: 'Seguridad', accion: 'Seguridad',
  permiso: 'Seguridad',
};

function resolveSchema(schema, seen = new Set()) {
  if (!schema) return {};
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    if (seen.has(name)) return {};
    return resolveSchema(schemas[name], new Set([...seen, name]));
  }
  if (schema.allOf) {
    return schema.allOf.reduce((result, part) => {
      const resolved = resolveSchema(part, seen);
      return {
        ...result,
        ...resolved,
        properties: { ...result.properties, ...resolved.properties },
        required: [...new Set([...(result.required || []), ...(resolved.required || [])])],
      };
    }, {});
  }
  return schema;
}

function example(schema, key) {
  if (key === 'newPassword') return '{{newPassword}}';
  if (key && /password|clave/i.test(key)) return '{{password}}';
  const resolved = resolveSchema(schema);
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;
  if (resolved.enum?.length) return resolved.enum[0];
  if (resolved.type === 'array') return [example(resolved.items)];
  if (resolved.type === 'object' || resolved.properties) {
    return Object.fromEntries(
      Object.entries(resolved.properties || {}).map(([name, prop]) => [name, example(prop, name)]),
    );
  }
  if (key && /(^|_)id$|Id$/.test(key)) return 1;
  if (resolved.type === 'integer' || resolved.type === 'number') return 1;
  if (resolved.type === 'boolean') return true;
  if (resolved.format === 'date' || /fecha/.test(key || '')) return '2026-11-15';
  return 'Ejemplo';
}

for (const [route, operations] of Object.entries(spec.paths || {})) {
  const segments = route.split('/').filter(Boolean);
  const resource = segments[2];
  const folder = routeFolders[resource] || 'Seguridad';
  for (const method of methods) {
    const operation = operations[method];
    if (!operation) continue;
    const urlPath = route.replace(/\{([^}]+)\}/g, '{{$1}}');
    const query = (operation.parameters || [])
      .filter((p) => p.in === 'query')
      .map((p) => ({
        key: p.name,
        value: String(p.example ?? p.schema?.example ?? (p.name === 'q' ? 'Pérez' : /id/i.test(p.name) ? '1' : 'true')),
        description: p.description || '',
        disabled: !p.required,
      }));
    const request = {
      method: method.toUpperCase(),
      header: [],
      url: {
        raw: '{{baseUrl}}' + urlPath,
        host: ['{{baseUrl}}'],
        path: segments.map((s) => /^\{.+\}$/.test(s) ? '{{' + s.slice(1, -1) + '}}' : s),
        ...(query.length ? { query } : {}),
      },
      description: operation.summary || operation.description || '',
    };
    const bodySchema = operation.requestBody?.content?.['application/json']?.schema;
    if (bodySchema) {
      const payload = example(bodySchema);
      if (route === '/api/v1/auth/login') {
        payload.login = '{{login}}';
        payload.password = '{{password}}';
        delete payload.prfl_id;
      }
      request.header.push({ key: 'Content-Type', value: 'application/json' });
      request.body = {
        mode: 'raw',
        raw: JSON.stringify(payload, null, 2),
        options: { raw: { language: 'json' } },
      };
    }
    if (route === '/api/v1/auth/login' || route === '/api/v1') {
      request.auth = { type: 'noauth' };
    }
    const item = {
      name: method.toUpperCase() + ' ' + route.replace(/^\/api\/v1/, ''),
      request,
      response: [],
    };
    if (route === '/api/v1/auth/login') {
      item.event = [{
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            'if (pm.response.code === 200 || pm.response.code === 201) {',
            '  const token = pm.response.json()?.data?.token;',
            '  if (token) pm.collectionVariables.set("token", token);',
            '}',
          ],
        },
      }];
    }
    items[folder].push(item);
  }
}

const collection = {
  info: {
    name: 'UZDI API',
    description: 'Colección generada desde OpenAPI. Configure login/password, ejecute Auth > POST /auth/login y use token Bearer automáticamente. Las peticiones de escritura modifican datos; utilice un entorno de demostración.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] },
  event: [{
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: [
        'pm.test("La API no devuelve 500", () => pm.expect(pm.response.code).to.be.below(500));',
        'const tipo = pm.response.headers.get("Content-Type") || "";',
        'if (tipo.includes("application/json")) {',
        '  pm.test("Respuesta JSON con contrato UZDI", () => {',
        '    const body = pm.response.json();',
        '    pm.expect(body).to.have.property("ok");',
        '    if (pm.response.code >= 400) pm.expect(body).to.have.property("message");',
        '  });',
        '}',
      ],
    },
  }],
  item: folders.filter((name) => items[name].length).map((name) => ({ name, item: items[name] })),
  variable: [
    { key: 'baseUrl', value: 'https://uzdi-backend-api.onrender.com', type: 'string' },
    { key: 'token', value: '', type: 'string' },
    { key: 'login', value: '', type: 'string' },
    { key: 'password', value: '', type: 'string' },
    { key: 'newPassword', value: '', type: 'string' },
    ...[...new Set(
      JSON.stringify(spec.paths).match(/\{[A-Za-z][A-Za-z0-9_]*\}/g) || [],
    )].map((name) => ({
      key: name.slice(1, -1),
      value: name === '{cedula}' ? '1712345678' : '1',
      type: 'string',
    })),
  ],
};
fs.writeFileSync(output, JSON.stringify(collection, null, 2) + '\n');
console.log(`Escritas ${collection.item.reduce((sum, group) => sum + group.item.length, 0)} operaciones en ${path.resolve(output)}`);
