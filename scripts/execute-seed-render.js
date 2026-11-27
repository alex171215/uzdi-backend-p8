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

    const sqlPath = path.join(__dirname, '..', 'db', '04_datos_prueba_operacionales.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Ejecutando script de sembrado de 5 adolescentes, expedientes y medidas...');
    await client.query(sql);
    console.log('✅ Script ejecutado correctamente.');

    const adlcCount = await client.query('SELECT COUNT(*) FROM adolescente.adolescente');
    const expeCount = await client.query('SELECT COUNT(*) FROM adolescente.expediente');
    const mdexCount = await client.query('SELECT COUNT(*) FROM adolescente.medida_expediente');

    console.log('\n📊 Conteos actuales en Render:');
    console.log(' - adolescente.adolescente:', adlcCount.rows[0].count);
    console.log(' - adolescente.expediente:', expeCount.rows[0].count);
    console.log(' - adolescente.medida_expediente:', mdexCount.rows[0].count);

    const rows = await client.query(`
      SELECT 
        a.adlc_id, a.nombre, a.apellido, a.cedula,
        e.expe_id, e.numero_causa, e.estado_procesal, u.nombre as uzdi,
        m.nombre as medida, me.estado_cumplimiento
      FROM adolescente.adolescente a
      LEFT JOIN adolescente.expediente e ON a.adlc_id = e.adlc_id
      LEFT JOIN estructura_institucional.uzdi u ON e.uzdi_id = u.uzdi_id
      LEFT JOIN adolescente.medida_expediente me ON e.expe_id = me.expe_id
      LEFT JOIN adolescente.medida_socioeducativa m ON me.mdso_id = m.mdso_id
      ORDER BY a.adlc_id;
    `);

    console.log('\n📋 Registros insertados:');
    console.table(rows.rows);

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();

