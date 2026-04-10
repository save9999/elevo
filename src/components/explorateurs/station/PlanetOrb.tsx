'use client';

import clsx from 'clsx';
import type { Planet } from './planets-data';

/**
 * Une planète orbitale cliquable.
 *
 * Affichée comme un orbe coloré avec un halo, son emoji au centre et son nom
 * en dessous. Au hover, elle grossit légèrement et le halo s'intensifie.
 */
export function PlanetOrb({
  planet,
  onSelect,
}: {
  planet: Planet;
  onSelect?: (planet: Planet) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(planet)}
      className="group relative flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Planète ${planet.name} — ${planet.tagline}`}
    >
      <div
        className={clsx(
          'relative flex h-20 w-20 items-center justify-center rounded-full',
          'bg-gradient-to-br transition-all duration-500 ease-out',
          'group-hover:scale-110',
          planet.gradientFrom,
          planet.gradientTo,
          planet.halo,
        )}
      >
        {/* Highlight 3D */}
        <div className="absolute left-[22%] top-[22%] h-[30%] w-[30%] rounded-full bg-white/40 blur-sm" />
        {/* Emoji */}
        <span className="relative text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" aria-hidden>
          {planet.emoji}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-semibold text-slate-100">{planet.name}</span>
        <span className="text-[0.65rem] uppercase tracking-widest text-slate-400 transition-colors group-hover:text-indigo-300">
          {planet.tagline}
        </span>
      </div>
    </button>
  );
}
