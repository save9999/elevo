'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Station } from '@/components/explorateurs/station/Station';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
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
    <main className="relative min-h-screen overflow-hidden grain">
      <CosmicBackground variant="default" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link
          href="/parent"
          className="rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition hover:border-[var(--gold)]"
          style={{
            borderColor: 'var(--ink-500)',
            color: 'var(--paper-muted)',
          }}
        >
          ← Centre de contrôle
        </Link>
        <p className="eyebrow">
          Astronaute <span className="deco-rule" /> {firstName}
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
