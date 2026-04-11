'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { PLANET_ACTIVITIES } from '../explorateurs/planets/planet-activities';

const CHAPITRE_META: Record<string, { title: string; subtitle: string; accent: string }> = {
  alphabos: { title: 'I. Lecture & décodage', subtitle: 'Entraîne ta fluence et ta précision de lecture.', accent: 'from-amber-700/40 to-amber-900/60' },
  scripta: { title: 'II. Orthographe', subtitle: "Muscle ton orthographe lexicale et grammaticale.", accent: 'from-emerald-700/40 to-emerald-900/60' },
  numeris: { title: 'III. Mathématiques', subtitle: 'Consolide ton calcul mental et ton sens du nombre.', accent: 'from-orange-700/40 to-orange-900/60' },
  verbalia: { title: 'IV. Langage & vocabulaire', subtitle: 'Affine ton lexique et ta discrimination fine.', accent: 'from-rose-700/40 to-rose-900/60' },
  memoria: { title: 'V. Attention & mémoire', subtitle: 'Entraîne ta mémoire de travail et ton attention.', accent: 'from-violet-700/40 to-violet-900/60' },
  geometra: { title: 'VI. Espace & géométrie', subtitle: 'Travaille ton repérage et ta visuo-spatialité.', accent: 'from-cyan-700/40 to-cyan-900/60' },
};

export function AventuriersChapitrePage({
  childId,
  chapitreSlug,
}: {
  childId: string;
  chapitreSlug: string;
}) {
  const meta = CHAPITRE_META[chapitreSlug];
  const activities = PLANET_ACTIVITIES[chapitreSlug as keyof typeof PLANET_ACTIVITIES] ?? [];

  if (!meta) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-8">
        <p>Chapitre introuvable.</p>
        <Link href={`/aventuriers/${childId}`} className="mt-4 underline">← Retour</Link>
      </main>
    );
  }

  return (
    <main className={clsx('relative min-h-screen bg-gradient-to-br text-stone-100', meta.accent, 'via-stone-950')}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        <Link
          href={`/aventuriers/${childId}`}
          className="text-xs uppercase tracking-[0.25em] text-amber-200/70 hover:text-amber-100"
        >
          ← Carnet de bord
        </Link>

        <header className="mt-6 mb-10 border-b border-stone-800 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Chapitre</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold italic">{meta.title}</h1>
          <p className="mt-2 text-stone-300">{meta.subtitle}</p>
        </header>

        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-stone-400">
            Missions disponibles
          </h2>
          {activities.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-700 p-6 text-sm text-stone-500">
              Aucune mission pour l&apos;instant dans ce chapitre.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activities.map((a) => (
                <Link
                  key={a.slug}
                  href={`/aventuriers/${childId}/chapitre/${chapitreSlug}/mission/${a.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-stone-700 bg-stone-900/50 p-4 transition hover:border-amber-500/50 hover:bg-stone-900"
                >
                  <div className="text-2xl">{a.emoji}</div>
                  <div className="flex-1">
                    <p className="text-base font-semibold">{a.name}</p>
                    <p className="text-xs text-stone-400">{a.description}</p>
                  </div>
                  <span className="text-xs text-amber-300/70 opacity-0 transition group-hover:opacity-100">
                    Lancer →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
