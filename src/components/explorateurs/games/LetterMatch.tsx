'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'];
const ROUNDS = 8;

type Round = {
  target: string;
  choices: string[];
  correctIndex: number;
};

function buildRounds(): Round[] {
  const rounds: Round[] = [];
  const used = new Set<string>();
  while (rounds.length < ROUNDS) {
    const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (used.has(target)) continue;
    used.add(target);
    const distractors = LETTERS.filter((l) => l !== target)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [...distractors, target].sort(() => Math.random() - 0.5);
    rounds.push({ target, choices, correctIndex: choices.indexOf(target) });
  }
  return rounds;
}

export function LetterMatch({ childId }: { childId: string }) {
  const rounds = useMemo(buildRounds, []);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const play = useGamePlay({
    childId,
    planetSlug: 'alphabos',
    activitySlug: 'letter-match',
    defaultDomain: 'PHONOLOGY',
  });

  const round = rounds[index];
  const done = index >= ROUNDS;

  const handleChoice = (choiceIndex: number) => {
    if (feedback || done) return;
    const isCorrect = choiceIndex === round.correctIndex;
    const chosen = round.choices[choiceIndex];

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? `letter_match_${round.target}` : `letter_confusion_${round.target}_${chosen}`,
      weight: isCorrect ? 0.3 : 0.6,
      context: { target: round.target, chosen, correct: isCorrect },
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= ROUNDS) play.finish();
      setIndex((i) => i + 1);
    }, 700);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="alphabos"
      activitySlug="letter-match"
      title="Attrape la lettre"
      instruction="Clique sur la lettre minuscule qui correspond à la majuscule."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'idle'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-10">
          <div
            className="flex h-40 w-40 items-center justify-center rounded-3xl text-8xl font-bold"
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-default)',
              color: 'var(--accent)',
              boxShadow: '0 20px 60px -20px var(--accent-glow)',
            }}
          >
            {round.target}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {round.choices.map((c, i) => (
              <button
                key={`${round.target}-${i}`}
                type="button"
                onClick={() => handleChoice(i)}
                disabled={feedback !== null}
                className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 text-5xl font-semibold transition"
                style={
                  feedback && i === round.correctIndex
                    ? {
                        borderColor: 'var(--success)',
                        background: 'var(--green-pale)',
                        color: 'var(--success)',
                      }
                    : feedback === 'wrong' && i !== round.correctIndex
                      ? {
                          borderColor: 'var(--danger)',
                          background: '#fef2f2',
                          color: 'var(--danger)',
                          opacity: 0.6,
                        }
                      : {
                          borderColor: 'var(--border-default)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                        }
                }
              >
                {c.toLowerCase()}
              </button>
            ))}
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Manche {index + 1} / {ROUNDS}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-5xl">🌟</p>
          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Mission terminée !
          </p>
        </div>
      )}
    </GameShell>
  );
}
