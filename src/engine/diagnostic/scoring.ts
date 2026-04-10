import type { Band, ErrorTaxonomy } from './types';

export interface RawScore {
  correct: number;
  total: number;
  durationMs: number;
  errors: ErrorTaxonomy[];
}

export interface NormedScore {
  percentile: number;
  standardDeviation: number;
  classReference: string;
  band: Band;
  source: string;
}

/**
 * Classifie une précision brute en 3 bandes.
 * Règle provisoire du MVP : 0..0.5 = preoccupant, 0.5..0.75 = attention, >= 0.75 = normal.
 * À remplacer par une classification adossée aux normes par protocole dans les plans ultérieurs.
 */
export function computeBand(raw: RawScore): Band {
  if (raw.total <= 0) {
    throw new Error('total must be > 0');
  }
  const accuracy = raw.correct / raw.total;
  if (accuracy < 0.5) return 'preoccupant';
  if (accuracy < 0.75) return 'attention';
  return 'normal';
}
