'use client';

import { LetterMatch } from '../explorateurs/games/LetterMatch';
import { Subitize } from '../explorateurs/games/Subitize';
import { SimonLumo } from '../explorateurs/games/SimonLumo';
import { PlaceholderActivity } from '../explorateurs/games/PlaceholderActivity';

/**
 * Route les activités Petits vers les bons composants de jeu.
 *
 * On réutilise les mini-jeux déjà écrits pour Explorateurs — ils fonctionnent
 * visuellement pour 4-6 ans. Les parcours continueront d'accumuler leurs
 * propres jeux spécifiques dans des itérations futures.
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
    case 'memoria/simon-lumo':
      return <SimonLumo childId={childId} />;
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
