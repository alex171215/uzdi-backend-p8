/**
 * Inicializa la base de datos antes de arrancar la API (pensado para Render,
 * donde PostgreSQL se crea vacío y no ejecuta docker-entrypoint-initdb.d).
 *
 *   node scripts/init-db.js        (usa DATABASE_URL)
 *
 * - Si no existe el esquema (seguridad.prsn), ejecuta el DDL v8 y los catálogos.
 * - Siempre ejecuta db/02_seguridad_rbac.sql, que es idempotente
 *   (tabla persona-perfil, usuario admin y matriz RBAC).
 * - Si algo falla termina con código 1 y Render marca el despliegue como fallido.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const raiz = path.join(__dirname, '..');
const DDL = path.join(raiz, 'Back Ecologia (1).sql');
const SEGURIDAD = path.join(raiz, 'db', '02_seguridad_rbac.sql');
const CATALOGOS = path.join(raiz, 'db', '03_datos_iniciales_catalogos.sql');

function opcionesSsl(url) {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true' || /sslmode=require/.test(url)) {
    return { rejectUnauthorized: false };
  }
  // URL externa de Render (*.render.com) exige SSL; la interna (dpg-xxx-a) no.
  return /\.render\.com/.test(url) ? { rejectUnauthorized: false } : false;
}

async function ejecutar(client, archivo) {
  const inicio = Date.now();
  await client.query(fs.readFileSync(archivo, 'utf8'));
  console.log(
    `[init-db] ✔ ${path.relative(raiz, archivo)} (${Date.now() - inicio} ms)`,
  );
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está definida');

  const client = new Client({ connectionString: url, ssl: opcionesSsl(url) });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT to_regclass('seguridad.prsn') AS existe",
    );
    if (!rows[0].existe) {
      console.log('[init-db] Base vacía: creando esquema DDL v8...');
      await ejecutar(client, DDL);
      await ejecutar(client, SEGURIDAD);
      await ejecutar(client, CATALOGOS);
    } else {
      console.log(
        '[init-db] El esquema ya existe; se actualiza solo la seguridad.',
      );
      await ejecutar(client, SEGURIDAD);
    }
    const r = await client.query(
      "SELECT (SELECT count(*) FROM seguridad.prsn WHERE prsnlogn = 'admin') AS admin, (SELECT count(*) FROM seguridad.prms) AS permisos",
    );
    console.log(
      `[init-db] Listo: admin=${r.rows[0].admin}, permisos=${r.rows[0].permisos}`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('[init-db] ✘ Error inicializando la base de datos:', e.message);
  process.exit(1);
});
