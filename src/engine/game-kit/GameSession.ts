/**
 * GameSession — squelette commun à tous les mini-jeux.
 *
 * Un mini-jeu émet des "observations" (signaux d'apprentissage) et un score final.
 * Ce module est pur : il ne parle ni à React ni à la DB. L'intégration se fait
 * via un `ObservationCollector` injecté.
 */

import type { ObservationDomain, ObservationInput } from '../observation/collector';

export interface GameConfig {
  activitySlug: string;
  planetSlug: string;
  /** Domaine d'observation par défaut pour les signaux non-annotés. */
  defaultDomain: ObservationDomain;
}

export interface GameEvent {
  /** Identifiant logique de l'événement ('answer_correct', 'answer_wrong', 'hesitation', ...). */
  kind: string;
  /** Signal d'observation à logguer (optionnel). */
  signal?: string;
  /** Domaine à annoter (override le defaultDomain du config). */
  domain?: ObservationDomain;
  /** Poids du signal (0..1). */
  weight?: number;
  /** Contexte libre. */
  context?: Record<string, unknown>;
}

export interface GameSessionState {
  startedAt: Date;
  endedAt: Date | null;
  events: GameEvent[];
  correct: number;
  wrong: number;
  score: number;
}

/**
 * Crée une session de jeu en mémoire. Retourne des fonctions pour enregistrer
 * des événements et terminer le jeu. N'écrit jamais en DB directement.
 */
export function createGameSession(config: GameConfig) {
  const state: GameSessionState = {
    startedAt: new Date(),
    endedAt: null,
    events: [],
    correct: 0,
    wrong: 0,
    score: 0,
  };

  function recordEvent(event: GameEvent): void {
    state.events.push(event);
    if (event.kind === 'answer_correct') state.correct += 1;
    if (event.kind === 'answer_wrong') state.wrong += 1;
  }

  function finish(finalScore?: number): GameSessionState {
    state.endedAt = new Date();
    state.score = finalScore ?? computeDefaultScore(state);
    return { ...state };
  }

  /**
   * Convertit les événements du jeu en observations à envoyer au collecteur.
   * Seuls les événements avec un `signal` sont convertis.
   */
  function toObservations(childId: string, sessionId?: string): ObservationInput[] {
    return state.events
      .filter((e) => e.signal)
      .map((e) => ({
        childId,
        sessionId,
        domain: e.domain ?? config.defaultDomain,
        signal: e.signal as string,
        weight: e.weight ?? 0.5,
        context: e.context,
      }));
  }

  return { state, recordEvent, finish, toObservations };
}

function computeDefaultScore(state: GameSessionState): number {
  const total = state.correct + state.wrong;
  if (total === 0) return 0;
  return Math.round((state.correct / total) * 100);
}
