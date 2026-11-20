const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email aur kam se kam 6 character ka password chahiye.' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'insert into users (name,email,phone,password_hash) values ($1,$2,$3,$4) returning id',
      [name, email.toLowerCase(), phone || null, hash]
    );
    const user = { id: Number(rows[0].id), name, role: 'patient' };
    res.status(201).json({ token: sign(user), user });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Is email se account pehle se hai.' });
    throw e;
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('select * from users where email=$1', [(email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    return res.status(401).json({ message: 'Email ya password galat hai.' });
  const user = { id: Number(u.id), name: u.name, role: u.role };
  res.json({ token: sign(user), user });
};

exports.me = async (req, res) => {
  const { rows } = await pool.query('select id,name,email,phone,role from users where id=$1', [req.user.id]);
  res.json(rows[0]);
};
