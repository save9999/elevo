'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Station } from '@/components/explorateurs/station/Station';
import type { Planet } from '@/components/explorateurs/station/planets-data';

export function ExplorateurHubClient({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  const router = useRouter();

  const handlePlanetSelect = (planet: Planet) => {
    router.push(`/explorateurs/${childId}/planet/${planet.slug}`);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden grain"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[700px] w-[700px] rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full opacity-[0.04] blur-[140px]"
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
            Parcours{' '}
            <span style={{ color: 'var(--accent-bright)' }}>Explorateurs</span> ·{' '}
            {firstName}
          </p>
        </div>
      </nav>

      {/* Header */}
      <header className="relative z-20 mx-auto max-w-6xl px-8 pt-12">
        <p className="eyebrow reveal reveal-1">
          <span className="divider" />6 — 10 ans
        </p>
        <h1 className="reveal reveal-2 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Bienvenue dans la Station, {firstName}.
        </h1>
        <p
          className="reveal reveal-3 mt-3 text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          Six planètes à explorer. Choisis-en une, ou clique sur LUMO pour le Cabinet.
        </p>
      </header>

      {/* Hub */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-4">
        <Station
          onPlanetSelect={handlePlanetSelect}
          cabinetHref={`/explorateurs/${childId}/cabinet`}
        />
      </div>
    </main>
  );
}
