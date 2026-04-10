import { describe, it, expect } from 'vitest';
import { computeBand, type RawScore } from '../scoring';

describe('computeBand', () => {
  it('classifie "normal" quand la précision est ≥ 0.75', () => {
    const raw: RawScore = { correct: 80, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('normal');
  });

  it('classifie "attention" quand la précision est entre 0.50 et 0.75', () => {
    const raw: RawScore = { correct: 60, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('attention');
  });

  it('classifie "preoccupant" quand la précision est < 0.50', () => {
    const raw: RawScore = { correct: 30, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('preoccupant');
  });

  it('lève une erreur si total est 0', () => {
    const raw: RawScore = { correct: 0, total: 0, durationMs: 0, errors: [] };
    expect(() => computeBand(raw)).toThrow('total must be > 0');
  });
});
