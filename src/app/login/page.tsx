'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Email ou mot de passe incorrect.');
    } else {
      router.push('/parent');
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center grain px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: 'var(--accent)' }}
      />

      <div className="relative z-20 w-full max-w-md">
        {/* Logo + back link */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <Mark />
            <span className="text-base font-semibold">Elevo</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow">
            <span className="divider" /> Se connecter
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Bon retour parmi nous.
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Connectez-vous à votre espace parent.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span
              className="mb-2 block text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@famille.fr"
              className="w-full rounded-md border bg-transparent px-4 py-3 text-base focus:border-[var(--accent)] focus:outline-none"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
          <label className="block">
            <span
              className="mb-2 block text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Mot de passe
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border bg-transparent px-4 py-3 text-base focus:border-[var(--accent)] focus:outline-none"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          {error && (
            <p
              className="rounded-md border px-4 py-3 text-sm"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#fca5a5',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-6 py-3.5 text-sm font-semibold transition hover:translate-y-[-1px] disabled:opacity-60"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg-base)',
              boxShadow: '0 10px 30px -10px var(--accent-glow)',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--accent-bright)' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}

function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="4"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="3" fill="var(--accent)" />
    </svg>
  );
}
