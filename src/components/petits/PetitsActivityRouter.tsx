'use client';

import { LetterMatch } from '../explorateurs/games/LetterMatch';
import { Subitize } from '../explorateurs/games/Subitize';
import { RocketMath } from '../explorateurs/games/RocketMath';
import { SimonLumo } from '../explorateurs/games/SimonLumo';
import { MemoryPairs } from '../explorateurs/games/MemoryPairs';
import { PlaceholderActivity } from '../explorateurs/games/PlaceholderActivity';

/**
 * Route les activités Petits vers les bons composants de jeu.
 * Le GameShell détecte le parcours depuis l'URL, donc les retours pointent
 * correctement vers /petits/... (plus de bug onboarding).
 */
export function PetitsActivityRouter({
  childId,
  planetSlug,
  activitySlug,
}: {
  childId: string;
  planetSlug: string;
  activitySlug: string;
}) {
  const key = `${planetSlug}/${activitySlug}`;

  switch (key) {
    case 'alphabos/letter-match':
      return <LetterMatch childId={childId} />;
    case 'numeris/subitize':
      return <Subitize childId={childId} />;
    case 'numeris/rocket-math':
      return <RocketMath childId={childId} />;
    case 'memoria/simon-lumo':
      return <SimonLumo childId={childId} />;
    case 'memoria/memory-pairs':
      return <MemoryPairs childId={childId} />;
    default:
      return (
        <PlaceholderActivity
          childId={childId}
          planetSlug={planetSlug}
          activitySlug={activitySlug}
        />
      );
  }
}
