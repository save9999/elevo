'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Scripta — « Chasse aux homophones »
 *
 * Phrase à trou avec deux homophones grammaticaux (a/à, et/est, son/sont).
 * L'enfant choisit le bon. Mesure l'orthographe grammaticale (dysorthographie).
 */
const ITEMS: Array<{ sentence: string; options: string[]; correct: number; rule?: string }> = [
  { sentence: "Il ___ un joli chapeau.", options: ['a', 'à'], correct: 0 },
  { sentence: "Je vais ___ la plage.", options: ['a', 'à'], correct: 1 },
  { sentence: "Le chien ___ le chat jouent.", options: ['et', 'est'], correct: 0 },
  { sentence: "Mon frère ___ content.", options: ['et', 'est'], correct: 1 },
  { sentence: "C'est ___ cahier à lui.", options: ['son', 'sont'], correct: 0 },
  { sentence: "Les enfants ___ contents.", options: ['son', 'sont'], correct: 1 },
  { sentence: "Elle ___ mangé une pomme.", options: ['a', 'à'], correct: 0 },
  { sentence: "Mon père ___ ma mère dansent.", options: ['et', 'est'], correct: 0 },
];

export function HomophoneHunt({ childId }: { childId: string }) {
  const rounds = useMemo(() => [...ITEMS].sort(() => Math.random() - 0.5).slice(0, 6), []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'scripta',
    activitySlug: 'homophone-hunt',
    defaultDomain: 'WRITING',
  });

  const round = rounds[index];
  const done = index >= rounds.length;

  const handleChoice = (i: number) => {
    if (feedback || done) return;
    const isCorrect = i === round.correct;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `homophone_ok_${round.options.join('_')}`
        : `homophone_wrong_${round.options[i]}_for_${round.options[round.correct]}`,
      weight: isCorrect ? 0.3 : 0.7,
      context: { sentence: round.sentence, chosen: round.options[i], expected: round.options[round.correct] },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= rounds.length) play.finish();
      setIndex((j) => j + 1);
    }, 900);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="scripta"
      activitySlug="homophone-hunt"
      title="Chasse aux homophones"
      instruction="Complète la phrase avec le bon mot."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="max-w-xl rounded-3xl border-2 border-emerald-400/40 bg-emerald-500/10 px-10 py-8 text-center">
            <p className="text-3xl font-medium leading-relaxed text-emerald-100">
              {round.sentence.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-16 border-b-2 border-emerald-400 align-middle" />
                  )}
                </span>
              ))}
            </p>
          </div>
          <div className="flex gap-4">
            {round.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`rounded-2xl border-2 px-8 py-4 text-2xl font-semibold transition ${
                  feedback && i === round.correct
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.correct
                      ? 'border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🕵️</p>
          <p className="text-xl">Détective orthographe !</p>
        </div>
      )}
    </GameShell>
  );
}
