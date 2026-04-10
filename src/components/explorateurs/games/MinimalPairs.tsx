'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Verbalia — « Paires minimales »
 *
 * Deux mots très proches phonologiquement sont affichés (ex. poule/boule).
 * LUMO annonce lequel elle dit (via Web Speech), l'enfant choisit.
 * Mesure la discrimination phonologique (dyslexie, articulation).
 */
const PAIRS: Array<{ words: [string, string]; target: 0 | 1 }> = [
  { words: ['poule', 'boule'], target: 0 },
  { words: ['pain', 'bain'], target: 1 },
  { words: ['chat', 'chas'], target: 0 },
  { words: ['tasse', 'dasse'], target: 0 },
  { words: ['cou', 'goût'], target: 1 },
  { words: ['fou', 'vous'], target: 0 },
  { words: ['rat', 'ras'], target: 0 },
  { words: ['sel', 'zèle'], target: 0 },
];

export function MinimalPairs({ childId }: { childId: string }) {
  const rounds = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5).slice(0, 6), []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [played, setPlayed] = useState(false);

  const play = useGamePlay({
    childId,
    planetSlug: 'verbalia',
    activitySlug: 'minimal-pairs',
    defaultDomain: 'PHONOLOGY',
  });

  const round = rounds[index];
  const done = index >= rounds.length;

  const playWord = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(round.words[round.target]);
    u.lang = 'fr-FR';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setPlayed(true);
  };

  const handleChoice = (i: 0 | 1) => {
    if (feedback || done) return;
    const isCorrect = i === round.target;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `minimal_pair_ok_${round.words.join('_')}`
        : `minimal_pair_wrong_${round.words.join('_')}`,
      weight: isCorrect ? 0.4 : 0.8,
      context: { pair: round.words, expected: round.words[round.target], chosen: round.words[i] },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      setPlayed(false);
      if (index + 1 >= rounds.length) play.finish();
      setIndex((j) => j + 1);
    }, 900);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="verbalia"
      activitySlug="minimal-pairs"
      title="Paires minimales"
      instruction="Écoute le mot et clique sur celui que tu as entendu."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={playWord}
            className="rounded-full border-2 border-rose-400 bg-rose-500/10 px-8 py-4 text-lg font-semibold text-rose-200 hover:bg-rose-500/20"
          >
            🔊 {played ? 'Rejouer le mot' : 'Écouter le mot'}
          </button>
          <div className="flex gap-4">
            {round.words.map((w, i) => (
              <button
                key={`${index}-${w}`}
                type="button"
                onClick={() => handleChoice(i as 0 | 1)}
                disabled={feedback !== null || !played}
                className={`rounded-2xl border-2 px-10 py-6 text-3xl font-bold transition ${
                  feedback && i === round.target
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : feedback === 'wrong' && i !== round.target
                      ? 'border-rose-500/60 bg-rose-500/10 text-rose-300 opacity-60'
                      : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-rose-400 disabled:opacity-50'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">👂</p>
          <p className="text-xl">Super oreille !</p>
        </div>
      )}
    </GameShell>
  );
}
