// npm run db-check  -> connection aur tables test karta hai
require('dotenv').config();
const pool = require('../config/db');

(async () => {
  try {
    const t = await pool.query('select now() as now');
    console.log('Connected. Server time:', t.rows[0].now);
    const d = await pool.query('select count(*)::int as n from doctors');
    console.log('Doctors in DB:', d.rows[0].n, d.rows[0].n === 0 ? '(seed.sql run karo)' : '');
  } catch (e) {
    console.error('DB ERROR:', e.code || '', e.message);
  }
  process.exit(0);
})();
