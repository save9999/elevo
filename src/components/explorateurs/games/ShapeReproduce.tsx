'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Geometra — « Reproduis la forme »
 *
 * Une figure composée de 3-5 cases colorées sur grille 3×3 est montrée.
 * L'enfant clique pour reproduire les mêmes cases. Mesure la représentation
 * visuo-spatiale (dyspraxie).
 */
const ROUNDS = 6;
const GRID = 9;

function buildTarget(count: number): Set<number> {
  const positions = new Set<number>();
  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * GRID));
  }
  return positions;
}

export function ShapeReproduce({ childId }: { childId: string }) {
  const rounds = useMemo(
    () =>
      Array.from({ length: ROUNDS }, (_, i) =>
        Array.from(buildTarget(Math.min(3 + Math.floor(i / 2), 5))),
      ),
    [],
  );
  const [index, setIndex] = useState(0);
  const [userCells, setUserCells] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'geometra',
    activitySlug: 'shape-reproduce',
    defaultDomain: 'VISUO_SPATIAL',
  });

  const target = new Set(rounds[index] ?? []);
  const done = index >= rounds.length;

  const toggle = (i: number) => {
    if (feedback || done) return;
    const next = new Set(userCells);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setUserCells(next);
  };

  const validate = () => {
    if (feedback || done) return;
    const isCorrect =
      userCells.size === target.size &&
      [...userCells].every((c) => target.has(c));

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `shape_ok_size_${target.size}`
        : `shape_wrong_size_${target.size}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { target: [...target], chosen: [...userCells] },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      setUserCells(new Set());
      if (index + 1 >= rounds.length) play.finish();
      setIndex((j) => j + 1);
    }, 900);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="geometra"
      activitySlug="shape-reproduce"
      title="Reproduis la forme"
      instruction="Regarde bien la figure, puis clique les mêmes cases à droite."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-10">
            {/* Modèle */}
            <div>
              <p className="mb-2 text-center text-xs uppercase tracking-widest text-cyan-300">
                Modèle
              </p>
              <div className="grid grid-cols-3 gap-1 rounded-xl border-2 border-cyan-500/40 bg-cyan-500/5 p-2">
                {Array.from({ length: GRID }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-12 w-12 rounded-lg ${
                      target.has(i)
                        ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-3xl text-slate-500">→</div>
            {/* À remplir */}
            <div>
              <p className="mb-2 text-center text-xs uppercase tracking-widest text-cyan-300">
                À toi
              </p>
              <div className="grid grid-cols-3 gap-1 rounded-xl border-2 border-cyan-500/40 bg-slate-950 p-2">
                {Array.from({ length: GRID }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggle(i)}
                    disabled={feedback !== null}
                    className={`h-12 w-12 rounded-lg transition ${
                      userCells.has(i)
                        ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={validate}
            disabled={userCells.size === 0 || feedback !== null}
            className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            Valider
          </button>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🔷</p>
          <p className="text-xl">Œil de géomètre !</p>
        </div>
      )}
    </GameShell>
  );
}
