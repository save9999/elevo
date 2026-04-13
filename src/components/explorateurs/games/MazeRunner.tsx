'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGamePlay } from './useGamePlay';
import { GameShell } from './GameShell';

/**
 * Mini-jeu Geometra — « Le labyrinthe de LUMO »
 *
 * Grille 7×7 avec un chemin à suivre du coin haut-gauche au coin bas-droite.
 * L'enfant clique ou utilise les flèches du clavier pour se déplacer.
 * Murs en gris, chemin en blanc, position de l'enfant en bleu avec glow.
 * Collecte les étoiles ⭐ sur le chemin.
 *
 * Mesure : orientation spatiale, planification de chemin.
 */

const SIZE = 7;

// Maze fixe (0 = mur, 1 = chemin, 2 = étoile)
const MAZES: number[][][] = [
  [
    [1,1,0,0,0,0,0],
    [0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,2,1,1,2,0],
    [0,0,0,0,0,1,0],
    [0,0,0,0,2,1,0],
    [0,0,0,0,0,1,1],
  ],
  [
    [1,0,0,0,0,0,0],
    [1,1,2,0,0,0,0],
    [0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0],
    [0,0,2,0,1,0,0],
    [0,0,0,0,1,2,0],
    [0,0,0,0,1,1,1],
  ],
  [
    [1,1,1,1,0,0,0],
    [0,0,0,1,2,0,0],
    [0,0,0,1,1,1,0],
    [0,0,0,0,0,1,0],
    [0,0,0,2,0,1,0],
    [0,0,0,0,0,1,2],
    [0,0,0,0,0,0,1],
  ],
];

export function MazeRunner({ childId }: { childId: string }) {
  const [level, setLevel] = useState(0);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [stars, setStars] = useState(0);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const play = useGamePlay({
    childId,
    planetSlug: 'geometra',
    activitySlug: 'maze-runner',
    defaultDomain: 'VISUO_SPATIAL',
  });

  const maze = MAZES[level % MAZES.length];
  const done = level >= MAZES.length;

  const tryMove = useCallback(
    (dr: number, dc: number) => {
      if (won || done) return;
      const [r, c] = pos;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
      if (maze[nr][nc] === 0) return;

      setPos([nr, nc]);
      setMoves((m) => m + 1);

      const key = `${nr},${nc}`;
      if (maze[nr][nc] === 2 && !collected.has(key)) {
        setCollected((prev) => new Set(prev).add(key));
        setStars((s) => s + 1);
        play.record({ kind: 'answer_correct', signal: 'maze_star_collected', weight: 0.3 });
      }

      // Win condition
      if (nr === SIZE - 1 && nc === SIZE - 1) {
        play.record({ kind: 'answer_correct', signal: `maze_complete_${level}`, weight: 0.4 });
        setWon(true);
        setTimeout(() => {
          if (level + 1 >= MAZES.length) {
            play.finish();
          } else {
            setLevel((l) => l + 1);
            setPos([0, 0]);
            setCollected(new Set());
            setWon(false);
          }
        }, 1200);
      }
    },
    [pos, maze, won, done, collected, level, play],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') tryMove(-1, 0);
      if (e.key === 'ArrowDown') tryMove(1, 0);
      if (e.key === 'ArrowLeft') tryMove(0, -1);
      if (e.key === 'ArrowRight') tryMove(0, 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tryMove]);

  return (
    <GameShell
      childId={childId}
      planetSlug="geometra"
      activitySlug="maze-runner"
      title="Le labyrinthe de LUMO"
      instruction="Va du coin en haut à gauche vers la sortie en bas à droite. Collecte les étoiles sur ton chemin !"
      mood={won ? 'happy' : 'thinking'}
      correct={play.correct}
      wrong={play.wrong}
      status={play.status}
    >
      {!done ? (
        <div className="flex flex-col items-center gap-6">
          {/* Maze grid */}
          <div
            className="inline-grid gap-1 rounded-2xl border-2 p-3"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              borderColor: 'var(--border-default)',
              background: 'var(--bg-surface)',
              boxShadow: '0 10px 30px -10px var(--accent-glow)',
            }}
          >
            {maze.flatMap((row, r) =>
              row.map((cell, c) => {
                const isPlayer = r === pos[0] && c === pos[1];
                const isEnd = r === SIZE - 1 && c === SIZE - 1;
                const isStar = cell === 2 && !collected.has(`${r},${c}`);
                const isPath = cell > 0;

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      const dr = r - pos[0];
                      const dc = c - pos[1];
                      if (Math.abs(dr) + Math.abs(dc) === 1) tryMove(dr, dc);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-xl transition-all sm:h-14 sm:w-14"
                    style={{
                      background: isPlayer
                        ? 'var(--accent)'
                        : isEnd
                          ? 'var(--green-pale)'
                          : isPath
                            ? 'var(--bg-elevated)'
                            : 'var(--border-default)',
                      boxShadow: isPlayer
                        ? '0 0 20px var(--accent-glow)'
                        : 'none',
                      cursor: isPath ? 'pointer' : 'default',
                    }}
                  >
                    {isPlayer && '🚀'}
                    {!isPlayer && isEnd && '🏁'}
                    {!isPlayer && isStar && '⭐'}
                  </button>
                );
              }),
            )}
          </div>

          {/* Controls mobile */}
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              type="button"
              onClick={() => tryMove(-1, 0)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl"
              style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
            >
              ↑
            </button>
            <div />
            <button
              type="button"
              onClick={() => tryMove(0, -1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl"
              style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => tryMove(1, 0)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl"
              style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => tryMove(0, 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl"
              style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
            >
              →
            </button>
          </div>

          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            ⭐ {stars} · {moves} pas · Labyrinthe {level + 1} / {MAZES.length}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-6xl">🏆</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            Tous les labyrinthes terminés !
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {stars} étoiles collectées en {moves} pas.
          </p>
        </div>
      )}
    </GameShell>
  );
}
