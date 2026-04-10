'use client';

import clsx from 'clsx';

export type LumoMood =
  | 'idle'
  | 'speaking'
  | 'thinking'
  | 'happy'
  | 'gentle'
  | 'sleeping';

export type LumoSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<LumoSize, { box: string; inner: string }> = {
  sm: { box: 'h-14 w-14', inner: 'inset-2' },
  md: { box: 'h-24 w-24', inner: 'inset-3' },
  lg: { box: 'h-40 w-40', inner: 'inset-5' },
  xl: { box: 'h-64 w-64', inner: 'inset-8' },
};

/**
 * LUMO — IA holographique.
 *
 * Une sphère lumineuse pulsante avec 6 états d'humeur, pilotée uniquement par CSS.
 * Aucune dépendance externe (pas de Lottie, pas de SVG animé).
 */
export function LumoSphere({
  mood = 'idle',
  size = 'md',
  className,
}: {
  mood?: LumoMood;
  size?: LumoSize;
  className?: string;
}) {
  const sz = SIZES[size];

  const moodClasses = {
    idle: {
      bg: 'from-sky-300 via-indigo-400 to-blue-600',
      glow: 'shadow-[0_0_60px_10px_rgba(99,102,241,0.55)]',
      anim: 'animate-[lumo-pulse_2.8s_ease-in-out_infinite]',
      ringOpacity: 'opacity-60',
    },
    speaking: {
      bg: 'from-sky-200 via-indigo-300 to-blue-500',
      glow: 'shadow-[0_0_80px_16px_rgba(129,140,248,0.75)]',
      anim: 'animate-[lumo-pulse_0.45s_ease-in-out_infinite]',
      ringOpacity: 'opacity-90',
    },
    thinking: {
      bg: 'from-emerald-200 via-teal-400 to-emerald-600',
      glow: 'shadow-[0_0_50px_10px_rgba(16,185,129,0.5)]',
      anim: 'animate-[lumo-pulse_4s_ease-in-out_infinite]',
      ringOpacity: 'opacity-80',
    },
    happy: {
      bg: 'from-amber-200 via-yellow-300 to-orange-400',
      glow: 'shadow-[0_0_80px_14px_rgba(251,191,36,0.7)]',
      anim: 'animate-[lumo-pulse_0.9s_ease-in-out_infinite]',
      ringOpacity: 'opacity-90',
    },
    gentle: {
      bg: 'from-pink-200 via-rose-300 to-pink-500',
      glow: 'shadow-[0_0_55px_10px_rgba(244,114,182,0.55)]',
      anim: 'animate-[lumo-pulse_3.2s_ease-in-out_infinite]',
      ringOpacity: 'opacity-70',
    },
    sleeping: {
      bg: 'from-slate-500 via-slate-600 to-slate-800',
      glow: 'shadow-[0_0_20px_4px_rgba(100,116,139,0.25)]',
      anim: '',
      ringOpacity: 'opacity-20',
    },
  } satisfies Record<LumoMood, { bg: string; glow: string; anim: string; ringOpacity: string }>;

  const m = moodClasses[mood];

  return (
    <div
      className={clsx(
        'relative flex items-center justify-center',
        sz.box,
        className,
      )}
      role="img"
      aria-label={`LUMO, ${mood}`}
    >
      {/* Anneau orbital externe */}
      <div
        className={clsx(
          'absolute inset-0 rounded-full border border-dashed border-indigo-300',
          m.ringOpacity,
        )}
        style={{ transform: 'rotate(20deg)' }}
      />
      {/* Anneau orbital interne */}
      <div
        className={clsx(
          'absolute inset-2 rounded-full border border-dashed border-sky-200/60',
        )}
        style={{ transform: 'rotate(-35deg)' }}
      />
      {/* Sphère centrale */}
      <div
        className={clsx(
          'absolute rounded-full bg-gradient-to-br',
          m.bg,
          m.glow,
          m.anim,
          sz.inner,
        )}
      >
        {/* Highlight top-left pour effet 3D */}
        <div className="absolute left-1/4 top-1/4 h-1/3 w-1/3 rounded-full bg-white/40 blur-md" />
      </div>
      {/* Deux yeux minimalistes */}
      {mood !== 'sleeping' && (
        <div className="pointer-events-none absolute z-10 flex gap-[0.35em] text-white">
          <span className="block h-[0.35em] w-[0.25em] rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <span className="block h-[0.35em] w-[0.25em] rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
        </div>
      )}
    </div>
  );
}
