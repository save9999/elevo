'use client';

import { useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Alphabos — « Le mot en pièces »
 *
 * Des lettres mélangées sont affichées. L'enfant clique dessus dans le bon ordre
 * pour reconstituer le mot. Les lettres cliquées s'empilent dans la zone de réponse.
 * Si erreur, l'enfant peut cliquer sur la dernière lettre placée pour la retirer.
 */

const WORDS = [
  'CHAT', 'LUNE', 'POMME', 'BRAS', 'FLEUR', 'VENT', 'PLUIE',
  'TERRE', 'CIEL', 'ROBE', 'MIEL', 'TAPIS', 'NUAGE', 'GRIS',
];
const ROUNDS = 6;

export function WordBuilder({ childId }: { childId: string }) {
  const words = useMemo(() => {
    return [...WORDS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
  }, []);
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'alphabos',
    activitySlug: 'word-builder',
    defaultDomain: 'READING_ACCURACY',
  });

  const target = words[index];
  const done = index >= words.length;

  const shuffled = useMemo(() => {
    if (done) return [];
    const indices = target.split('').map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done]);

  const currentWord = placed.map((i) => target[i]).join('');
  const isComplete = currentWord === target;

  const handlePick = (originalIndex: number) => {
    if (feedback || placed.includes(originalIndex)) return;
    const newPlaced = [...placed, originalIndex];
    setPlaced(newPlaced);

    const builtSoFar = newPlaced.map((i) => target[i]).join('');
    const expectedSoFar = target.slice(0, newPlaced.length);

    if (builtSoFar !== expectedSoFar) {
      // Mauvaise lettre — retirer
      play.record({ kind: 'answer_wrong', signal: `word_builder_wrong_${target}`, weight: 0.4 });
      setFeedback('wrong');
      setTimeout(() => {
        setPlaced(newPlaced.slice(0, -1));
        setFeedback(null);
      }, 500);
      return;
    }

    if (builtSoFar === target) {
      play.record({ kind: 'answer_correct', signal: `word_builder_ok_${target}`, weight: 0.3 });
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= words.length) play.finish();
        setIndex((j) => j + 1);
        setPlaced([]);
      }, 900);
    }
  };

  const handleRemoveLast = () => {
    if (feedback || placed.length === 0) return;
    setPlaced(placed.slice(0, -1));
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="alphabos"
      activitySlug="word-builder"
      title="Le mot en pièces"
      instruction="Clique les lettres dans le bon ordre pour reconstituer le mot."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          {/* Zone de réponse */}
          <div
            className="flex min-h-[80px] min-w-[300px] items-center justify-center gap-2 rounded-2xl border-2 p-4"
            style={{
              borderColor: isComplete ? 'var(--success)' : 'var(--border-default)',
              background: isComplete ? 'var(--green-pale)' : 'var(--bg-surface)',
              cursor: placed.length > 0 ? 'pointer' : 'default',
            }}
            onClick={handleRemoveLast}
            title={placed.length > 0 ? 'Cliquer pour retirer la dernière lettre' : ''}
          >
            {target.split('').map((_, i) => (
              <div
                key={i}
                className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-bold transition-all"
                style={{
                  background: placed[i] !== undefined ? 'var(--accent-pale)' : 'transparent',
                  border: placed[i] !== undefined ? '2px solid var(--accent)' : '2px dashed var(--border-default)',
                  color: placed[i] !== undefined ? 'var(--accent)' : 'transparent',
                }}
              >
                {placed[i] !== undefined ? target[placed[i]] : '_'}
              </div>
            ))}
          </div>

          {/* Lettres mélangées */}
          <div className="flex flex-wrap justify-center gap-3">
            {shuffled.map((origIdx) => {
              const letter = target[origIdx];
              const isUsed = placed.includes(origIdx);
              return (
                <button
                  key={`${index}-${origIdx}`}
                  type="button"
                  onClick={() => handlePick(origIdx)}
                  disabled={isUsed || feedback !== null}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-3xl font-bold transition"
                  style={
                    isUsed
                      ? {
                          borderColor: 'var(--border-subtle)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-disabled)',
                          opacity: 0.4,
                        }
                      : {
                          borderColor: 'var(--accent)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          boxShadow: '0 4px 12px -4px var(--accent-glow)',
                        }
                  }
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Mot {index + 1} / {words.length}
            {placed.length > 0 && ' · Clique sur la zone réponse pour corriger'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-6xl">📝</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            Tous les mots reconstruits !
          </p>
        </div>
      )}
    </GameShell>
  );
}
