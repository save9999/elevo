'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Alphabos — « Lecture de mots-martiens »
 *
 * On montre un pseudo-mot (mot inventé, phonologiquement légal en français).
 * L'enfant choisit le vrai mot qui a le MÊME nombre de syllabes.
 * Mesure indirecte du décodage et de la conscience syllabique.
 */

const ITEMS: Array<{ pseudo: string; syllables: number; choices: Array<{ word: string; syllables: number }> }> = [
  {
    pseudo: 'TOLU',
    syllables: 2,
    choices: [
      { word: 'CHAT', syllables: 1 },
      { word: 'BATEAU', syllables: 2 },
      { word: 'TÉLÉPHONE', syllables: 4 },
    ],
  },
  {
    pseudo: 'KAVIRO',
    syllables: 3,
    choices: [
      { word: 'CHOCOLAT', syllables: 3 },
      { word: 'POMME', syllables: 1 },
      { word: 'LUNE', syllables: 1 },
    ],
  },
  {
    pseudo: 'PLUR',
    syllables: 1,
    choices: [
      { word: 'FLEUR', syllables: 1 },
      { word: 'MAMAN', syllables: 2 },
      { word: 'BANANE', syllables: 3 },
    ],
  },
  {
    pseudo: 'BOLUTA',
    syllables: 3,
    choices: [
      { word: 'CROCODILE', syllables: 4 },
      { word: 'LAPIN', syllables: 2 },
      { word: 'TOMATE', syllables: 3 },
    ],
  },
  {
    pseudo: 'GRAMPE',
    syllables: 1,
    choices: [
      { word: 'LAMPE', syllables: 1 },
      { word: 'GÂTEAU', syllables: 2 },
      { word: 'BUREAU', syllables: 2 },
    ],
  },
  {
    pseudo: 'NIVOPA',
    syllables: 3,
    choices: [
      { word: 'SOLEIL', syllables: 2 },
      { word: 'TÉLÉPHONE', syllables: 4 },
      { word: 'GIRAFE', syllables: 2 },
    ],
  },
];

export function PseudoWordRead({ childId }: { childId: string }) {
  const rounds = useMemo(() => {
    return ITEMS.map((item) => {
      const choices = [...item.choices].sort(() => Math.random() - 0.5);
      const correctIndex = choices.findIndex(
        (c) => c.syllables === item.syllables,
      );
      return { ...item, choices, correctIndex };
    });
  }, []);

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const play = useGamePlay({
    childId,
    planetSlug: 'alphabos',
    activitySlug: 'pseudo-word-read',
    defaultDomain: 'READING_ACCURACY',
  });

  const round = rounds[index];
  const done = index >= rounds.length;

  const handleChoice = (i: number) => {
    if (feedback || done) return;
    const isCorrect = i === round.correctIndex;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `syllable_count_ok_${round.syllables}`
        : `syllable_count_wrong_${round.syllables}_got_${round.choices[i].syllables}`,
      weight: 0.6,
      context: {
        pseudo: round.pseudo,
        expectedSyllables: round.syllables,
        chosenSyllables: round.choices[i].syllables,
      },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= rounds.length) play.finish();
      setIndex((j) => j + 1);
    }, 800);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="alphabos"
      activitySlug="pseudo-word-read"
      title="Les mots-martiens"
      instruction="Ce mot n'existe pas dans notre langue. Trouve le vrai mot qui a le même nombre de syllabes."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
              Mot-martien
            </p>
            <div className="rounded-3xl border-2 border-violet-400/40 bg-violet-500/10 px-12 py-6 text-5xl font-bold tracking-widest text-violet-200">
              {round.pseudo}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {round.syllables} syllabe{round.syllables > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {round.choices.map((c, i) => (
              <button
                key={`${round.pseudo}-${c.word}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`rounded-2xl px-6 py-4 text-xl font-semibold transition ${
                  feedback && i === round.correctIndex
                    ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.correctIndex
                      ? 'border-2 border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-2 border-slate-700 bg-slate-900 text-slate-100 hover:border-violet-400 hover:bg-slate-800'
                }`}
              >
                {c.word}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">🛸</p>
          <p className="text-xl">Tu maîtrises le martien !</p>
        </div>
      )}
    </GameShell>
  );
}
