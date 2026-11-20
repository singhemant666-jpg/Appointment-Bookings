const pool = require('../config/db');
const { buildSlots, isValidDate, dayOfWeek } = require('../utils/slots');

exports.book = async (req, res) => {
  const { doctorId, date, startTime, reason } = req.body;
  if (!Number.isInteger(Number(doctorId)) || !isValidDate(date) || !startTime)
    return res.status(400).json({ message: 'doctorId, date aur startTime chahiye.' });

  const { rows: avail } = await pool.query(
    'select start_time,end_time,slot_minutes from doctor_availability where doctor_id=$1 and day_of_week=$2',
    [doctorId, dayOfWeek(date)]);
  const { rows: booked } = await pool.query(
    "select start_time from appointments where doctor_id=$1 and appointment_date=$2 and status='booked'",
    [doctorId, date]);

  const start = startTime.length === 5 ? `${startTime}:00` : startTime;
  const slot = buildSlots(avail, booked.map((b) => b.start_time), date).find((s) => s.startTime === start);
  if (!slot) return res.status(400).json({ message: 'Doctor is time par available nahi hai.' });
  if (!slot.available) return res.status(409).json({ message: 'Ye slot ab available nahi hai, doosra chunein.' });

  try {
    // Unique index race condition bhi rok deta hai (2 log ek saath click karein to bhi)
    const { rows } = await pool.query(
      `insert into appointments (user_id,doctor_id,appointment_date,start_time,end_time,reason)
       values ($1,$2,$3,$4,$5,$6) returning id`,
      [req.user.id, doctorId, date, slot.startTime, slot.endTime, reason || null]);
    res.status(201).json({ id: rows[0].id, date, startTime: slot.startTime, endTime: slot.endTime });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Ye slot abhi book ho chuka hai, doosra chunein.' });
    throw e;
  }
};

exports.mine = async (req, res) => {
  const { rows } = await pool.query(
    `select a.id, a.appointment_date as "date", a.start_time as "startTime", a.end_time as "endTime",
            a.status, a.reason, d.name as "doctorName", s.name as specialization
     from appointments a
     join doctors d on d.id = a.doctor_id
     join specializations s on s.id = d.specialization_id
     where a.user_id=$1 order by a.appointment_date desc, a.start_time desc`, [req.user.id]);
  res.json(rows);
};

exports.cancel = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ message: 'Appointment nahi mili.' });
  const r = await pool.query(
    "update appointments set status='cancelled' where id=$1 and user_id=$2 and status='booked'",
    [id, req.user.id]);
  if (!r.rowCount) return res.status(404).json({ message: 'Appointment nahi mili ya pehle se cancel hai.' });
  res.json({ message: 'Appointment cancel ho gayi.' });
};
