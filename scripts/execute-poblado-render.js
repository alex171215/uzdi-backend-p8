const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://uzdi_user:ca1vW3gOf6p6zOAf7plYQVG2AZTuuBP1@dpg-dbn63suc6qcc73coqpgg-a.oregon-postgres.render.com/uzdi_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado a Render PostgreSQL (uzdi_db)');

    const sqlPath = path.join(__dirname, '..', 'db', '05_poblado_completo_tablas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Ejecutando script 05_poblado_completo_tablas.sql...');
    await client.query(sql);
    console.log('✅ Poblado ejecutado correctamente.');

    await client.end();
  } catch (err) {
    console.error('❌ Error ejecutando poblado:', err);
    process.exit(1);
  }
}

run();

