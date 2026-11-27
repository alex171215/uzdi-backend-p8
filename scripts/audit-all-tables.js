const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://uzdi_user:ca1vW3gOf6p6zOAf7plYQVG2AZTuuBP1@dpg-dbn63suc6qcc73coqpgg-a.oregon-postgres.render.com/uzdi_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const tablesQuery = `
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `;

  const tables = await client.query(tablesQuery);
  const results = [];

  for (const row of tables.rows) {
    const fullName = `"${row.table_schema}"."${row.table_name}"`;
    try {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${fullName}`);
      const count = parseInt(countRes.rows[0].count, 10);
      results.push({
        schema: row.table_schema,
        table: row.table_name,
        count: count,
        status: count >= 3 ? '✅ OK' : (count > 0 ? '⚠️ < 3' : '❌ 0')
      });
    } catch (e) {
      results.push({
        schema: row.table_schema,
        table: row.table_name,
        count: -1,
        status: 'ERR: ' + e.message
      });
    }
  }

  console.log('\n📊 ESTADO DE REGISTROS POR TABLA EN RENDER:');
  console.table(results);

  await client.end();
}

run().catch(console.error);

