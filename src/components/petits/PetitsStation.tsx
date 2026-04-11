'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Station } from '../explorateurs/station/Station';
import { PLANETS, type Planet } from '../explorateurs/station/planets-data';
import { LumoSpeaker } from '../explorateurs/lumo/LumoSpeaker';

/**
 * Hub Petits — réutilise la même Station que Explorateurs.
 * On filtre sur 3 planètes : lettres, nombres, mémoire (celles qui marchent sans lecture).
 */
const PETITS_SLUGS = ['alphabos', 'numeris', 'memoria'];
const PETITS_PLANETS: Planet[] = PLANETS.filter((p) => PETITS_SLUGS.includes(p.slug));

export function PetitsStation({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  const router = useRouter();

  const handlePlanetSelect = (planet: Planet) => {
    router.push(`/petits/${childId}/planet/${planet.slug}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden sky-bg">
      <nav
        className="relative z-30 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Link
            href="/parent"
            className="flex items-center gap-2 text-sm font-medium transition hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Espace parent
          </Link>
          <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Parcours <span style={{ color: 'var(--accent)' }}>Petits</span> · {firstName}
          </p>
        </div>
      </nav>

      <header className="relative z-20 mx-auto max-w-6xl px-8 pt-12 text-center">
        <p className="eyebrow reveal reveal-1">
          <span className="divider" />4 — 6 ans
        </p>
        <h1 className="reveal reveal-2 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Bonjour{' '}
          <span className="serif-italic" style={{ color: 'var(--accent)' }}>
            {firstName}
          </span>
          .
        </h1>
        <p
          className="reveal reveal-3 mx-auto mt-3 max-w-xl text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          Choisis une planète pour commencer à jouer.
        </p>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center pt-4">
        <Station onPlanetSelect={handlePlanetSelect} planets={PETITS_PLANETS} />
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <LumoSpeaker
          text={`Bonjour ${firstName}, choisis une planète pour jouer avec moi.`}
          size="md"
        />
      </div>
    </main>
  );
}
