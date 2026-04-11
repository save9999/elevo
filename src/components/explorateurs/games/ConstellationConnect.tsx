'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Geometra — « Dessine la constellation »
 *
 * Une constellation est affichée avec ses étoiles et ses lignes déjà tracées
 * en pointillés (modèle). L'enfant doit cliquer les étoiles dans le bon ordre
 * pour tracer la constellation. À chaque clic correct, la ligne solide
 * apparaît ; à chaque clic faux, l'étoile clignote en rouge et il faut
 * recommencer la dernière étape.
 */

type Point = { x: number; y: number };

interface Constellation {
  name: string;
  points: Point[]; // ordre de connexion
}

const CONSTELLATIONS: Constellation[] = [
  {
    name: 'Le triangle',
    points: [
      { x: 50, y: 20 },
      { x: 80, y: 75 },
      { x: 20, y: 75 },
      { x: 50, y: 20 },
    ],
  },
  {
    name: 'La maison',
    points: [
      { x: 20, y: 80 },
      { x: 80, y: 80 },
      { x: 80, y: 40 },
      { x: 50, y: 15 },
      { x: 20, y: 40 },
      { x: 20, y: 80 },
    ],
  },
  {
    name: "L'étoile",
    points: [
      { x: 50, y: 15 },
      { x: 60, y: 45 },
      { x: 90, y: 45 },
      { x: 65, y: 62 },
      { x: 75, y: 90 },
      { x: 50, y: 72 },
      { x: 25, y: 90 },
      { x: 35, y: 62 },
      { x: 10, y: 45 },
      { x: 40, y: 45 },
      { x: 50, y: 15 },
    ],
  },
  {
    name: 'La flèche',
    points: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
      { x: 65, y: 30 },
      { x: 80, y: 50 },
      { x: 65, y: 70 },
    ],
  },
  {
    name: 'Le losange',
    points: [
      { x: 50, y: 15 },
      { x: 85, y: 50 },
      { x: 50, y: 85 },
      { x: 15, y: 50 },
      { x: 50, y: 15 },
    ],
  },
];

