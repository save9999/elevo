'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Numeris — « Compte éclair »
 *
 * Les étoiles apparaissent pendant 800 ms puis disparaissent. L'enfant clique
 * sur le bon nombre. Mesure la subitisation (discrimination quantité sans comptage).
 */

const ROUNDS = 8;

function buildRounds(): Array<{ count: number; choices: number[]; correctIndex: number }> {
  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    const count = 1 + Math.floor(Math.random() * 6); // 1 à 6
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const d = 1 + Math.floor(Math.random() * 6);
      if (d !== count) distractors.add(d);
    }
    const choices = [...Array.from(distractors), count].sort(() => Math.random() - 0.5);
    rounds.push({ count, choices, correctIndex: choices.indexOf(count) });
  }
  return rounds;
}

export function Subitize({ childId }: { childId: string }) {
  const rounds = useMemo(buildRounds, []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'hidden' | 'answered'>('showing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'numeris',
    activitySlug: 'subitize',
    defaultDomain: 'NUMERIC',
  });

  const round = rounds[index];
  const done = index >= ROUNDS;

  useEffect(() => {
    if (done) return;
    setPhase('showing');
    const t = setTimeout(() => setPhase('hidden'), 800);
    return () => clearTimeout(t);
  }, [index, done]);

  const handleChoice = (i: number) => {
    if (phase === 'answered' || phase === 'showing' || done) return;
    const isCorrect = i === round.correctIndex;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect
        ? `subitize_ok_${round.count}`
        : `subitize_wrong_${round.count}_got_${round.choices[i]}`,
      weight: 0.5,
      context: { real: round.count, chosen: round.choices[i] },
    });

    setPhase('answered');
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
      planetSlug="numeris"
      activitySlug="subitize"
      title="Compte éclair"
      instruction="Regarde bien, combien d'étoiles as-tu vu ?"
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          {/* Zone d'affichage des étoiles */}
          <div className="flex h-52 w-80 items-center justify-center rounded-3xl border-2 border-amber-400/40 bg-amber-500/5">
            {phase === 'showing' && (
              <div className="flex flex-wrap justify-center gap-3 p-4">
                {Array.from({ length: round.count }).map((_, k) => (
                  <span
                    key={k}
                    className="text-4xl drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  >
                    ⭐
                  </span>
                ))}
              </div>
            )}
            {phase === 'hidden' && (
              <p className="text-sm uppercase tracking-widest text-amber-300">
                Combien ?
              </p>
            )}
            {phase === 'answered' && (
              <p className="text-lg font-semibold text-amber-200">
                {feedback === 'correct' ? 'Bien vu !' : `C'était ${round.count}`}
              </p>
            )}
          </div>

          {/* Choix */}
          <div className="flex gap-3">
            {round.choices.map((n, i) => (
              <button
                key={`${index}-${n}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={phase !== 'hidden'}
                className={`h-16 w-16 rounded-2xl text-2xl font-bold transition ${
                  phase === 'answered' && i === round.correctIndex
                    ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : 'border-2 border-slate-700 bg-slate-900 text-slate-100 hover:border-amber-400 hover:bg-slate-800 disabled:opacity-40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">⚡</p>
          <p className="text-xl">Œil de lynx !</p>
        </div>
      )}
    </GameShell>
  );
}
