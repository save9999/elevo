'use client';

import { useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Verbalia — « Le mélangeur de couleurs »
 *
 * On montre une couleur cible. L'enfant choisit quelles couleurs primaires
 * mélanger pour l'obtenir. Exercice de logique + vocabulaire des couleurs.
 * Pas de lecture requise — visuel pur.
 */

type Color = 'rouge' | 'bleu' | 'jaune';
type MixResult = { colors: Color[]; result: string; hex: string; name: string };

const MIXES: MixResult[] = [
  { colors: ['rouge', 'bleu'], result: 'violet', hex: '#8b5cf6', name: 'Violet' },
  { colors: ['rouge', 'jaune'], result: 'orange', hex: '#f97316', name: 'Orange' },
  { colors: ['bleu', 'jaune'], result: 'vert', hex: '#22c55e', name: 'Vert' },
  { colors: ['rouge'], result: 'rouge', hex: '#ef4444', name: 'Rouge' },
  { colors: ['bleu'], result: 'bleu', hex: '#3b82f6', name: 'Bleu' },
  { colors: ['jaune'], result: 'jaune', hex: '#eab308', name: 'Jaune' },
];

const PRIMARY: Array<{ color: Color; hex: string; label: string }> = [
  { color: 'rouge', hex: '#ef4444', label: 'Rouge' },
  { color: 'bleu', hex: '#3b82f6', label: 'Bleu' },
  { color: 'jaune', hex: '#eab308', label: 'Jaune' },
];

export function ColorMixer({ childId }: { childId: string }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Set<Color>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const rounds = MIXES;
  const play = useGamePlay({
    childId,
    planetSlug: 'verbalia',
    activitySlug: 'color-mixer',
    defaultDomain: 'READING_ACCURACY',
  });

  const target = rounds[index];
  const done = index >= rounds.length;

  const toggle = (c: Color) => {
    if (feedback) return;
    const next = new Set(selected);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setSelected(next);
  };

  const validate = () => {
    if (feedback || done) return;
    const selectedArr = [...selected].sort();
    const expectedArr = [...target.colors].sort();
    const isCorrect =
      selectedArr.length === expectedArr.length &&
      selectedArr.every((v, i) => v === expectedArr[i]);

    play.record({
      kind: isCorrect ? 'answer_correct' : 'answer_wrong',
      signal: isCorrect ? `color_ok_${target.result}` : `color_wrong_${target.result}`,
      weight: isCorrect ? 0.3 : 0.5,
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      setSelected(new Set());
      if (index + 1 >= rounds.length) play.finish();
      setIndex((j) => j + 1);
    }, 900);
  };

  return (
    <GameShell
      childId={childId}
      planetSlug="verbalia"
      activitySlug="color-mixer"
      title="Le mélangeur de couleurs"
      instruction="Sélectionne les couleurs à mélanger pour obtenir la couleur cible."
      mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-8">
          {/* Target color */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Obtiens cette couleur :
            </p>
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg"
              style={{ background: target.hex }}
            >
              {target.name}
            </div>
          </div>

          {/* Primary color buttons */}
          <div className="flex gap-4">
            {PRIMARY.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => toggle(p.color)}
                disabled={feedback !== null}
                className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 text-sm font-semibold transition"
                style={{
                  borderColor: selected.has(p.color) ? p.hex : 'var(--border-default)',
                  background: selected.has(p.color) ? p.hex : 'var(--bg-surface)',
                  color: selected.has(p.color) ? 'white' : 'var(--text-primary)',
                  boxShadow: selected.has(p.color)
                    ? `0 8px 24px -8px ${p.hex}60`
                    : 'none',
                  transform: selected.has(p.color) ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ background: p.hex, border: '2px solid rgba(255,255,255,0.3)' }}
                />
                {p.label}
              </button>
            ))}
          </div>

          {/* Preview du mélange */}
          {selected.size > 0 && (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-sm text-white shadow-md"
              style={{
                background: getMixHex([...selected]),
              }}
            >
              ?
            </div>
          )}

          <button
            type="button"
            onClick={validate}
            disabled={selected.size === 0 || feedback !== null}
            className="rounded-full px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            Mélanger !
          </button>

          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Couleur {index + 1} / {rounds.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-6xl">🎨</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            Artiste des couleurs !
          </p>
        </div>
      )}
    </GameShell>
  );
}

function getMixHex(colors: Color[]): string {
  const sorted = [...colors].sort();
  const key = sorted.join('+');
  const map: Record<string, string> = {
    'bleu': '#3b82f6',
    'jaune': '#eab308',
    'rouge': '#ef4444',
    'bleu+rouge': '#8b5cf6',
    'jaune+rouge': '#f97316',
    'bleu+jaune': '#22c55e',
    'bleu+jaune+rouge': '#78716c',
  };
  return map[key] ?? '#94a3b8';
}
