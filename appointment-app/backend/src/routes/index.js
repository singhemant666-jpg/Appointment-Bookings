const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const auth = require('../controllers/authController');
const doctors = require('../controllers/doctorController');
const appts = require('../controllers/appointmentController');
const pool = require('../config/db');
const { suggestSpecialization } = require('../services/aiService');

// async errors ko Express error handler tak pahunchane ke liye
const w = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/auth/register', w(auth.register));
router.post('/auth/login', w(auth.login));
router.get('/auth/me', requireAuth, w(auth.me));

router.get('/specializations', w(doctors.specializations));
router.get('/doctors', w(doctors.list));
router.get('/doctors/:id', w(doctors.getOne));
router.get('/doctors/:id/slots', w(doctors.slots));
router.post('/doctors', requireAuth, requireAdmin, w(doctors.create));

router.post('/appointments', requireAuth, w(appts.book));
router.get('/appointments/mine', requireAuth, w(appts.mine));
router.patch('/appointments/:id/cancel', requireAuth, w(appts.cancel));

// AI: symptoms -> specialist
router.post('/ai/suggest', w(async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || symptoms.trim().length < 3) return res.status(400).json({ message: 'Symptoms likhein.' });
  const { rows: specs } = await pool.query('select id,name from specializations');
  const result = await suggestSpecialization(symptoms, specs.map((s) => s.name));
  const match = specs.find((s) => s.name === result.specialization);
  res.json({ ...result, specializationId: match?.id || null });
}));

module.exports = router;
