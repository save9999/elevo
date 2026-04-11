'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Memoria — « Les paires mystérieuses »
 *
 * 12 cartes face cachée (6 paires d'emojis). L'enfant retourne 2 cartes à la fois :
 * si elles correspondent, elles restent visibles. Sinon, elles reviennent face cachée
 * après 0.8s. Objectif : trouver toutes les paires avec le moins de tentatives.
 *
 * Mécanique classique de memory game, ultra satisfaisante, zéro lecture requise.
 */

const EMOJIS = ['🚀', '🪐', '🌟', '🌙', '☄️', '👽'];

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): Card[] {
  const deck: Card[] = [];
  EMOJIS.forEach((emoji, i) => {
    deck.push({ id: i * 2, emoji, pairId: i, flipped: false, matched: false });
    deck.push({ id: i * 2 + 1, emoji, pairId: i, flipped: false, matched: false });
  });
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function MemoryPairs({ childId }: { childId: string }) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const play = useGamePlay({
    childId,
    planetSlug: 'memoria',
    activitySlug: 'memory-pairs',
    defaultDomain: 'MEMORY',
  });

  const allMatched = useMemo(() => deck.every((c) => c.matched), [deck]);

  useEffect(() => {
    if (allMatched && play.status !== 'done') {
      play.finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  const handleFlip = (id: number) => {
    if (selected.length >= 2) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newDeck = deck.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newSelected = [...selected, id];
    setDeck(newDeck);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setAttempts((a) => a + 1);
      const [firstId, secondId] = newSelected;
      const first = newDeck.find((c) => c.id === firstId)!;
      const second = newDeck.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId) {
        // Match !
        play.record({
          kind: 'answer_correct',
          signal: `memory_pair_match_${first.emoji}`,
          weight: 0.3,
        });
        setFeedback('correct');
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c,
            ),
          );
          setSelected([]);
          setFeedback(null);
        }, 500);
      } else {
        // Mismatch
        play.record({
          kind: 'answer_wrong',
          signal: `memory_pair_mismatch`,
          weight: 0.4,
        });
        setFeedback('wrong');
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, flipped: false }
                : c,
            ),
          );
          setSelected([]);
          setFeedback(null);
        }, 900);
      }
    }
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="memoria"
      activitySlug="memory-pairs"
      title="Les paires mystérieuses"
      instruction="Retourne deux cartes à la fois pour trouver les paires identiques."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {deck.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card.id)}
              disabled={card.flipped || card.matched || allMatched}
              className="relative h-24 w-24 rounded-2xl transition-all duration-500 sm:h-28 sm:w-28"
              style={{
                perspective: '1000px',
              }}
              aria-label={card.matched || card.flipped ? `Carte ${card.emoji}` : 'Carte face cachée'}
            >
              <div
                className="absolute inset-0 rounded-2xl border-2 transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 text-4xl font-bold"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 100%)',
                    borderColor: 'var(--accent)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px var(--accent-glow)',
                  }}
                >
                  ?
                </div>
                {/* Front */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 text-5xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.matched ? 'var(--green-pale)' : 'var(--bg-surface)',
                    borderColor: card.matched ? 'var(--success)' : 'var(--accent)',
                    boxShadow: card.matched
                      ? '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                      : '0 10px 25px -5px var(--accent-glow)',
                  }}
                >
                  {card.emoji}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div
          className="rounded-full border px-5 py-2 text-sm font-medium"
          style={{
            borderColor: 'var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
          }}
        >
          Tentatives : {attempts} · Paires trouvées :{' '}
          {deck.filter((c) => c.matched).length / 2} / {EMOJIS.length}
        </div>

        {allMatched && (
          <div className="pop-in flex flex-col items-center gap-2 text-center">
            <p className="text-6xl">🎉</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
              Toutes les paires trouvées !
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              En {attempts} tentatives. Incroyable !
            </p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
