'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, DAYS, hm } from '@/lib/api';

const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (local)

export default function DoctorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState(null);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/doctors/${id}`).then(setDoctor).catch((e) => setMsg({ type: 'err', text: e.message }));
  }, [id]);

  const loadSlots = () =>
    api(`/doctors/${id}/slots?date=${date}`)
      .then((r) => setSlots(r.slots))
      .catch((e) => setMsg({ type: 'err', text: e.message }));

  useEffect(() => { setPicked(null); loadSlots(); /* eslint-disable-next-line */ }, [id, date]);

  async function book() {
    if (!localStorage.getItem('token')) return router.push('/login');
    setBusy(true); setMsg({ type: '', text: '' });
    try {
      await api('/appointments', { method: 'POST', auth: true, body: { doctorId: Number(id), date, startTime: picked, reason } });
      setMsg({ type: 'ok', text: 'Appointment book ho gayi. "Meri appointments" me dekh sakte ho.' });
      setPicked(null); setReason(''); loadSlots();
    } catch (e) { setMsg({ type: 'err', text: e.message }); loadSlots(); }
    setBusy(false);
  }

  if (!doctor) return <p className="muted">{msg.text || 'Load ho raha hai…'}</p>;
  const free = slots.filter((s) => s.available).length;

  return (
    <div className="booking">
      <aside>
        <h1>{doctor.name}</h1>
        <p className="spec">{doctor.specialization} · {doctor.experience_years} saal ka anubhav</p>
        <p>{doctor.bio}</p>
        <p className="fee">Fees ₹{Number(doctor.fee).toFixed(0)}</p>
        <h2>Weekly timing</h2>
        <ul className="sched">
          {doctor.schedule.map((s, i) => (
            <li key={i}><b>{DAYS[s.day_of_week]}</b> {hm(s.start_time)} – {hm(s.end_time)}</li>
          ))}
        </ul>
      </aside>

      <section>
        <h2>Date chuno</h2>
        <input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Appointment date" />

        <h2>Time chuno {slots.length > 0 && <span className="muted small">({free} slot khali)</span>}</h2>
        {slots.length === 0 ? (
          <p className="muted">Doctor is din available nahi hai. Koi aur date chuno.</p>
        ) : (
          <div className="slots">
            {slots.map((s) => (
              <button key={s.startTime} disabled={!s.available}
                className={`slot ${picked === s.startTime ? 'on' : ''}`}
                aria-pressed={picked === s.startTime}
                onClick={() => setPicked(s.startTime)}>
                {hm(s.startTime)}
              </button>
            ))}
          </div>
        )}

        {picked && (
          <div className="confirm">
            <p>{doctor.name} · {date} · <b>{hm(picked)}</b></p>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Visit ki wajah (optional)" maxLength={200} />
            <button className="btn" onClick={book} disabled={busy}>{busy ? 'Book ho raha hai…' : 'Appointment confirm karo'}</button>
          </div>
        )}
        {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'err'} role="status">{msg.text}</p>}
      </section>
    </div>
  );
}
