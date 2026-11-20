'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

export default function RegisterPage() {
  const { saveSession } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      saveSession(await api('/auth/register', { method: 'POST', body: f }));
      window.location.href = '/';
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>Sign up</h1>
      <label>Naam<input required value={f.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
      <label>Password (min 6 character)<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>Account banao</button>
      <p className="muted">Account hai? <Link href="/login">Login karo</Link></p>
    </form>
  );
}
