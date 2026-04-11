'use client';

import Link from 'next/link';
import { PLANET_ACTIVITIES } from '../explorateurs/planets/planet-activities';
import { PLANETS, type PlanetSlug } from '../explorateurs/station/planets-data';
import { IllustratedPlanet, type PlanetKind } from '../cosmic/IllustratedPlanet';
import { LumoSphere } from '../explorateurs/lumo/LumoSphere';

const PLANET_KINDS: Record<string, PlanetKind> = {
  alphabos: 'lettres',
  numeris: 'nombres',
  scripta: 'ecriture',
  verbalia: 'langage',
  memoria: 'memoire',
  geometra: 'espace',
};

export function LyceensModulePage({
  childId,
  moduleSlug,
}: {
  childId: string;
  moduleSlug: string;
}) {
  const planet = PLANETS.find((p) => p.slug === (moduleSlug as PlanetSlug));
  const activities = PLANET_ACTIVITIES[moduleSlug as keyof typeof PLANET_ACTIVITIES] ?? [];

  if (!planet) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center sky-bg p-8">
        <p style={{ color: 'var(--text-secondary)' }}>Module introuvable.</p>
        <Link href={`/lyceens/${childId}`} className="mt-4 underline" style={{ color: 'var(--accent)' }}>
          ← Retour
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen sky-bg">
      <nav
        className="relative z-30 border-b"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
          <Link
            href={`/lyceens/${childId}`}
            className="flex items-center gap-2 text-sm font-medium transition hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Retour à la Station
          </Link>
          <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Module <span style={{ color: 'var(--accent)' }}>{planet.name}</span>
          </p>
        </div>
      </nav>

      <header className="relative z-20 mx-auto mt-8 flex max-w-5xl flex-col items-center gap-5 px-8 text-center">
        <IllustratedPlanet kind={PLANET_KINDS[moduleSlug]} size={140} />
        <div>
          <p className="eyebrow">
            <span className="divider" /> {planet.domain}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {planet.name}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base" style={{ color: 'var(--text-secondary)' }}>
            {planet.tagline}
          </p>
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-12 max-w-5xl px-8 pb-24">
        <p className="eyebrow mb-6">
          <span className="divider" /> Exercices
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.length === 0 ? (
            <div
              className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-tertiary)',
              }}
            >
              Aucun exercice disponible pour ce module.
            </div>
          ) : (
            activities.map((a) => (
              <Link
                key={a.slug}
                href={`/lyceens/${childId}/module/${moduleSlug}/exercice/${a.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border p-6 transition hover:translate-y-[-2px] hover:border-[var(--accent)]"
                style={{
                  borderColor: 'var(--border-default)',
                  background: 'var(--bg-surface)',
                  boxShadow: '0 4px 12px -4px rgba(11, 25, 48, 0.04)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ background: 'var(--accent-pale)' }}
                >
                  {a.emoji}
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {a.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {a.description}
                  </p>
                </div>
                <span
                  className="mt-auto pt-2 text-xs font-semibold opacity-0 transition group-hover:opacity-100"
                  style={{ color: 'var(--accent)' }}
                >
                  Commencer →
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-20">
        <LumoSphere mood="idle" size="md" />
      </div>
    </main>
  );
}
