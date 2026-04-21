require('dotenv').config();
const db = require('../src/db');

async function migrate() {
  console.log('Running auth migration...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL         PRIMARY KEY,
      email         VARCHAR(255)   NOT NULL UNIQUE,
      password_hash VARCHAR(255)   NOT NULL,
      name          VARCHAR(255)   NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`);

  await db.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS user_id     INTEGER      DEFAULT NULL
        REFERENCES users(id) ON DELETE SET NULL;
  `);

  console.log('✅  Migration complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
