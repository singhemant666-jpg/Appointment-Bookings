'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { saveSession } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      saveSession(await api('/auth/login', { method: 'POST', body: f }));
      window.location.href = '/';
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>Login</h1>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Password<input type="password" required value={f.password} onChange={set('password')} /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>Login karo</button>
      <p className="muted">Account nahi hai? <Link href="/register">Sign up karo</Link></p>
    </form>
  );
}
