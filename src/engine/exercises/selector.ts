import type { Exercise, Trouble } from './types';
import { ORTHOPHONIC_EXERCISES } from './orthophonic-library';

/**
 * Historique simplifié d'un exercice joué.
 */
export interface ExerciseHistoryEntry {
  exerciseId: string;
  success: boolean;
  completedAt: Date;
  difficulty: number;
}

export interface SelectContext {
  /** Troubles suspectés / confirmés pour l'enfant. Filtre sur ces troubles en priorité. */
  targetTroubles: Trouble[];
  history: ExerciseHistoryEntry[];
  /** Date de référence pour le cooldown. Défaut : now. */
  now?: Date;
}

/**
 * Constante nommée : zone proximale de développement ~75 % de réussite.
 * Source : Wilson et al. 2019 — cf. commentaire du spec §7.2.
 */
export const IDEAL_SUCCESS_RATE = 0.75;

const COOLDOWN_AFTER_FAILURE_MS = 48 * 60 * 60 * 1000; // 48 h — consolidation mnésique

/**
 * Sélectionne le prochain exercice à proposer à l'enfant.
 *
 * Algorithme (cf. spec §7.2) :
 *   1. Filtrer les exercices dont le trouble est dans `targetTroubles`
 *   2. Exclure ceux en cooldown après un échec récent
 *   3. Exclure ceux qui ont été maîtrisés 3 fois de suite au max de difficulté
 *   4. Garder uniquement les exercices dont les pré-requis sont satisfaits
 *   5. Pondérer par "écart au taux de succès idéal (75 %)"
 *   6. Retourner le meilleur
 *
 * Retourne null si aucun exercice ne peut être proposé.
 */
export function selectNextExercise(
  ctx: SelectContext,
  library: Exercise[] = ORTHOPHONIC_EXERCISES,
): Exercise | null {
  const now = ctx.now ?? new Date();

  // 1. Filtrage trouble
  const troubleSet = new Set(ctx.targetTroubles);
  let pool = library.filter((e) => troubleSet.has(e.trouble));
  if (pool.length === 0) {
    // Si aucun trouble ciblé, on prend toute la librairie
    pool = [...library];
  }

  // 2. Cooldown après échec
  pool = pool.filter((e) => {
    const lastFailure = ctx.history
      .filter((h) => h.exerciseId === e.id && !h.success)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
    if (!lastFailure) return true;
    return now.getTime() - lastFailure.completedAt.getTime() >= COOLDOWN_AFTER_FAILURE_MS;
  });

  // 3. Exclusion des exercices maîtrisés (3 succès consécutifs au max de difficulté)
  pool = pool.filter((e) => {
    if (e.difficulty < 5) return true;
    const recent = ctx.history
      .filter((h) => h.exerciseId === e.id)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 3);
    if (recent.length < 3) return true;
    return !recent.every((h) => h.success);
  });

  // 4. Pré-requis satisfaits
  const completedIds = new Set(
    ctx.history.filter((h) => h.success).map((h) => h.exerciseId),
  );
  pool = pool.filter((e) => e.prerequisites.every((p) => completedIds.has(p)));

  if (pool.length === 0) return null;

  // 5. Pondération par écart au taux idéal
  const scored = pool.map((e) => ({
    exercise: e,
    score: scoreExercise(e, ctx.history),
  }));
  scored.sort((a, b) => b.score - a.score);

  return scored[0].exercise;
}

/**
 * Score d'un exercice par rapport au profil de l'enfant.
 * Plus le taux de réussite de l'enfant sur cet exercice est proche de 75%,
 * plus il est prioritaire (on reste dans la zone proximale de développement).
 * Les exercices jamais tentés obtiennent un score intermédiaire.
 */
function scoreExercise(exercise: Exercise, history: ExerciseHistoryEntry[]): number {
  const attempts = history.filter((h) => h.exerciseId === exercise.id);
  if (attempts.length === 0) {
    // Jamais tenté : score neutre mais bonus à la découverte
    return 0.5;
  }
  const successes = attempts.filter((a) => a.success).length;
  const rate = successes / attempts.length;
  // Score = 1 - |rate - 0.75| (plus c'est proche, plus le score est haut)
  return 1 - Math.abs(rate - IDEAL_SUCCESS_RATE);
}
