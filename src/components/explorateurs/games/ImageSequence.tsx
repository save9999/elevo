'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Memoria — « Suite d'images »
 *
 * Une séquence d'emojis apparaît 2 secondes, disparaît, l'enfant doit cliquer
 * sur les emojis dans le même ordre. Mesure la mémoire visuelle séquentielle.
 */
const POOL = ['🐱', '🦁', '🐸', '🦋', '🐢', '🐟', '🐝', '🐧', '🦊', '🐙'];
const MAX_ROUNDS = 6;

function buildSequence(length: number): string[] {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, length);
}

export function ImageSequence({ childId }: { childId: string }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<'showing' | 'recalling' | 'between' | 'done'>('showing');
  const [sequence, setSequence] = useState<string[]>([]);
  const [input, setInput] = useState<string[]>([]);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'memoria',
    activitySlug: 'image-sequence',
    defaultDomain: 'MEMORY',
  });

  // Longueur de la séquence qui croît : 2 → 3 → 4 → 5 → 6 → 7
  const sequenceLength = Math.min(round + 1, 7);

  useEffect(() => {
    if (phase !== 'showing') return;
    const newSeq = buildSequence(sequenceLength);
    setSequence(newSeq);
    setShuffledChoices([...newSeq].sort(() => Math.random() - 0.5));
    setInput([]);
    const t = setTimeout(() => setPhase('recalling'), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleClick = (emoji: string) => {
    if (phase !== 'recalling') return;
    const newInput = [...input, emoji];
    setInput(newInput);
    const correctSoFar = newInput.every((e, i) => e === sequence[i]);
    if (!correctSoFar) {
      play.record({
        kind: 'answer_wrong',
        signal: `memory_seq_len_${sequenceLength}_fail`,
        weight: 0.7,
        context: { length: sequenceLength, at: newInput.length - 1 },
      });
      setFeedback('wrong');
      setPhase('between');
      setTimeout(() => {
        setFeedback(null);
        setPhase('done');
        play.finish();
      }, 900);
      return;
    }
    if (newInput.length === sequence.length) {
      play.record({
        kind: 'answer_correct',
        signal: `memory_seq_len_${sequenceLength}_ok`,
        weight: 0.3,
        context: { length: sequenceLength },
      });
      setFeedback('correct');
      setPhase('between');
      setTimeout(() => {
        setFeedback(null);
        if (round >= MAX_ROUNDS) {
          setPhase('done');
          play.finish();
        } else {
          setRound((r) => r + 1);
          setPhase('showing');
        }
      }, 900);
    }
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="memoria"
      activitySlug="image-sequence"
      title="Suite d'images"
      instruction={
        phase === 'showing'
          ? 'Retiens bien la suite…'
          : phase === 'recalling'
            ? 'Clique les images dans le même ordre !'
            : phase === 'done'
              ? 'Partie terminée.'
              : ''
      }
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : phase === 'showing' ? 'thinking' : 'idle'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      <div className="flex flex-col items-center gap-8">
        {phase === 'showing' && (
          <div className="flex flex-wrap justify-center gap-3">
            {sequence.map((e, i) => (
              <div
                key={i}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/20 text-5xl shadow-[0_0_30px_rgba(167,139,250,0.4)]"
              >
                {e}
              </div>
            ))}
          </div>
        )}

        {phase === 'recalling' && (
          <>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {Array.from({ length: sequence.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-violet-400/40 text-3xl"
                >
                  {input[i] ?? ''}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {shuffledChoices.map((e, i) => (
                <button
                  key={`${round}-${e}-${i}`}
                  type="button"
                  onClick={() => handleClick(e)}
                  disabled={input.includes(e)}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-700 bg-slate-900 text-5xl transition hover:border-violet-400 hover:bg-slate-800 disabled:opacity-30"
                >
                  {e}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-slate-500">
          Manche {round} / {MAX_ROUNDS} · Séquence de {sequenceLength}
        </p>
      </div>
    </GameShell>
  );
}
