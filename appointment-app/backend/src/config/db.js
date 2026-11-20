const { Pool, types } = require('pg');

// DATE ko JS Date ki jagah "YYYY-MM-DD" string hi rehne do (timezone ka jhanjhat nahi)
types.setTypeParser(1082, (v) => v);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL .env me nahi mila. Supabase ki connection string paste karo.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase ke liye SSL zaroori hai
  max: 10,
});

module.exports = pool;
