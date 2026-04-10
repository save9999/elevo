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

const PARCOURS_LABELS: Record<ChildRow['parcours'], string> = {
  PETITS: 'Les Petits',
  EXPLORATEURS: 'Les Explorateurs',
  AVENTURIERS: 'Les Aventuriers',
  LYCEENS: 'Les Lycéens',
};

const PARCOURS_EMOJI: Record<ChildRow['parcours'], string> = {
  PETITS: '🏡',
  EXPLORATEURS: '🛸',
  AVENTURIERS: '🎒',
  LYCEENS: '📓',
};

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
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

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
      startTransition(() => router.refresh());
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_60%,white_,transparent_50%),radial-gradient(1px_1px_at_40%_80%,white_,transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">
              Centre de contrôle parent
            </p>
            <h1 className="mt-2 text-3xl font-bold">Bonjour {parentName} 👋</h1>
            <p className="mt-2 text-slate-400">
              Ajoute tes enfants et embarque-les à bord de la Station Elevo.
            </p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:bg-slate-900/60"
            >
              Se déconnecter
            </button>
          </form>
        </header>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Tes astronautes
          </h2>

          {children.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
              <p className="text-slate-400">
                Aucun enfant enregistré pour le moment. Ajoute-en un ci-dessous pour
                l&apos;embarquer dans la Station.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {children.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>{PARCOURS_EMOJI[c.parcours]}</span>
                        <span>{c.firstName}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {PARCOURS_LABELS[c.parcours]} ·{' '}
                        {new Date(c.birthdate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/onboarding?childId=${c.id}`}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
                  >
                    Entrer dans la Station →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Ajouter un enfant
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur sm:flex-row sm:items-end"
          >
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-slate-400">Prénom</span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Léa"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-slate-400">Date de naissance</span>
              <input
                type="date"
                required
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || isPending}
              className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>
          {error && (
            <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
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
      return 'Session expirée. Reconnecte-toi.';
    default:
      return "Une erreur est survenue. Réessaie dans un instant.";
  }
}
