'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LumoSpeaker } from '../explorateurs/lumo/LumoSpeaker';
import { CosmicBackground } from '../cosmic/CosmicBackground';
import { IllustratedPlanet, type PlanetKind } from '../cosmic/IllustratedPlanet';

const PETITS_PLANETS: Array<{
  slug: string;
  name: string;
  tagline: string;
  kind: PlanetKind;
  accent: string;
}> = [
  {
    slug: 'alphabos',
    name: 'Lettres',
    tagline: 'Apprends les lettres avec moi',
    kind: 'lettres',
    accent: 'var(--cyan)',
  },
  {
    slug: 'numeris',
    name: 'Nombres',
    tagline: 'Compte et joue avec les chiffres',
    kind: 'nombres',
    accent: 'var(--gold)',
  },
  {
    slug: 'memoria',
    name: 'Mémoire',
    tagline: 'Retiens les couleurs et les formes',
    kind: 'memoire',
    accent: 'var(--magenta)',
  },
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
    <main className="relative min-h-screen overflow-hidden grain">
      <CosmicBackground variant="warm" />

      {/* Top bar */}
      <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
        <Link
          href="/parent"
          className="flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition hover:border-[var(--gold)]"
          style={{ borderColor: 'var(--ink-500)', color: 'var(--paper-muted)' }}
        >
          ← Espace parent
        </Link>
        <div
          className="rounded-full px-5 py-3 text-sm"
          style={{
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: 'var(--gold-bright)',
          }}
        >
          ✦ Bonjour {firstName}
        </div>
      </header>

      {/* LUMO + intro */}
      <section className="relative z-20 mx-auto max-w-6xl px-8 pt-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="reveal reveal-1">
            <LumoSpeaker
              text={`Bonjour ${firstName} ! Choisis une planète pour jouer avec moi.`}
              size="xl"
            />
          </div>
          <p className="eyebrow reveal reveal-2">
            <span className="deco-rule" /> Trois planètes à explorer
          </p>
          <h1
            className="reveal reveal-3 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]"
            style={{ color: 'var(--paper)' }}
          >
            <span className="block">Quelle planète</span>
            <span
              className="block italic"
              style={{
                background:
                  'linear-gradient(120deg, var(--gold) 20%, var(--magenta) 70%, var(--cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              veux-tu visiter ?
            </span>
          </h1>
        </div>
      </section>

      {/* 3 planètes en grille */}
      <section className="relative z-10 mx-auto mt-16 max-w-6xl px-8 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          {PETITS_PLANETS.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => router.push(`/petits/${childId}/planet/${p.slug}`)}
              className={`reveal reveal-${i + 4} group relative flex flex-col items-center gap-4 rounded-3xl border p-8 transition hover:translate-y-[-6px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]`}
              style={{
                borderColor: 'var(--ink-700)',
                background:
                  'linear-gradient(180deg, rgba(28,33,72,0.6) 0%, rgba(10,14,39,0.4) 100%)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label={`Planète ${p.name}`}
            >
              {/* Glow background */}
              <div
                className="absolute -top-8 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-40 blur-3xl transition group-hover:opacity-70"
                style={{ background: p.accent }}
              />

              <div className="relative">
                <IllustratedPlanet kind={p.kind} size={180} />
              </div>
              <div className="mt-2 text-center">
                <h3
                  className="editorial-italic text-3xl"
                  style={{ color: 'var(--paper)' }}
                >
                  {p.name}
                </h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--paper-muted)' }}>
                  {p.tagline}
                </p>
              </div>

              <span
                className="mt-2 text-xs uppercase tracking-[0.2em] opacity-0 transition group-hover:opacity-100"
                style={{ color: p.accent }}
              >
                Embarquer →
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
