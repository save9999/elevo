'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { LumoSphere, type LumoMood } from '../lumo/LumoSphere';

/**
 * Cadre visuel commun à tous les mini-jeux : header avec LUMO qui encourage,
 * zone de jeu centrale, footer avec score et bouton quitter.
 */
export function GameShell({
  childId,
  planetSlug,
  activitySlug,
  title,
  instruction,
  mood = 'idle',
  correct,
  wrong,
  children,
  onFinish,
  status,
}: {
  childId: string;
  planetSlug: string;
  activitySlug: string;
  title: string;
  instruction: string;
  mood?: LumoMood;
  correct: number;
  wrong: number;
  children: React.ReactNode;
  onFinish?: () => void;
  status: 'idle' | 'ready' | 'playing' | 'done';
}) {
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_60%,white_,transparent_50%),radial-gradient(1px_1px_at_40%_80%,white_,transparent_50%)]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href={`/explorateurs/${childId}/planet/${planetSlug}`}
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Retour à la planète
        </Link>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
          <span className="text-emerald-300">✓ {correct}</span>
          <span className="text-rose-300">✗ {wrong}</span>
          {total > 0 && <span className="text-indigo-300">{accuracy}%</span>}
        </div>
      </header>

      {/* LUMO + titre */}
      <section className="relative z-10 mx-auto mt-4 flex max-w-4xl flex-col items-center gap-3 px-6 text-center">
        <LumoSphere mood={mood} size="md" />
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-400">{instruction}</p>
      </section>

      {/* Zone de jeu */}
      <section
        className={clsx(
          'relative z-10 mx-auto mt-8 max-w-4xl px-6 pb-24',
          status === 'done' && 'opacity-70',
        )}
      >
        {children}
      </section>

      {status === 'done' && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <p className="text-sm text-slate-300">
              Bravo ! Tu as réussi <strong className="text-indigo-300">{correct}</strong>{' '}
              fois sur {total}.
            </p>
            <div className="flex gap-2">
              <Link
                href={`/explorateurs/${childId}/planet/${planetSlug}`}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm hover:border-slate-500"
              >
                Autre activité
              </Link>
              <Link
                href={`/explorateurs/${childId}`}
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
              >
                Retour à la Station
              </Link>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
