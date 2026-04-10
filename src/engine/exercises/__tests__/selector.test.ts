import { describe, it, expect } from 'vitest';
import { selectNextExercise, type ExerciseHistoryEntry } from '../selector';
import { ORTHOPHONIC_EXERCISES } from '../orthophonic-library';

describe('selectNextExercise', () => {
  const now = new Date('2026-04-15T12:00:00Z');

  it('sélectionne un exercice sans pré-requis pour un enfant sans historique', () => {
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history: [], now },
      ORTHOPHONIC_EXERCISES,
    );
    expect(result).not.toBeNull();
    expect(result?.trouble).toBe('dyslexie');
    expect(result?.prerequisites).toHaveLength(0);
  });

  it('respecte les pré-requis : ne propose pas un exercice bloqué', () => {
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history: [], now },
      ORTHOPHONIC_EXERCISES,
    );
    // Premier exercice proposé ne doit pas avoir de pré-requis
    expect(result?.prerequisites).toHaveLength(0);
  });

  it('débloque les exercices suivants quand les pré-requis sont satisfaits', () => {
    const history: ExerciseHistoryEntry[] = [
      {
        exerciseId: 'dys-phono-syllabes-1',
        success: true,
        completedAt: new Date('2026-04-10'),
        difficulty: 1,
      },
    ];
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history, now },
      ORTHOPHONIC_EXERCISES,
    );
    // Au minimum, dys-phono-fusion-1 doit faire partie des candidats possibles
    expect(result).not.toBeNull();
    expect(result?.trouble).toBe('dyslexie');
    // Les pré-requis de l'exercice choisi doivent être satisfaits
    for (const prereq of result?.prerequisites ?? []) {
      expect(history.some((h) => h.exerciseId === prereq && h.success)).toBe(true);
    }
  });

  it('applique le cooldown 48h après un échec', () => {
    const recentFailure: ExerciseHistoryEntry = {
      exerciseId: 'dys-phono-syllabes-1',
      success: false,
      completedAt: new Date('2026-04-14T12:00:00Z'), // 24 h avant `now`
      difficulty: 1,
    };
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history: [recentFailure], now },
      ORTHOPHONIC_EXERCISES,
    );
    // Ne doit pas reproposer le même exercice avant 48 h
    expect(result?.id).not.toBe('dys-phono-syllabes-1');
  });

  it('peut reproposer un exercice échoué après 48 h', () => {
    const oldFailure: ExerciseHistoryEntry = {
      exerciseId: 'dys-phono-syllabes-1',
      success: false,
      completedAt: new Date('2026-04-10T00:00:00Z'), // > 48h
      difficulty: 1,
    };
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history: [oldFailure], now },
      ORTHOPHONIC_EXERCISES,
    );
    expect(result).not.toBeNull();
    // Peut être dys-phono-syllabes-1 à nouveau (ou un autre)
  });

  it('renvoie null si target troubles inconnu et libraire vide', () => {
    const result = selectNextExercise(
      { targetTroubles: ['dyslexie'], history: [], now },
      [],
    );
    expect(result).toBeNull();
  });

  it('priorise un exercice dont le trouble est dans targetTroubles', () => {
    const result = selectNextExercise(
      { targetTroubles: ['dyscalculie'], history: [], now },
      ORTHOPHONIC_EXERCISES,
    );
    expect(result?.trouble).toBe('dyscalculie');
  });
});
