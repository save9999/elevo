'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Numeris — « Fais décoller la fusée »
 *
 * Chaque calcul correct fait monter la fusée d'un étage. Objectif : atteindre
 * la lune (8 étages). Une mauvaise réponse ne fait pas redescendre mais
 * active un "tremblement" sur la fusée.
 *
 * Game feel : la fusée monte progressivement, des étoiles défilent en arrière-plan,
 * quand on atteint la lune → explosion de confettis.
 */

const GOAL = 8;

type Round = {
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  choices: number[];
  correctIndex: number;
};

function buildRound(): Round {
  const op: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
  let a: number, b: number, answer: number;
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * 12);
    b = 1 + Math.floor(Math.random() * 12);
    answer = a + b;
  } else {
    a = 5 + Math.floor(Math.random() * 20);
    b = 1 + Math.floor(Math.random() * a);
    answer = a - b;
  }
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const d = Math.max(0, answer + (Math.floor(Math.random() * 7) - 3));
    if (d !== answer) distractors.add(d);
  }
  const choices = [...Array.from(distractors), answer].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices, correctIndex: choices.indexOf(answer) };
}

export function RocketMath({ childId }: { childId: string }) {
  const [altitude, setAltitude] = useState(0);
  const [rounds, setRounds] = useState<Round[]>(() =>
    Array.from({ length: 20 }, buildRound),
  );
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shake, setShake] = useState(false);

  const play = useGamePlay({
    childId,
    planetSlug: 'numeris',
    activitySlug: 'rocket-math',
    defaultDomain: 'NUMERIC',
  });

  const round = rounds[index];
  const reached = altitude >= GOAL;

  const handleChoice = (i: number) => {
    if (feedback || reached) return;
    const isCorrect = i === round.correctIndex;

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? `rocket_calc_${round.op}_ok` : `rocket_calc_${round.op}_wrong`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { a: round.a, b: round.b, op: round.op, answer: round.answer, chosen: round.choices[i] },
    });

    if (isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        const newAlt = altitude + 1;
        setAltitude(newAlt);
        setFeedback(null);
        if (newAlt >= GOAL) {
          play.finish();
        } else if (index + 1 < rounds.length) {
          setIndex((j) => j + 1);
        } else {
          setRounds(Array.from({ length: 20 }, buildRound));
          setIndex(0);
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setFeedback(null);
        if (index + 1 < rounds.length) setIndex((j) => j + 1);
      }, 800);
    }
  };

  // Altitude percentage for visual
  const altPct = Math.min((altitude / GOAL) * 100, 100);

  return (
    <GameShell
      childId={childId}
      planetSlug="numeris"
      activitySlug="rocket-math"
      title="Fais décoller la fusée"
      instruction={`Chaque bonne réponse propulse la fusée d'un étage. Objectif : la lune (${GOAL} étages).`}
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      <div className="grid gap-8 sm:grid-cols-[280px_1fr] sm:items-center">
        {/* Left — Rocket visual */}
        <div
          className="relative h-[420px] overflow-hidden rounded-3xl border"
          style={{
            borderColor: 'var(--border-default)',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
          }}
        >
          {/* Stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                top: `${(i * 37) % 400}px`,
                left: `${(i * 53) % 260}px`,
                opacity: 0.6,
                animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
          {/* Moon at top */}
          <div
            className="absolute left-1/2 top-4 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full text-3xl"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24 60%, #92400e)',
              boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)',
            }}
          >
            {reached ? '🎯' : '🌕'}
          </div>
          {/* Rocket */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 text-6xl transition-all duration-700 ${shake ? 'shake' : ''}`}
            style={{
              bottom: `calc(${altPct * 0.78}% + 20px)`,
              filter: 'drop-shadow(0 0 20px rgba(14, 165, 233, 0.6))',
            }}
          >
            🚀
          </div>
          {/* Altitude label */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-mono font-medium"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
          >
            Altitude · {altitude} / {GOAL}
          </div>
        </div>

        {/* Right — Math problem */}
        <div className="flex flex-col items-center gap-8">
          {!reached ? (
            <>
              <div
                className="rounded-2xl border px-12 py-8 text-6xl font-bold"
                style={{
                  borderColor: 'var(--border-default)',
                  background: 'var(--bg-surface)',
                  color: 'var(--accent)',
                  boxShadow: '0 20px 40px -20px var(--accent-glow)',
                }}
              >
                {round.a} {round.op} {round.b} = ?
              </div>
              <div className="grid grid-cols-2 gap-3">
                {round.choices.map((c, i) => (
                  <button
                    key={`${index}-${c}`}
                    type="button"
                    onClick={() => handleChoice(i)}
                    disabled={feedback !== null}
                    className="h-16 w-20 rounded-2xl border-2 text-2xl font-bold transition"
                    style={
                      feedback && i === round.correctIndex
                        ? {
                            borderColor: 'var(--success)',
                            background: 'var(--green-pale)',
                            color: 'var(--success)',
                          }
                        : feedback === 'wrong' && i !== round.correctIndex
                          ? {
                              borderColor: 'var(--border-default)',
                              opacity: 0.5,
                              background: 'var(--bg-surface)',
                              color: 'var(--text-tertiary)',
                            }
                          : {
                              borderColor: 'var(--border-default)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                            }
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="pop-in flex flex-col items-center gap-4 text-center">
              <p className="text-7xl">🎉</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                Mission accomplie !
              </p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Tu as atteint la lune.
              </p>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
