'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Numeris — « Calcul mental »
 *
 * Additions et soustractions simples jusqu'à 20. L'enfant choisit parmi 4
 * réponses possibles. Mesure les faits numériques de base (dyscalculie).
 */
const ROUNDS = 8;

type Round = {
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  choices: number[];
  correctIndex: number;
};

function buildRound(): Round {
  const op: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
  let a: number, b: number, answer: number;
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * 10);
    b = 1 + Math.floor(Math.random() * 10);
    answer = a + b;
  } else {
    a = 5 + Math.floor(Math.random() * 15);
    b = 1 + Math.floor(Math.random() * a);
    answer = a - b;
  }
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const d = Math.max(0, answer + (Math.floor(Math.random() * 7) - 3));
    if (d !== answer) distractors.add(d);
  }
  const choices = [...Array.from(distractors), answer].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices, correctIndex: choices.indexOf(answer) };
}

export function MentalCalc({ childId }: { childId: string }) {
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, buildRound), []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'numeris',
    activitySlug: 'mental-calc',
    defaultDomain: 'NUMERIC',
  });

  const round = rounds[index];
  const done = index >= ROUNDS;

  const handleChoice = (i: number) => {
    if (feedback || done) return;
    const isCorrect = i === round.correctIndex;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `calc_${round.op}_ok`
        : `calc_${round.op}_wrong_${round.a}${round.op}${round.b}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { a: round.a, b: round.b, op: round.op, expected: round.answer, chosen: round.choices[i] },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= ROUNDS) play.finish();
      setIndex((j) => j + 1);
    }, 800);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="numeris"
      activitySlug="mental-calc"
      title="Calcul mental"
      instruction="Trouve la bonne réponse."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="rounded-3xl border-2 border-amber-400/40 bg-amber-500/10 px-16 py-10 text-6xl font-bold text-amber-200">
            {round.a} {round.op} {round.b} = ?
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {round.choices.map((c, i) => (
              <button
                key={`${index}-${c}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`h-20 w-20 rounded-2xl text-3xl font-bold transition ${
                  feedback && i === round.correctIndex
                    ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.correctIndex
                      ? 'border-2 border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-2 border-slate-700 bg-slate-900 text-slate-100 hover:border-amber-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🧮</p>
          <p className="text-xl">Calculateur expert !</p>
        </div>
      )}
    </GameShell>
  );
}
