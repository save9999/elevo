'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ChildRow = {
  id: string;
  firstName: string;
  birthdate: string;
  parcours: 'PETITS' | 'EXPLORATEURS' | 'AVENTURIERS' | 'LYCEENS';
};

const PARCOURS_LABELS: Record<ChildRow['parcours'], { label: string; ageRange: string }> = {
  PETITS: { label: 'Petits', ageRange: '4 — 6 ans' },
  EXPLORATEURS: { label: 'Explorateurs', ageRange: '6 — 10 ans' },
  AVENTURIERS: { label: 'Aventuriers', ageRange: '10 — 14 ans' },
  LYCEENS: { label: 'Lycéens', ageRange: '14 — 18 ans' },
};

function ageOf(iso: string): number {
  const b = new Date(iso);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

export default function ParentDashboardClient({
  parentName,
  children,
}: {
  parentName: string;
  children: ChildRow[];
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(children.length === 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, birthdate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(humanizeError(data.error));
        setSubmitting(false);
        return;
      }
      setFirstName('');
      setBirthdate('');
      setShowForm(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen grain" style={{ background: 'var(--bg-base)' }}>
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-[120px]"
        style={{ background: 'var(--accent)' }}
      />

      {/* Top nav */}
      <nav
        className="relative z-30 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Mark />
            <span className="text-base font-semibold">Elevo</span>
          </Link>
          <div className="flex items-center gap-6">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {parentName}
            </p>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md border px-4 py-1.5 text-xs font-medium transition hover:border-[var(--text-secondary)]"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-6xl px-8 py-16">
        {/* Header */}
        <header className="mb-16 max-w-2xl">
          <p className="eyebrow reveal reveal-1">
            <span className="divider" />
            Espace parent
          </p>
          <h1 className="reveal reveal-2 mt-6 text-5xl font-bold tracking-tight">
            Bonjour {parentName}.
          </h1>
          <p
            className="reveal reveal-3 mt-4 text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {children.length === 0
              ? "Ajoutez un premier enfant pour commencer."
              : `Vous suivez ${children.length} ${
                  children.length === 1 ? 'enfant' : 'enfants'
                }.`}
          </p>
        </header>

        {/* Children list */}
        {children.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <p className="eyebrow">
                <span className="divider" />
                Enfants
              </p>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="text-sm font-medium transition hover:text-[var(--accent-bright)]"
                style={{ color: 'var(--accent)' }}
              >
                {showForm ? '— Annuler' : '+ Ajouter un enfant'}
              </button>
            </div>

            <div
              className="grid gap-px overflow-hidden rounded-xl border"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--border-default)',
              }}
            >
              {children.map((c, i) => {
                const age = ageOf(c.birthdate);
                const meta = PARCOURS_LABELS[c.parcours];
                return (
                  <article
                    key={c.id}
                    className="reveal group p-8 transition hover:bg-[var(--bg-elevated)]"
                    style={{
                      background: 'var(--bg-surface)',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-[80px_1fr_auto] sm:items-center">
                      <div
                        className="font-mono text-3xl font-light"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold tracking-tight">
                          {c.firstName}
                        </h3>
                        <div
                          className="mt-2 flex items-center gap-4 text-sm"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          <span>{age} ans</span>
                          <span>·</span>
                          <span>Parcours {meta.label}</span>
                          <span>·</span>
                          <span>Né·e le {new Date(c.birthdate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/onboarding?childId=${c.id}`}
                          className="rounded-md px-5 py-2.5 text-sm font-semibold transition hover:translate-y-[-1px]"
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--bg-base)',
                          }}
                        >
                          Ouvrir l&apos;espace →
                        </Link>
                        <Link
                          href={`/parent/child/${c.id}`}
                          className="text-xs transition hover:text-[var(--accent-bright)]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Voir le rapport
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Add child form */}
        {showForm && (
          <section className="mb-16">
            <p className="eyebrow mb-6">
              <span className="divider" />
              Ajouter un enfant
            </p>
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border p-8"
              style={{
                borderColor: 'var(--border-default)',
                background: 'var(--bg-surface)',
              }}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span
                    className="mb-2 block text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Prénom
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Léa"
                    className="w-full rounded-md border bg-transparent px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--accent)] focus:outline-none"
                    style={{ borderColor: 'var(--border-default)' }}
                  />
                </label>
                <label className="block">
                  <span
                    className="mb-2 block text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Date de naissance
                  </span>
                  <input
                    type="date"
                    required
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full rounded-md border bg-transparent px-4 py-3 text-base text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    style={{ borderColor: 'var(--border-default)' }}
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md px-6 py-3 text-sm font-semibold transition hover:translate-y-[-1px] disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}
                >
                  {submitting ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Le parcours sera attribué automatiquement selon l&apos;âge.
                </p>
              </div>
              {error && (
                <p
                  className="mt-4 rounded-md border px-4 py-3 text-sm"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#fca5a5',
                  }}
                >
                  {error}
                </p>
              )}
            </form>
          </section>
        )}

        {/* Empty state */}
        {children.length === 0 && !showForm && (
          <section
            className="rounded-xl border p-12 text-center"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--bg-surface)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              Aucun enfant enregistré pour le moment.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-md px-5 py-2.5 text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}
            >
              + Ajouter un premier enfant
            </button>
          </section>
        )}
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

function humanizeError(code: string | undefined): string {
  switch (code) {
    case 'invalid_firstName':
      return 'Prénom invalide (entre 1 et 50 caractères).';
    case 'missing_birthdate':
    case 'invalid_birthdate':
      return 'Date de naissance invalide.';
    case 'age_out_of_range':
      return "Elevo accompagne les enfants de 4 à 18 ans.";
    case 'unauthorized':
      return 'Session expirée. Reconnectez-vous.';
    default:
      return "Une erreur est survenue. Réessayez dans un instant.";
  }
}
