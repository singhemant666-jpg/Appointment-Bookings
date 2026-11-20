const pool = require('../config/db');
const { buildSlots, isValidDate, dayOfWeek } = require('../utils/slots');

exports.list = async (req, res) => {
  const { search, specializationId } = req.query;
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(d.name ilike $${params.length} or s.name ilike $${params.length})`);
  }
  if (specializationId) {
    params.push(Number(specializationId));
    where.push(`d.specialization_id = $${params.length}`);
  }

  const { rows: doctors } = await pool.query(
    `select d.id, d.name, d.experience_years, d.fee, d.bio,
            s.id as "specializationId", s.name as specialization
     from doctors d join specializations s on s.id = d.specialization_id
     ${where.length ? 'where ' + where.join(' and ') : ''}
     order by d.name`, params);

  // Har doctor ke weekly timings bhi bhej do (card par dikhane ke liye)
  const { rows: avail } = await pool.query(
    'select doctor_id, day_of_week, start_time, end_time from doctor_availability order by day_of_week, start_time');
  const byDoc = {};
  avail.forEach((a) => (byDoc[a.doctor_id] ||= []).push(a));
  res.json(doctors.map((d) => ({ ...d, schedule: byDoc[d.id] || [] })));
};

exports.getOne = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ message: 'Doctor nahi mila.' });
  const { rows } = await pool.query(
    `select d.id, d.name, d.experience_years, d.fee, d.bio, s.name as specialization
     from doctors d join specializations s on s.id = d.specialization_id where d.id=$1`, [id]);
  if (!rows[0]) return res.status(404).json({ message: 'Doctor nahi mila.' });
  const { rows: schedule } = await pool.query(
    'select day_of_week, start_time, end_time, slot_minutes from doctor_availability where doctor_id=$1 order by day_of_week', [id]);
  res.json({ ...rows[0], schedule });
};

exports.slots = async (req, res) => {
  const { date } = req.query;
  const id = Number(req.params.id);
  if (!isValidDate(date) || !Number.isInteger(id)) return res.status(400).json({ message: 'date YYYY-MM-DD format me do.' });
  const { rows: avail } = await pool.query(
    'select start_time,end_time,slot_minutes from doctor_availability where doctor_id=$1 and day_of_week=$2',
    [id, dayOfWeek(date)]);
  const { rows: booked } = await pool.query(
    "select start_time from appointments where doctor_id=$1 and appointment_date=$2 and status='booked'",
    [id, date]);
  res.json({ date, slots: buildSlots(avail, booked.map((b) => b.start_time), date) });
};

// Admin: naya doctor + uska schedule
exports.create = async (req, res) => {
  const { name, specializationId, experienceYears, fee, bio, schedule = [] } = req.body;
  if (!name || !specializationId) return res.status(400).json({ message: 'name aur specializationId chahiye.' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query(
      'insert into doctors (name,specialization_id,experience_years,fee,bio) values ($1,$2,$3,$4,$5) returning id',
      [name, specializationId, experienceYears || 0, fee || 0, bio || null]);
    for (const s of schedule) {
      await client.query(
        'insert into doctor_availability (doctor_id,day_of_week,start_time,end_time,slot_minutes) values ($1,$2,$3,$4,$5)',
        [rows[0].id, s.dayOfWeek, s.startTime, s.endTime, s.slotMinutes || 30]);
    }
    await client.query('commit');
    res.status(201).json({ id: rows[0].id });
  } catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
};

exports.specializations = async (_req, res) => {
  const { rows } = await pool.query('select id,name from specializations order by name');
  res.json(rows);
};
