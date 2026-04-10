'use client';

import { useEffect, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Memoria — « Simon avec LUMO »
 *
 * LUMO montre une séquence de couleurs de plus en plus longue. L'enfant doit
 * la reproduire dans le bon ordre. Mesure la mémoire de travail visuo-spatiale.
 */

const COLORS = [
  { id: 'red', label: 'Rouge', bg: 'bg-rose-500', bgLight: 'bg-rose-300' },
  { id: 'green', label: 'Vert', bg: 'bg-emerald-500', bgLight: 'bg-emerald-300' },
  { id: 'blue', label: 'Bleu', bg: 'bg-sky-500', bgLight: 'bg-sky-300' },
  { id: 'yellow', label: 'Jaune', bg: 'bg-amber-500', bgLight: 'bg-amber-300' },
];

const MAX_ROUNDS = 6;

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)].id;
}

export function SimonLumo({ childId }: { childId: string }) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [phase, setPhase] = useState<'showing' | 'waiting' | 'done'>('showing');
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'memoria',
    activitySlug: 'simon-lumo',
    defaultDomain: 'MEMORY',
  });

  // Nouveau round : on rallonge la séquence et on la rejoue
  useEffect(() => {
    if (phase !== 'showing') return;
    const newSequence = [...sequence, randomColor()];
    setSequence(newSequence);
    setUserInput([]);

    let i = 0;
    const playOne = () => {
      if (i >= newSequence.length) {
        setHighlighted(null);
        setPhase('waiting');
        return;
      }
      setHighlighted(newSequence[i]);
      setTimeout(() => {
        setHighlighted(null);
        setTimeout(() => {
          i += 1;
          playOne();
        }, 200);
      }, 500);
    };
    setTimeout(playOne, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleClick = (colorId: string) => {
    if (phase !== 'waiting') return;
    const expected = sequence[userInput.length];
    if (colorId === expected) {
      const newInput = [...userInput, colorId];
      setUserInput(newInput);
      if (newInput.length === sequence.length) {
        // Round réussi
        play.record({
          kind: 'answer_correct',
          signal: `memory_sequence_len_${sequence.length}`,
          weight: 0.4,
          context: { length: sequence.length },
        });
        setFeedback('correct');
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
    } else {
      play.record({
        kind: 'answer_wrong',
        signal: `memory_error_len_${sequence.length}`,
        weight: 0.7,
        context: { length: sequence.length, position: userInput.length },
      });
      setFeedback('wrong');
      setTimeout(() => {
        setPhase('done');
        play.finish();
        setFeedback(null);
      }, 900);
    }
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="memoria"
      activitySlug="simon-lumo"
      title="Simon avec LUMO"
      instruction={
        phase === 'showing'
          ? 'Regarde bien la séquence…'
          : phase === 'waiting'
            ? 'À toi ! Clique les couleurs dans le même ordre.'
            : 'Fin de la partie !'
      }
      mood={
        feedback === 'correct'
          ? 'happy'
          : feedback === 'wrong'
            ? 'gentle'
            : phase === 'showing'
              ? 'thinking'
              : 'idle'
      }
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleClick(c.id)}
              disabled={phase !== 'waiting'}
              className={`h-32 w-32 rounded-3xl transition-all duration-150 ${
                highlighted === c.id ? c.bgLight : c.bg
              } ${highlighted === c.id ? 'scale-110 shadow-[0_0_40px_rgba(255,255,255,0.5)]' : ''} ${
                phase !== 'waiting' ? 'cursor-not-allowed opacity-70' : 'hover:brightness-110'
              }`}
              aria-label={c.label}
            />
          ))}
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Séquence de {sequence.length} · Manche {round} / {MAX_ROUNDS}
        </p>
      </div>
    </GameShell>
  );
}
