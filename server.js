const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  if (process.env.DATABASE_URL) {
    await initDb();
  }
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
