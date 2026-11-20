const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Route nahi mila.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server me kuch gadbad hui.' });
});

module.exports = app;
