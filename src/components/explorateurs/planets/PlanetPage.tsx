'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { Planet } from '../station/planets-data';
import { LumoSphere } from '../lumo/LumoSphere';

export interface PlanetActivity {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

/**
 * Template commune à toutes les pages de planète.
 * Affiche le titre de la planète, un background thématique et les activités disponibles.
 */
export function PlanetPage({
  childId,
  planet,
  activities,
  bgGradient = 'from-slate-950 via-indigo-950 to-slate-950',
}: {
  childId: string;
  planet: Planet;
  activities: PlanetActivity[];
  bgGradient?: string;
}) {
  return (
    <main
      className={clsx(
        'relative min-h-screen bg-gradient-to-br text-slate-100',
        bgGradient,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_60%,white_,transparent_50%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href={`/explorateurs/${childId}`}
          className="text-xs uppercase tracking-[0.25em] text-slate-300 hover:text-white"
        >
          ← Retour à la station
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
          {planet.name} · {planet.domain}
        </p>
      </header>

      <section className="relative z-10 mx-auto mt-6 flex max-w-4xl flex-col items-center gap-4 px-6 text-center">
        <div
          className={clsx(
            'flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br text-6xl',
            planet.gradientFrom,
            planet.gradientTo,
            planet.halo,
          )}
        >
          {planet.emoji}
        </div>
        <h1 className="text-4xl font-bold">Planète {planet.name}</h1>
        <p className="max-w-xl text-slate-300">{planet.tagline}</p>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-4xl px-6 pb-20">
        <h2 className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
          Choisis une activité
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/explorateurs/${childId}/planet/${planet.slug}/activity/${a.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition hover:border-indigo-500 hover:bg-slate-900"
            >
              <div className="text-3xl">{a.emoji}</div>
              <div className="text-base font-semibold">{a.name}</div>
              <p className="text-sm leading-relaxed text-slate-400">{a.description}</p>
              <span className="mt-auto pt-3 text-xs uppercase tracking-wider text-indigo-300 opacity-0 transition group-hover:opacity-100">
                Lancer →
              </span>
            </Link>
          ))}
          {activities.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-sm text-slate-500">
              Des activités arriveront bientôt sur cette planète.
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-20">
        <LumoSphere mood="idle" size="md" />
      </div>
    </main>
  );
}
