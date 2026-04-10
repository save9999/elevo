'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createGameSession, type GameEvent } from '@/engine/game-kit/GameSession';
import type { ObservationDomain } from '@/engine/observation/collector';

/**
 * Hook qui gère le cycle de vie d'un mini-jeu :
 *  1. Au mount : POST /api/game-sessions (action:start) pour obtenir un sessionId
 *  2. Pendant le jeu : accumule des événements en mémoire
 *  3. Au finish : POST /api/observations (batch) puis POST /api/game-sessions (action:end)
 *
 * Le consommateur appelle simplement `record(event)` et `finish()`.
 */
export function useGamePlay({
  childId,
  planetSlug,
  activitySlug,
  defaultDomain,
}: {
  childId: string;
  planetSlug: string;
  activitySlug: string;
  defaultDomain: ObservationDomain;
}) {
  const sessionRef = useRef(
    createGameSession({ activitySlug, planetSlug, defaultDomain }),
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'playing' | 'done'>('idle');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  // Démarre la session côté serveur
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/game-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            childId,
            planetSlug,
            activitySlug,
          }),
        });
        if (!res.ok) throw new Error('start_failed');
        const data = await res.json();
        if (!cancelled) {
          setSessionId(data.session.id);
          setStatus('ready');
        }
      } catch {
        // On continue quand même, les observations ne seront pas persistées
        if (!cancelled) setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const record = useCallback((event: GameEvent) => {
    sessionRef.current.recordEvent(event);
    if (event.kind === 'answer_correct') setCorrect((c) => c + 1);
    if (event.kind === 'answer_wrong') setWrong((w) => w + 1);
    if (status === 'ready') setStatus('playing');
  }, [status]);

  const finish = useCallback(
    async (finalScore?: number) => {
      const finished = sessionRef.current.finish(finalScore);
      setStatus('done');

      // Envoi batch des observations
      const observations = sessionRef.current.toObservations(childId, sessionId ?? undefined);
      if (observations.length > 0) {
        try {
          await fetch('/api/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              childId,
              sessionId: sessionId ?? undefined,
              observations,
            }),
          });
        } catch {
          // non-bloquant
        }
      }

      // Fin de session côté serveur
      if (sessionId) {
        try {
          await fetch('/api/game-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'end',
              sessionId,
              score: finished.score,
              metadata: { correct: finished.correct, wrong: finished.wrong },
            }),
          });
        } catch {
          // non-bloquant
        }
      }

      return finished;
    },
    [childId, sessionId],
  );

  return { status, record, finish, correct, wrong };
}
