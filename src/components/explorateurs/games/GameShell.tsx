'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LumoSphere, type LumoMood } from '../lumo/LumoSphere';
import { parcoursFromPath } from './parcours-context';

/**
 * GameShell — cadre commun light theme pour les mini-jeux.
 * Détecte automatiquement le parcours depuis l'URL pour construire les
 * liens de retour corrects (Station + Planète).
 */
export function GameShell({
  title,
  instruction,
  mood = 'idle',
  correct,
  wrong,
  children,
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
  const pathname = usePathname();
  const ctx = parcoursFromPath(pathname);
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <main className="relative min-h-screen sky-bg">
      <nav
        className="relative z-30 border-b"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
          <Link
            href={ctx.planetUrl}
            className="text-sm font-medium transition hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Retour à la planète
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span style={{ color: 'var(--success)' }}>✓ {correct}</span>
            <span style={{ color: 'var(--danger)' }}>✗ {wrong}</span>
            {total > 0 && (
              <span
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: 'var(--accent-pale)',
                  color: 'var(--accent)',
                }}
              >
                {accuracy}%
              </span>
            )}
          </div>
        </div>
      </nav>

      <section className="relative z-20 mx-auto mt-8 flex max-w-4xl flex-col items-center gap-4 px-6 text-center">
        <LumoSphere mood={mood} size="md" />
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="max-w-xl text-base" style={{ color: 'var(--text-secondary)' }}>
          {instruction}
        </p>
      </section>

      <section
        className={clsx(
          'relative z-10 mx-auto mt-10 max-w-4xl px-6 pb-24',
          status === 'done' && 'opacity-80',
        )}
      >
        {children}
      </section>

      {status === 'done' && (
        <footer
          className="fixed bottom-0 left-0 right-0 z-20 border-t"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Bravo ! Tu as réussi{' '}
              <strong style={{ color: 'var(--accent)' }}>{correct}</strong> fois sur {total}.
            </p>
            <div className="flex gap-2">
              <Link
                href={ctx.planetUrl}
                className="rounded-full border px-5 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                Autre activité
              </Link>
              <Link
                href={ctx.stationUrl}
                className="rounded-full px-5 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Station
              </Link>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
