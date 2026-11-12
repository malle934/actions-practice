const { Pool } = require('pg');

let pool;

// Pool is created lazily so the app and the unit tests work without a database.
function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function initDb() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = { getPool, initDb, closeDb };
