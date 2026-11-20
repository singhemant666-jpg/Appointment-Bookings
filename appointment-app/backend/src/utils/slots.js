// "09:30:00" -> 570 (minutes)
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
// 570 -> "09:30:00"
const toTime = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}:00`;

const pad = (n) => String(n).padStart(2, '0');

// availability rows + booked start_times se us din ke slots banata hai
function buildSlots(availabilityRows, bookedStartTimes, dateStr) {
  const booked = new Set(bookedStartTimes.map((t) => t.slice(0, 8)));
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = dateStr === todayStr;

  const slots = [];
  for (const a of availabilityRows) {
    const end = toMin(a.end_time);
    for (let s = toMin(a.start_time); s + a.slot_minutes <= end; s += a.slot_minutes) {
      const start = toTime(s);
      const past = (isToday && s <= nowMin) || dateStr < todayStr;
      slots.push({
        startTime: start,
        endTime: toTime(s + a.slot_minutes),
        available: !booked.has(start) && !past,
      });
    }
  }
  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

const isValidDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const dayOfWeek = (dateStr) => new Date(`${dateStr}T00:00:00`).getDay();

module.exports = { buildSlots, isValidDate, dayOfWeek };
