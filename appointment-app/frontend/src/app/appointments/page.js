'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, hm } from '@/lib/api';

export default function MyAppointments() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/appointments/mine', { auth: true }).then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm('Ye appointment cancel karni hai?')) return;
    try { await api(`/appointments/${id}/cancel`, { method: 'PATCH', auth: true }); load(); }
    catch (e) { setError(e.message); }
  }

  if (error) return <p className="err">{error} <Link href="/login">Login karein</Link></p>;
  if (!items) return <p className="muted">Load ho raha hai…</p>;

  return (
    <>
      <h1>Meri appointments</h1>
      {items.length === 0 ? (
        <p className="muted">Abhi koi appointment nahi hai. <Link href="/">Doctor dhundo</Link></p>
      ) : (
        <ul className="list">
          {items.map((a) => (
            <li key={a.id} className={a.status}>
              <div>
                <h3>{a.doctorName}</h3>
                <p className="spec">{a.specialization}</p>
                <p>{a.date} · {hm(a.startTime)} – {hm(a.endTime)}</p>
                {a.reason && <p className="muted">{a.reason}</p>}
              </div>
              <div className="right">
                <span className={`badge ${a.status}`}>{a.status}</span>
                {a.status === 'booked' && <button className="btn ghost small" onClick={() => cancel(a.id)}>Cancel karo</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
