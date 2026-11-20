'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  return (
    <header className="nav">
      <Link href="/" className="brand">Clinic<span>Slot</span></Link>
      <nav>
        {ready && user ? (
          <>
            <Link href="/appointments">Meri appointments</Link>
            <button className="link" onClick={logout}>Logout ({user.name.split(' ')[0]})</button>
          </>
        ) : (
          ready && (<><Link href="/login">Login</Link><Link href="/register" className="btn small">Sign up</Link></>)
        )}
      </nav>
    </header>
  );
}
