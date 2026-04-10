'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Alphabos — « Attrape la lettre »
 *
 * On montre une lettre majuscule. L'enfant doit cliquer sur la lettre minuscule
 * correspondante parmi 4 choix. Mesure la reconnaissance de correspondance
 * majuscule/minuscule (phonologie + discrimination visuelle).
 */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'];
const ROUNDS = 8;

type Round = {
  target: string;
  choices: string[];
  correctIndex: number;
};

function buildRounds(): Round[] {
  const rounds: Round[] = [];
  const used = new Set<string>();
  while (rounds.length < ROUNDS) {
    const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (used.has(target)) continue;
    used.add(target);

    const distractors = LETTERS.filter((l) => l !== target)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [...distractors, target].sort(() => Math.random() - 0.5);
    rounds.push({
      target,
      choices,
      correctIndex: choices.indexOf(target),
    });
  }
  return rounds;
}

export function LetterMatch({ childId }: { childId: string }) {
  const rounds = useMemo(buildRounds, []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const play = useGamePlay({
    childId,
    planetSlug: 'alphabos',
    activitySlug: 'letter-match',
    defaultDomain: 'PHONOLOGY',
  });

  const round = rounds[index];
  const done = index >= ROUNDS;

  const handleChoice = (choiceIndex: number) => {
    if (feedback || done) return;
    const isCorrect = choiceIndex === round.correctIndex;
    const chosen = round.choices[choiceIndex];

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `letter_match_${round.target}`
        : `letter_confusion_${round.target}_${chosen}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { target: round.target, chosen, correct: isCorrect },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= ROUNDS) {
        play.finish();
      }
      setIndex((i) => i + 1);
    }, 700);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="alphabos"
      activitySlug="letter-match"
      title="Attrape la lettre"
      instruction="Clique sur la lettre minuscule qui correspond à la majuscule."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'idle'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-indigo-400/40 bg-indigo-500/10 text-8xl font-bold text-indigo-200 shadow-[0_0_60px_-10px_rgba(99,102,241,0.7)]">
            {round.target}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {round.choices.map((c, i) => (
              <button
                key={`${round.target}-${i}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`flex h-24 w-24 items-center justify-center rounded-2xl text-5xl font-semibold transition ${
                  feedback && i === round.correctIndex
                    ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' &&
                        round.choices[round.correctIndex] !== c
                      ? 'border-2 border-rose-500 bg-rose-500/20 text-rose-200 opacity-60'
                      : 'border-2 border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-400 hover:bg-slate-800'
                }`}
              >
                {c.toLowerCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🌟</p>
          <p className="text-xl">Mission terminée !</p>
        </div>
      )}
    </GameShell>
  );
}
