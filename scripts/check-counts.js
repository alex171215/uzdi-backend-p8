const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://uzdi_user:ca1vW3gOf6p6zOAf7plYQVG2AZTuuBP1@dpg-dbn63suc6qcc73coqpgg-a.oregon-postgres.render.com/uzdi_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Render PostgreSQL!');

    const tables = [
      'adolescente.adlc',
      'adolescente.adolescente',
      'adolescente.expediente',
      'adolescente.expd',
      'adolescente.medida_socioeducativa',
      'estructura_institucional.uzdi',
      'seguridad.prsn'
    ];

    for (const t of tables) {
      try {
        const res = await client.query('SELECT COUNT(*) FROM ' + t);
        console.log(t + ' count: ' + res.rows[0].count);
      } catch (e) {
        console.log(t + ' error: ' + e.message);
      }
    }

    const schemaRes = await client.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('adolescente', 'seguridad', 'estructura_institucional', 'contexto_familiar') ORDER BY table_schema, table_name"
    );
    console.log('Tables found:', schemaRes.rows.map(r => `${r.table_schema}.${r.table_name}`));

    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

run();

