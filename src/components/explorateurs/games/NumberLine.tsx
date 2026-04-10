'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Numeris — « La droite numérique »
 *
 * Un nombre apparaît. L'enfant clique sur la position la plus proche sur une
 * ligne numérique 0-20. Mesure la représentation spatiale du nombre (dyscalculie).
 */
const ROUNDS = 8;
const MAX = 20;

function buildRounds() {
  const rounds: number[] = [];
  const used = new Set<number>();
  while (rounds.length < ROUNDS) {
    const n = 1 + Math.floor(Math.random() * MAX);
    if (used.has(n)) continue;
    used.add(n);
    rounds.push(n);
  }
  return rounds;
}

export function NumberLine({ childId }: { childId: string }) {
  const rounds = useMemo(buildRounds, []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'numeris',
    activitySlug: 'number-line',
    defaultDomain: 'NUMERIC',
  });

  const target = rounds[index];
  const done = index >= ROUNDS;

  const handleClick = (value: number) => {
    if (feedback || done) return;
    const diff = Math.abs(value - target);
    const isCorrect = diff <= 1; // tolérance ±1
    setChosen(value);

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `number_line_ok_${target}`
        : `number_line_off_${target}_by_${diff}`,
      weight: isCorrect ? 0.3 : Math.min(0.5 + diff * 0.1, 1),
      context: { target, chosen: value, diff },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      setChosen(null);
      if (index + 1 >= ROUNDS) play.finish();
      setIndex((i) => i + 1);
    }, 800);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="numeris"
      activitySlug="number-line"
      title="La droite numérique"
      instruction="Clique sur la position du nombre sur la ligne."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="rounded-3xl border-2 border-amber-400/40 bg-amber-500/10 px-12 py-8 text-7xl font-bold text-amber-200">
            {target}
          </div>
          <div className="relative w-full max-w-2xl">
            <div className="relative h-3 rounded-full bg-slate-800">
              <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-indigo-500/30 via-amber-500/30 to-rose-500/30" />
            </div>
            <div className="mt-4 flex justify-between">
              {Array.from({ length: MAX + 1 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleClick(n)}
                  disabled={feedback !== null}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition ${
                    chosen === n && feedback === 'correct'
                      ? 'bg-emerald-500 text-white'
                      : chosen === n && feedback === 'wrong'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-900'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">📏</p>
          <p className="text-xl">Super mesureur !</p>
        </div>
      )}
    </GameShell>
  );
}
