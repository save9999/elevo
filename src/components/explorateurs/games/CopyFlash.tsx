'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Scripta — « Copie éclair »
 *
 * Un mot apparaît pendant 2 secondes, disparaît, l'enfant doit le retaper.
 * Mesure la mémoire orthographique (dysorthographie, dyslexie).
 */
const WORDS = [
  'chat', 'pomme', 'école', 'maman', 'bateau', 'fleur',
  'lampe', 'livre', 'souris', 'cheval', 'orange', 'soleil',
];
const ROUNDS = 6;

export function CopyFlash({ childId }: { childId: string }) {
  const rounds = useMemo(() => {
    return [...WORDS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
  }, []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'typing' | 'done-round'>('showing');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'scripta',
    activitySlug: 'copy-flash',
    defaultDomain: 'WRITING',
  });

  const target = rounds[index];
  const done = index >= rounds.length;

  useEffect(() => {
    if (done) return;
    setPhase('showing');
    setInput('');
    const t = setTimeout(() => setPhase('typing'), 2000);
    return () => clearTimeout(t);
  }, [index, done]);

  const normalize = (s: string) =>
    s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'typing') return;
    const isCorrect = normalize(input) === normalize(target);

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? `copy_ok` : `copy_wrong_${target}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { target, typed: input, correct: isCorrect },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setPhase('done-round');
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
      activitySlug="copy-flash"
      title="Copie éclair"
      instruction="Regarde bien le mot, il va disparaître. Puis retape-le."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div className="flex h-36 w-full max-w-md items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-emerald-500/5">
            {phase === 'showing' ? (
              <span className="text-6xl font-bold text-emerald-200 tracking-widest">
                {target.toUpperCase()}
              </span>
            ) : phase === 'typing' ? (
              <p className="text-sm uppercase tracking-widest text-emerald-300">
                Retape le mot !
              </p>
            ) : (
              <p className="text-lg font-semibold text-emerald-200">
                {feedback === 'correct' ? '✓ Bravo !' : `C'était : ${target}`}
              </p>
            )}
          </div>

          {phase === 'typing' && (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-2xl text-slate-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Tape le mot…"
              />
              <button
                type="submit"
                disabled={input.trim().length === 0}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium hover:bg-emerald-400 disabled:opacity-50"
              >
                Valider
              </button>
            </form>
          )}

          <p className="text-xs text-slate-500">
            Manche {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">✍️</p>
          <p className="text-xl">Champion de l&apos;écriture !</p>
        </div>
      )}
    </GameShell>
  );
}
