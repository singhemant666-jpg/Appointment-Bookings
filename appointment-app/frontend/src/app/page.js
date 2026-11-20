'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, DAYS, hm } from '@/lib/api';

function Schedule({ schedule }) {
  if (!schedule.length) return <p className="muted">Timing available nahi hai</p>;
  return (
    <ul className="sched">
      {schedule.map((s, i) => (
        <li key={i}><b>{DAYS[s.day_of_week]}</b> {hm(s.start_time)} – {hm(s.end_time)}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [search, setSearch] = useState('');
  const [specId, setSpecId] = useState('');
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState('');
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (specId) q.set('specializationId', specId);
      setDoctors(await api(`/doctors?${q}`));
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [search, specId]);

  useEffect(() => { api('/specializations').then(setSpecs).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function askAi(e) {
    e.preventDefault();
    setAiBusy(true); setAi(null);
    try {
      const r = await api('/ai/suggest', { method: 'POST', body: { symptoms } });
      setAi(r);
      if (r.specializationId) setSpecId(String(r.specializationId));
    } catch (err) { setAi({ error: err.message }); }
    setAiBusy(false);
  }

  return (
    <>
      <section className="hero">
        <h1>Doctor ka time dekho, slot pakdo.</h1>
        <p>Sab doctors ke weekly timing ek jagah. Jo slot khali hai, usi ko book kar sakte ho.</p>
        <form className="aibox" onSubmit={askAi}>
          <label htmlFor="sym">Kaunsa doctor chahiye pata nahi? Apni problem likho</label>
          <div className="row">
            <input id="sym" value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
              placeholder="jaise: 3 din se bukhar aur gale me dard" />
            <button className="btn" disabled={aiBusy || symptoms.trim().length < 3}>
              {aiBusy ? 'Soch raha hu…' : 'Doctor suggest karo'}
            </button>
          </div>
          {ai && (
            <div className={`aires ${ai.emergency ? 'danger' : ''}`} role="status">
              {ai.error ? ai.error : (
                <>
                  {ai.emergency && <b>Ye emergency ho sakti hai. Turant najdiki hospital jaiye. </b>}
                  Aapko <b>{ai.specialization}</b> se milna chahiye. {ai.reason}
                </>
              )}
            </div>
          )}
          <p className="muted small">Ye sirf doctor chunne me madad hai, diagnosis nahi.</p>
        </form>
      </section>

      <section>
        <div className="filters">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Doctor ya specialty search karo" aria-label="Search doctors" />
          <select value={specId} onChange={(e) => setSpecId(e.target.value)} aria-label="Specialization">
            <option value="">Saari specialties</option>
            {specs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {error && <p className="err">{error}</p>}
        {loading ? <p className="muted">Doctors load ho rahe hain…</p> : doctors.length === 0 ? (
          <p className="muted">Koi doctor nahi mila. Search ya filter badal ke dekho.</p>
        ) : (
          <div className="grid">
            {doctors.map((d) => (
              <article key={d.id} className="doc">
                <div className="avatar" aria-hidden>{d.name.replace('Dr. ', '').charAt(0)}</div>
                <h3>{d.name}</h3>
                <p className="spec">{d.specialization} · {d.experience_years} saal ka anubhav</p>
                <Schedule schedule={d.schedule} />
                <div className="foot">
                  <span className="fee">₹{Number(d.fee).toFixed(0)}</span>
                  <Link className="btn small" href={`/doctors/${d.id}`}>Slot dekho</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
