'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StarField } from '@/components/explorateurs/station/StarField';
import { Station } from '@/components/explorateurs/station/Station';
import { LumoSpeaker } from '@/components/explorateurs/lumo/LumoSpeaker';
import type { Planet } from '@/components/explorateurs/station/planets-data';

export function ExplorateurHubClient({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  const router = useRouter();

  const welcomeText = `Bienvenue à bord, ${firstName}. Choisis une planète pour commencer ton aventure.`;

  const handlePlanetSelect = (planet: Planet) => {
    // Plan 3 : vraie navigation vers la planète et ses activités.
    // Pour le Plan 2, on affiche un petit toast temporaire via router.refresh
    // ou on navigue vers une route à créer plus tard.
    console.info('[explorateurs] planet selected (placeholder)', planet.slug);
    router.push(`/explorateurs/${childId}/planet/${planet.slug}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <StarField />

      {/* Header minimal */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/parent"
          className="text-xs uppercase tracking-[0.25em] text-slate-400 transition hover:text-indigo-300"
        >
          ← Retour au centre de contrôle
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">
          Astronaute · {firstName}
        </p>
      </header>

      {/* Hub central */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-4">
        <Station onPlanetSelect={handlePlanetSelect} />
      </div>

      {/* LUMO flottante en bas à droite avec phrase d'accueil */}
      <div className="fixed bottom-6 right-6 z-30">
        <LumoSpeaker text={welcomeText} size="md" />
      </div>
    </main>
  );
}
