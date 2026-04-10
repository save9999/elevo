import { describe, it, expect } from 'vitest';
import { scoreProtocol, isAnswerCorrect } from '../protocol-scoring';
import { alouetteProtocol } from '../protocols/alouette';
import { odedysDicteeProtocol } from '../protocols/odedys-dictee';
import type { ProtocolAnswer } from '../protocols/types';

describe('isAnswerCorrect', () => {
  it('compare les MCQ par index', () => {
    const item = alouetteProtocol.items[0];
    expect(isAnswerCorrect(item, mkAnswer(item.id, 0))).toBe(true);
    expect(isAnswerCorrect(item, mkAnswer(item.id, 1))).toBe(false);
  });

  it('compare les dictées en ignorant la casse et les accents', () => {
    const item = odedysDicteeProtocol.items[0]; // ÉCOLE → correct "école"
    expect(isAnswerCorrect(item, mkAnswer(item.id, 'école'))).toBe(true);
    expect(isAnswerCorrect(item, mkAnswer(item.id, 'ÉCOLE'))).toBe(true);
    expect(isAnswerCorrect(item, mkAnswer(item.id, 'ecole'))).toBe(true);
    expect(isAnswerCorrect(item, mkAnswer(item.id, ' École '))).toBe(true);
    expect(isAnswerCorrect(item, mkAnswer(item.id, 'escole'))).toBe(false);
  });
});

describe('scoreProtocol', () => {
  it('renvoie band "normal" pour un score parfait', () => {
    const answers: ProtocolAnswer[] = alouetteProtocol.items.map((item) =>
      mkAnswer(item.id, item.correct as number, 2000),
    );
    const result = scoreProtocol(alouetteProtocol, answers);
    expect(result.rawScore.correct).toBe(alouetteProtocol.items.length);
    expect(result.band).toBe('normal');
    expect(result.accuracy).toBe(1);
    expect(result.failedItemIds).toHaveLength(0);
    expect(result.interpretation).toContain('100%');
  });

  it('renvoie band "preoccupant" quand l\'enfant rate presque tout', () => {
    const answers: ProtocolAnswer[] = alouetteProtocol.items.map((item) =>
      mkAnswer(item.id, 3, 2000), // toujours le dernier choix (faux)
    );
    const result = scoreProtocol(alouetteProtocol, answers);
    // Précision attendue : quand correct=0, band = preoccupant
    expect(result.band).toBe('preoccupant');
    expect(result.interpretation).toContain('orthophoniste');
    expect(result.failedItemIds.length).toBe(alouetteProtocol.items.length);
  });

  it('considère un item sans réponse comme raté', () => {
    const answers: ProtocolAnswer[] = []; // aucune réponse
    const result = scoreProtocol(alouetteProtocol, answers);
    expect(result.rawScore.correct).toBe(0);
    expect(result.failedItemIds.length).toBe(alouetteProtocol.items.length);
  });

  it('cumule la durée de toutes les réponses', () => {
    const answers: ProtocolAnswer[] = alouetteProtocol.items.map((item, i) =>
      mkAnswer(item.id, item.correct as number, (i + 1) * 1000),
    );
    const result = scoreProtocol(alouetteProtocol, answers);
    const expectedDuration = alouetteProtocol.items
      .map((_, i) => (i + 1) * 1000)
      .reduce((a, b) => a + b, 0);
    expect(result.totalDurationMs).toBe(expectedDuration);
  });
});

function mkAnswer(
  itemId: string,
  value: string | number,
  durationMs = 1000,
): ProtocolAnswer {
  return { itemId, value, durationMs };
}
