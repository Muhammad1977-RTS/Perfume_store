require('dotenv').config();
const db = require('../src/db');

async function migrate() {
  console.log('Running status migration...');
  await db.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
  `);
  console.log('✅  Migration complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
