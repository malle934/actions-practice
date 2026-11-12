const express = require('express');
const { getPool } = require('./db');

const app = express();
app.use(express.json());

// Configuration read from environment variables (useful for practicing env vars and secrets)
const APP_NAME = process.env.APP_NAME || 'actions-practice';

const planets = [
  { id: 1, name: 'Mercury', moons: 0 },
  { id: 2, name: 'Venus', moons: 0 },
  { id: 3, name: 'Earth', moons: 1 },
  { id: 4, name: 'Mars', moons: 2 },
  { id: 5, name: 'Jupiter', moons: 95 },
  { id: 6, name: 'Saturn', moons: 146 },
  { id: 7, name: 'Uranus', moons: 28 },
  { id: 8, name: 'Neptune', moons: 16 }
];

app.get('/', (req, res) => {
  res.json({ app: APP_NAME, status: 'ok' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/planets', (req, res) => {
  res.json(planets);
});

app.get('/planets/:id', (req, res) => {
  const planet = planets.find((p) => p.id === Number(req.params.id));
  if (!planet) {
    return res.status(404).json({ error: 'Planet not found' });
  }
  res.json(planet);
});

app.post('/add', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'a and b must be numbers' });
  }
  res.json({ result: a + b });
});

// Database-backed routes (need DATABASE_URL, e.g. a Postgres service container)
app.get('/db-health', async (req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ database: 'connected' });
  } catch (err) {
    res.status(503).json({ database: 'unavailable', error: err.message });
  }
});

app.get('/notes', async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT id, text FROM notes ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/notes', async (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const { rows } = await getPool().query(
      'INSERT INTO notes (text) VALUES ($1) RETURNING id, text',
      [text]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

module.exports = app;
