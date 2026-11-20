// Usage: npm run create-admin -- admin@example.com Password123 "Admin Name"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  const [email, password, name = 'Admin'] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- <email> <password> [name]');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `insert into users (name,email,password_hash,role) values ($1,$2,$3,'admin')
     on conflict (email) do update set role='admin'`,
    [name, email.toLowerCase(), hash]
  );
  console.log('Admin ready:', email);
  process.exit(0);
})();
