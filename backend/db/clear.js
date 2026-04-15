/**
 * npm run db:clear
 * Deletes all products except those listed in KEEP_IDS.
 */
require('dotenv').config();
const pool = require('../src/db');

const KEEP_IDS = [
  'maison-crivelli-oud-maracuja',
];

async function clear() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM products WHERE id != ALL($1::text[])`,
      [KEEP_IDS],
    );
    console.log(`✅  Deleted ${result.rowCount} old product(s).`);
  } catch (err) {
    console.error('❌  Clear error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

clear();
