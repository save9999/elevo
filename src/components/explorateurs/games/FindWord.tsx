'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Verbalia — « Le mot juste »
 *
 * On donne une définition courte, l'enfant choisit le mot parmi 4 options.
 * Mesure le vocabulaire et l'accès lexical.
 */
const ITEMS: Array<{ clue: string; options: string[]; correct: number }> = [
  { clue: 'Un animal qui ronronne et chasse les souris', options: ['chien', 'chat', 'oiseau', 'lapin'], correct: 1 },
  { clue: 'Un fruit rouge et rond qui pousse sur un arbre', options: ['banane', 'citron', 'pomme', 'fraise'], correct: 2 },
  { clue: 'Quelque chose qui éclaire le ciel la nuit', options: ['soleil', 'nuage', 'pluie', 'lune'], correct: 3 },
  { clue: 'Un objet pour écrire sur du papier', options: ['stylo', 'fourchette', 'ciseaux', 'clé'], correct: 0 },
  { clue: 'Un meuble dans lequel on dort', options: ['table', 'chaise', 'lit', 'bureau'], correct: 2 },
  { clue: 'Un véhicule qui vole dans le ciel', options: ['voiture', 'bateau', 'train', 'avion'], correct: 3 },
  { clue: 'Un instrument qui joue de la musique avec des touches', options: ['piano', 'guitare', 'tambour', 'flûte'], correct: 0 },
  { clue: "On s'en sert pour couper les aliments", options: ['cuillère', 'couteau', 'assiette', 'verre'], correct: 1 },
];

export function FindWord({ childId }: { childId: string }) {
  const rounds = useMemo(() => [...ITEMS].sort(() => Math.random() - 0.5).slice(0, 6), []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'verbalia',
    activitySlug: 'find-word',
    defaultDomain: 'READING_ACCURACY',
  });

  const round = rounds[index];
  const done = index >= rounds.length;

  const handleChoice = (i: number) => {
    if (feedback || done) return;
    const isCorrect = i === round.correct;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? 'vocab_ok' : `vocab_wrong_${round.options[i]}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { clue: round.clue, chosen: round.options[i], expected: round.options[round.correct] },
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
      planetSlug="verbalia"
      activitySlug="find-word"
      title="Le mot juste"
      instruction="Lis la devinette et trouve le bon mot."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          <div className="max-w-xl rounded-3xl border-2 border-rose-400/40 bg-rose-500/10 px-10 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-300">Devinette</p>
            <p className="mt-3 text-xl font-medium text-rose-100">{round.clue}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {round.options.map((o, i) => (
              <button
                key={`${index}-${o}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className={`rounded-2xl border-2 px-6 py-4 text-xl font-semibold transition ${
                  feedback && i === round.correct
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.correct
                      ? 'border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-rose-400'
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
          <p className="text-4xl">💬</p>
          <p className="text-xl">Vocabulaire au top !</p>
        </div>
      )}
    </GameShell>
  );
}
