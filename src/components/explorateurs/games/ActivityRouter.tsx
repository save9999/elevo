'use client';

import { LetterMatch } from './LetterMatch';
import { SyllableFishing } from './SyllableFishing';
import { PseudoWordRead } from './PseudoWordRead';
import { Subitize } from './Subitize';
import { NumberLine } from './NumberLine';
import { MentalCalc } from './MentalCalc';
import { CopyFlash } from './CopyFlash';
import { HomophoneHunt } from './HomophoneHunt';
import { FindWord } from './FindWord';
import { MinimalPairs } from './MinimalPairs';
import { SimonLumo } from './SimonLumo';
import { ImageSequence } from './ImageSequence';
import { ShapeReproduce } from './ShapeReproduce';
import { LeftRight } from './LeftRight';
import { PlaceholderActivity } from './PlaceholderActivity';

/**
 * Route l'activité demandée vers le bon composant de jeu.
 *
 * 14 mini-jeux implémentés pour Explorateurs, couvrant les 6 planètes.
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
    // Alphabos — 3 activités
    case 'alphabos/letter-match':
      return <LetterMatch childId={childId} />;
    case 'alphabos/syllable-fishing':
      return <SyllableFishing childId={childId} />;
    case 'alphabos/pseudo-word-read':
      return <PseudoWordRead childId={childId} />;

    // Numeris — 3 activités
    case 'numeris/subitize':
      return <Subitize childId={childId} />;
    case 'numeris/number-line':
      return <NumberLine childId={childId} />;
    case 'numeris/mental-calc':
      return <MentalCalc childId={childId} />;

    // Scripta — 2 activités
    case 'scripta/copy-flash':
      return <CopyFlash childId={childId} />;
    case 'scripta/homophone-hunt':
      return <HomophoneHunt childId={childId} />;

    // Verbalia — 2 activités
    case 'verbalia/find-word':
      return <FindWord childId={childId} />;
    case 'verbalia/minimal-pairs':
      return <MinimalPairs childId={childId} />;

    // Memoria — 2 activités
    case 'memoria/simon-lumo':
      return <SimonLumo childId={childId} />;
    case 'memoria/image-sequence':
      return <ImageSequence childId={childId} />;

    // Geometra — 2 activités
    case 'geometra/shape-reproduce':
      return <ShapeReproduce childId={childId} />;
    case 'geometra/left-right':
      return <LeftRight childId={childId} />;

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
