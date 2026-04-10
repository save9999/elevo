'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Geometra — « Gauche ou droite ? »
 *
 * Un objet est affiché à côté d'un repère central. L'enfant doit dire si
 * l'objet est à gauche ou à droite. Mesure l'orientation spatiale.
 */
const ITEMS = ['🚗', '🎈', '⚽', '🍎', '🌳', '🐈', '🎸', '📚'];
const ROUNDS = 8;

export function LeftRight({ childId }: { childId: string }) {
  const rounds = useMemo(() => {
    return Array.from({ length: ROUNDS }, () => ({
      emoji: ITEMS[Math.floor(Math.random() * ITEMS.length)],
      side: Math.random() < 0.5 ? ('left' as const) : ('right' as const),
    }));
  }, []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'geometra',
    activitySlug: 'left-right',
    defaultDomain: 'VISUO_SPATIAL',
  });

  const round = rounds[index];
  const done = index >= ROUNDS;

  const handleChoice = (choice: 'left' | 'right') => {
    if (feedback || done) return;
    const isCorrect = choice === round.side;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? `lr_ok_${round.side}` : `lr_wrong_${round.side}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { expected: round.side, chosen: choice },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= ROUNDS) play.finish();
      setIndex((j) => j + 1);
    }, 700);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="geometra"
      activitySlug="left-right"
      title="Gauche ou droite ?"
      instruction="L'objet est-il à gauche ou à droite du repère ?"
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="relative flex h-48 w-full max-w-xl items-center justify-center rounded-3xl border-2 border-cyan-400/40 bg-cyan-500/5">
            {/* Repère central */}
            <div className="absolute left-1/2 top-1/2 h-32 w-1 -translate-x-1/2 -translate-y-1/2 bg-cyan-400" />
            {/* Objet */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-6xl ${
                round.side === 'left' ? 'left-8' : 'right-8'
              }`}
            >
              {round.emoji}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChoice('left')}
              disabled={feedback !== null}
              className={`flex items-center gap-2 rounded-2xl border-2 px-8 py-4 text-xl font-semibold transition ${
                feedback && round.side === 'left'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : feedback && round.side !== 'left'
                    ? 'border-rose-500/60 opacity-60'
                    : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400'
              }`}
            >
              ← Gauche
            </button>
            <button
              type="button"
              onClick={() => handleChoice('right')}
              disabled={feedback !== null}
              className={`flex items-center gap-2 rounded-2xl border-2 px-8 py-4 text-xl font-semibold transition ${
                feedback && round.side === 'right'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : feedback && round.side !== 'right'
                    ? 'border-rose-500/60 opacity-60'
                    : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400'
              }`}
            >
              Droite →
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🧭</p>
          <p className="text-xl">Parfait sens de l&apos;orientation !</p>
        </div>
      )}
    </GameShell>
  );
}
