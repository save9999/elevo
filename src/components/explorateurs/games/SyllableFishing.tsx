'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Alphabos — « Pêche à la syllabe »
 *
 * On entend (via voix off Web Speech — mais on affiche aussi le mot pour fallback)
 * un mot, et l'enfant doit cliquer sur la syllabe qui commence le mot parmi 4.
 */

const WORDS: Array<{ word: string; firstSyllable: string; distractors: string[] }> = [
  { word: 'BATEAU', firstSyllable: 'BA', distractors: ['MA', 'LA', 'PA'] },
  { word: 'CHAPEAU', firstSyllable: 'CHA', distractors: ['JA', 'SA', 'GA'] },
  { word: 'MAISON', firstSyllable: 'MAI', distractors: ['RAI', 'FAI', 'BAI'] },
  { word: 'DOUDOU', firstSyllable: 'DOU', distractors: ['TOU', 'MOU', 'POU'] },
  { word: 'PIZZA', firstSyllable: 'PI', distractors: ['TI', 'RI', 'SI'] },
  { word: 'SOLEIL', firstSyllable: 'SO', distractors: ['TO', 'MO', 'FO'] },
  { word: 'TABLEAU', firstSyllable: 'TA', distractors: ['BA', 'CA', 'DA'] },
  { word: 'VOLCAN', firstSyllable: 'VOL', distractors: ['BOL', 'SOL', 'MOL'] },
];

export function SyllableFishing({ childId }: { childId: string }) {
  const rounds = useMemo(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
    return shuffled.map((w) => {
      const choices = [...w.distractors, w.firstSyllable].sort(() => Math.random() - 0.5);
      return { ...w, choices, correctIndex: choices.indexOf(w.firstSyllable) };
    });
  }, []);

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const play = useGamePlay({
    childId,
    planetSlug: 'alphabos',
    activitySlug: 'syllable-fishing',
    defaultDomain: 'PHONOLOGY',
  });

  const round = rounds[index];
  const done = index >= rounds.length;

  const handleChoice = (choiceIndex: number) => {
    if (feedback || done) return;
    const isCorrect = choiceIndex === round.correctIndex;
    const chosen = round.choices[choiceIndex];

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `syllable_start_ok_${round.word}`
        : `syllable_start_wrong_${round.word}_${chosen}`,
      weight: isCorrect ? 0.3 : 0.7,
      context: { word: round.word, expected: round.firstSyllable, chosen },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= rounds.length) play.finish();
      setIndex((i) => i + 1);
    }, 800);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="alphabos"
      activitySlug="syllable-fishing"
      title="Pêche à la syllabe"
      instruction="Par quelle syllabe commence ce mot ?"
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="rounded-3xl border-2 border-sky-400/40 bg-sky-500/10 px-12 py-8 text-6xl font-bold tracking-widest text-sky-200">
            {round.word}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {round.choices.map((c, i) => (
              <button
                key={`${round.word}-${i}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`rounded-2xl px-6 py-6 text-3xl font-semibold transition ${
                  feedback && i === round.correctIndex
                    ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.correctIndex
                      ? 'border-2 border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-2 border-slate-700 bg-slate-900 text-slate-100 hover:border-sky-400 hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🐟</p>
          <p className="text-xl">Superbe pêche !</p>
        </div>
      )}
    </GameShell>
  );
}
