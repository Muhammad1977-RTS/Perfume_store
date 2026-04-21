require('dotenv').config();
const db = require('../src/db');

async function migrate() {
  console.log('Running admin migration...');

  await db.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  console.log('✅  Migration complete');
  console.log('');
  console.log('To grant admin rights, run in psql:');
  console.log("  UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';");
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
