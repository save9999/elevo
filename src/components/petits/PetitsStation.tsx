'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LumoSpeaker } from '../explorateurs/lumo/LumoSpeaker';
import { IllustratedPlanet, type PlanetKind } from '../cosmic/IllustratedPlanet';

const PETITS_PLANETS: Array<{
  slug: string;
  name: string;
  tagline: string;
  kind: PlanetKind;
}> = [
  { slug: 'alphabos', name: 'Lettres', tagline: 'Découvrir les lettres', kind: 'lettres' },
  { slug: 'numeris', name: 'Nombres', tagline: 'Compter et reconnaître', kind: 'nombres' },
  { slug: 'memoria', name: 'Mémoire', tagline: 'Retenir des séquences', kind: 'memoire' },
];

export function PetitsStation({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  const router = useRouter();

  return (
    <main
      className="relative min-h-screen overflow-hidden grain"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[120px]"
        style={{ background: 'var(--accent)' }}
      />

      {/* Top nav */}
      <nav
        className="relative z-30 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link
            href="/parent"
            className="flex items-center gap-2 text-sm transition hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Espace parent
          </Link>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Parcours <span style={{ color: 'var(--accent-bright)' }}>Petits</span> ·{' '}
            {firstName}
          </p>
        </div>
      </nav>

      <div className="relative z-20 mx-auto max-w-6xl px-8 py-16">
        {/* Header */}
        <header className="mb-16 max-w-2xl">
          <p className="eyebrow reveal reveal-1">
            <span className="divider" />4 — 6 ans
          </p>
          <h1 className="reveal reveal-2 mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
            Bonjour {firstName}.
          </h1>
          <p
            className="reveal reveal-3 mt-4 text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Choisis une planète pour commencer à jouer.
          </p>
        </header>

        {/* 3 planètes */}
        <section>
          <p className="eyebrow mb-6">
            <span className="divider" /> Trois planètes
          </p>
          <div
            className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-3"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'var(--border-default)',
            }}
          >
            {PETITS_PLANETS.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => router.push(`/petits/${childId}/planet/${p.slug}`)}
                className={`reveal group relative flex flex-col items-center gap-6 p-10 text-center transition hover:bg-[var(--bg-elevated)] focus:outline-none focus-visible:bg-[var(--bg-elevated)]`}
                style={{
                  background: 'var(--bg-surface)',
                  animationDelay: `${(i + 4) * 80}ms`,
                }}
                aria-label={`Planète ${p.name}`}
              >
                <div className="transition-transform group-hover:scale-105">
                  <IllustratedPlanet kind={p.kind} size={160} />
                </div>
                <div>
                  <p
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {String(i + 1).padStart(2, '0')} · Planète
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {p.tagline}
                  </p>
                </div>
                <span
                  className="text-xs font-medium opacity-0 transition group-hover:opacity-100"
                  style={{ color: 'var(--accent-bright)' }}
                >
                  Embarquer →
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* LUMO compagne en bas à droite — version personnage car contexte enfant */}
      <div className="fixed bottom-6 right-6 z-30">
        <LumoSpeaker
          text={`Bonjour ${firstName}, choisis une planète pour jouer avec moi.`}
          size="md"
        />
      </div>
    </main>
  );
}