export function ConstellationConnect({ childId }: { childId: string }) {
  const levels = useMemo(
    () => [...CONSTELLATIONS].sort(() => Math.random() - 0.5).slice(0, 4),
    [],
  );
  const [levelIndex, setLevelIndex] = useState(0);
  const [step, setStep] = useState(0); // next index to click
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);

  const play = useGamePlay({
    childId,
    planetSlug: 'geometra',
    activitySlug: 'constellation-connect',
    defaultDomain: 'VISUO_SPATIAL',
  });

  const level = levels[levelIndex];
  const done = levelIndex >= levels.length;

  const handleClick = (i: number) => {
    if (levelComplete || wrongIndex !== null || done) return;
    if (i === step) {
      const newStep = step + 1;
      play.record({
        kind: 'answer_correct',
        signal: `constellation_step_ok_${level.name}`,
        weight: 0.3,
      });
      setStep(newStep);
      if (newStep >= level.points.length) {
        setLevelComplete(true);
        setTimeout(() => {
          if (levelIndex + 1 >= levels.length) {
            play.finish();
          }
          setLevelIndex((j) => j + 1);
          setStep(0);
          setLevelComplete(false);
        }, 1600);
      }
    } else {
      play.record({
        kind: 'answer_wrong',
        signal: `constellation_wrong_${level.name}`,
        weight: 0.5,
      });
      setWrongIndex(i);
      setTimeout(() => setWrongIndex(null), 700);
    }
  };

  // Reset step when level changes
  useEffect(() => {
    setStep(0);
    setLevelComplete(false);
  }, [levelIndex]);

  if (done) {
    return (
      <GameShell
        childId={childId}
        planetSlug="geometra"
        activitySlug="constellation-connect"
        title="Dessine la constellation"
        instruction="Bravo, tu as tracé toutes les constellations !"
        mood="happy"
        correct={play.correct}
        wrong={play.wrong}
        status={play.status}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-6xl">✨</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            Constellations terminées !
          </p>
        </div>
      </GameShell>
    );
  }

  // Compute visited lines (connecting first N points drawn so far)
  const drawnSegments: Array<[Point, Point]> = [];
  for (let i = 0; i < step - 1; i++) {
    drawnSegments.push([level.points[i], level.points[i + 1]]);
  }
  // Dotted guide segments (full template)
  const allSegments: Array<[Point, Point]> = [];
  for (let i = 0; i < level.points.length - 1; i++) {
    allSegments.push([level.points[i], level.points[i + 1]]);
  }

  return (
    <GameShell
      childId={childId}
      planetSlug="geometra"
      activitySlug="constellation-connect"
      title="Dessine la constellation"
      instruction={`Clique les étoiles dans l'ordre pour tracer « ${level.name} ».`}
      mood={levelComplete ? 'happy' : wrongIndex !== null ? 'gentle' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="relative h-[420px] w-[420px] rounded-3xl border-2 overflow-hidden"
          style={{
            borderColor: 'var(--border-default)',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          }}
        >
          {/* Twinkling stars background */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white"
              style={{
                top: `${(i * 37) % 400}px`,
                left: `${(i * 53) % 400}px`,
                opacity: 0.5,
                animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite ${i * 0.15}s`,
              }}
            />
          ))}

          {/* SVG overlay for lines + interactive stars */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: 'visible' }}
          >
            {/* Dotted guide lines */}
            {allSegments.map((seg, i) => (
              <line
                key={`guide-${i}`}
                x1={seg[0].x}
                y1={seg[0].y}
                x2={seg[1].x}
                y2={seg[1].y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.4"
                strokeDasharray="1 2"
              />
            ))}
            {/* Drawn lines */}
            {drawnSegments.map((seg, i) => (
              <line
                key={`drawn-${i}`}
                x1={seg[0].x}
                y1={seg[0].y}
                x2={seg[1].x}
                y2={seg[1].y}
                stroke="#fbbf24"
                strokeWidth="0.8"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))',
                }}
              />
            ))}
          </svg>

          {/* Interactive stars (deduplicated by position) */}
          {level.points.map((p, i) => {
            // Skip duplicates (last point == first point for closed shapes)
            if (i > 0 && i === level.points.length - 1 && p.x === level.points[0].x && p.y === level.points[0].y) {
              return null;
            }
            const isNext = i === step;
            const isDone = i < step;
            const isWrong = wrongIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(i)}
                disabled={levelComplete}
                className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xl transition-all"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  background: isDone
                    ? 'radial-gradient(circle, #fde68a, #fbbf24)'
                    : isWrong
                      ? 'radial-gradient(circle, #fda4af, #dc2626)'
                      : isNext
                        ? 'radial-gradient(circle, #fff, #7dd3fc)'
                        : 'radial-gradient(circle, #fff, #94a3b8)',
                  boxShadow: isDone
                    ? '0 0 20px rgba(251, 191, 36, 0.9)'
                    : isNext
                      ? '0 0 24px rgba(125, 211, 252, 0.9)'
                      : isWrong
                        ? '0 0 20px rgba(220, 38, 38, 0.9)'
                        : '0 0 8px rgba(255, 255, 255, 0.5)',
                  animation: isNext ? 'lumo-breathe 1.2s ease-in-out infinite' : 'none',
                }}
              >
                {isDone ? '★' : isNext ? '◉' : '·'}
              </button>
            );
          })}
        </div>

        <div
          className="rounded-full border px-5 py-2 text-sm font-medium"
          style={{
            borderColor: 'var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
          }}
        >
          {level.name} · étape {step} / {level.points.length - 1} · constellation{' '}
          {levelIndex + 1} / {levels.length}
        </div>
      </div>
    </GameShell>
  );
}
