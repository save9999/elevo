'use client';

import { LetterMatch } from './LetterMatch';
import { SyllableFishing } from './SyllableFishing';
import { PseudoWordRead } from './PseudoWordRead';
import { WordBuilder } from './WordBuilder';
import { Subitize } from './Subitize';
import { NumberLine } from './NumberLine';
import { MentalCalc } from './MentalCalc';
import { RocketMath } from './RocketMath';
import { CopyFlash } from './CopyFlash';
import { HomophoneHunt } from './HomophoneHunt';
import { FindWord } from './FindWord';
import { MinimalPairs } from './MinimalPairs';
import { ColorMixer } from './ColorMixer';
import { SimonLumo } from './SimonLumo';
import { ImageSequence } from './ImageSequence';
import { MemoryPairs } from './MemoryPairs';
import { ShapeReproduce } from './ShapeReproduce';
import { LeftRight } from './LeftRight';
import { ConstellationConnect } from './ConstellationConnect';
import { MazeRunner } from './MazeRunner';
import { PlaceholderActivity } from './PlaceholderActivity';

/**
 * 20 mini-jeux au total.
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
    // Alphabos — 4
    case 'alphabos/letter-match':      return <LetterMatch childId={childId} />;
    case 'alphabos/syllable-fishing':  return <SyllableFishing childId={childId} />;
    case 'alphabos/pseudo-word-read':  return <PseudoWordRead childId={childId} />;
    case 'alphabos/word-builder':      return <WordBuilder childId={childId} />;

    // Numeris — 4
    case 'numeris/subitize':           return <Subitize childId={childId} />;
    case 'numeris/number-line':        return <NumberLine childId={childId} />;
    case 'numeris/mental-calc':        return <MentalCalc childId={childId} />;
    case 'numeris/rocket-math':        return <RocketMath childId={childId} />;

    // Scripta — 2
    case 'scripta/copy-flash':         return <CopyFlash childId={childId} />;
    case 'scripta/homophone-hunt':     return <HomophoneHunt childId={childId} />;

    // Verbalia — 3
    case 'verbalia/find-word':         return <FindWord childId={childId} />;
    case 'verbalia/minimal-pairs':     return <MinimalPairs childId={childId} />;
    case 'verbalia/color-mixer':       return <ColorMixer childId={childId} />;

    // Memoria — 3
    case 'memoria/simon-lumo':         return <SimonLumo childId={childId} />;
    case 'memoria/image-sequence':     return <ImageSequence childId={childId} />;
    case 'memoria/memory-pairs':       return <MemoryPairs childId={childId} />;

    // Geometra — 4
    case 'geometra/shape-reproduce':         return <ShapeReproduce childId={childId} />;
    case 'geometra/left-right':              return <LeftRight childId={childId} />;
    case 'geometra/constellation-connect':   return <ConstellationConnect childId={childId} />;
    case 'geometra/maze-runner':             return <MazeRunner childId={childId} />;

    default:
      return <PlaceholderActivity childId={childId} planetSlug={planetSlug} activitySlug={activitySlug} />;
  }
}
