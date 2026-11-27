const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://uzdi_user:ca1vW3gOf6p6zOAf7plYQVG2AZTuuBP1@dpg-dbn63suc6qcc73coqpgg-a.oregon-postgres.render.com/uzdi_db',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  const tables = ['adolescente', 'expediente', 'medida_expediente'];
  for (const t of tables) {
    const cols = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_schema = 'adolescente' AND table_name = $1 
       ORDER BY ordinal_position`,
      [t]
    );
    console.log(`\n=== Columns in adolescente.${t} ===`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
  }

  const fks = await client.query(`
    SELECT
      tc.table_name, kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='adolescente';
  `);
  console.log('\n=== Foreign Keys in adolescente schema ===');
  console.log(fks.rows);

  const uzdis = await client.query('SELECT uzdi_id, nombre FROM estructura_institucional.uzdi LIMIT 5');
  console.log('\nUZDIs:', uzdis.rows);

  const infc = await client.query('SELECT infc_id, nombre FROM adolescente.infraccion LIMIT 5');
  console.log('\nInfracciones:', infc.rows);

  const mdso = await client.query('SELECT mdso_id, nombre FROM adolescente.medida_socioeducativa LIMIT 5');
  console.log('\nMedidas socioeducativas:', mdso.rows);

  const nacn = await client.query('SELECT nacn_id, nombre FROM adolescente.nacionalidad LIMIT 3');
  console.log('\nNacionalidades:', nacn.rows);

  const etnia = await client.query('SELECT etna_id, nombre FROM adolescente.etnia LIMIT 3');
  console.log('\nEtnias:', etnia.rows);

  const estc = await client.query('SELECT estc_id, nombre FROM adolescente.estado_civil LIMIT 3');
  console.log('\nEstado civil:', estc.rows);

  await client.end();
}

run().catch(console.error);

