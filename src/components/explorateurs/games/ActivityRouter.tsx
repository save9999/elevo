'use client';

import { LetterMatch } from './LetterMatch';
import { SyllableFishing } from './SyllableFishing';
import { PseudoWordRead } from './PseudoWordRead';
import { Subitize } from './Subitize';
import { SimonLumo } from './SimonLumo';
import { PlaceholderActivity } from './PlaceholderActivity';

/**
 * Route l'activité demandée vers le bon composant de jeu.
 *
 * Pour le MVP, certaines activités n'ont pas encore d'implémentation dédiée
 * et retombent sur `<PlaceholderActivity>` (message "Bientôt disponible").
 */
export function ActivityRouter({
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
    case 'alphabos/syllable-fishing':
      return <SyllableFishing childId={childId} />;
    case 'alphabos/pseudo-word-read':
      return <PseudoWordRead childId={childId} />;
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
