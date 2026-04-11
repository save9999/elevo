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
    <main className="relative min-h-screen overflow-hidden sky-bg">
      {/* Nav */}
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
            Parcours{' '}
            <span style={{ color: 'var(--accent)' }}>Explorateurs</span> · {firstName}
          </p>
        </div>
      </nav>

      <header className="relative z-20 mx-auto max-w-6xl px-8 pt-12 text-center">
        <p className="eyebrow reveal reveal-1">
          <span className="divider" />6 — 10 ans
        </p>
        <h1 className="reveal reveal-2 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Bienvenue dans la Station,{' '}
          <span className="serif-italic" style={{ color: 'var(--accent)' }}>
            {firstName}
          </span>
          .
        </h1>
        <p
          className="reveal reveal-3 mx-auto mt-3 max-w-xl text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          Six planètes à explorer. Choisis-en une, ou clique sur LUMO pour le Cabinet.
        </p>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center pt-4">
        <Station
          onPlanetSelect={handlePlanetSelect}
          cabinetHref={`/explorateurs/${childId}/cabinet`}
        />
      </div>
    </main>
  );
}
