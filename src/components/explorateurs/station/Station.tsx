'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { LumoSphere } from '../lumo/LumoSphere';
import { PlanetOrb } from './PlanetOrb';
import { PLANETS, type Planet } from './planets-data';

/**
 * Le hub Station Elevo.
 *
 * Affiche la station centrale (LUMO) entourée des 6 planètes en cercle.
 * Chaque planète est positionnée via CSS transform en orbite autour du centre.
 *
 * La rotation globale est réversible via `prefers-reduced-motion` qui est
 * géré dans globals.css.
 */
export function Station({
  onPlanetSelect,
  cabinetHref,
}: {
  onPlanetSelect?: (planet: Planet) => void;
  cabinetHref?: string;
}) {
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const radius = 240; // px — rayon de l'orbite

  return (
    <div className="relative mx-auto flex min-h-[640px] w-full max-w-5xl items-center justify-center">
      {/* Anneau d'orbite visible */}
      <div
        className="absolute rounded-full border border-dashed border-indigo-500/20"
        style={{
          width: radius * 2 + 80,
          height: radius * 2 + 80,
        }}
      />
      <div
        className="absolute rounded-full border border-indigo-500/10"
        style={{
          width: radius * 2 + 180,
          height: radius * 2 + 180,
        }}
      />

      {/* Station centrale = LUMO + accès Cabinet */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {cabinetHref ? (
          <Link
            href={cabinetHref}
            className="rounded-full p-2 outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Entrer dans le Cabinet de LUMO"
          >
            <LumoSphere mood="idle" size="xl" />
          </Link>
        ) : (
          <LumoSphere mood="idle" size="xl" />
        )}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
            Station Elevo
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {hoveredPlanet
              ? `${hoveredPlanet.name} · ${hoveredPlanet.domain}`
              : cabinetHref
                ? 'Choisis une planète, ou clique sur LUMO pour le Cabinet'
                : 'Choisis une planète pour commencer'}
          </p>
        </div>
      </div>

      {/* 6 planètes disposées en cercle */}
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center',
          'motion-safe:animate-[planet-orbit_120s_linear_infinite]',
        )}
      >
        {PLANETS.map((planet, i) => {
          const angle = (360 / PLANETS.length) * i - 90; // -90 pour commencer en haut
          return (
            <div
              key={planet.slug}
              className="absolute"
              style={{
                transform: `rotate(${angle}deg) translateX(${radius}px)`,
              }}
            >
              {/* Contre-rotation pour garder la planète droite malgré la rotation du container */}
              <div
                className="motion-safe:animate-[planet-counter-orbit_120s_linear_infinite]"
                style={{
                  transform: `rotate(${-angle}deg)`,
                }}
                onMouseEnter={() => setHoveredPlanet(planet)}
                onMouseLeave={() => setHoveredPlanet(null)}
              >
                <PlanetOrb planet={planet} onSelect={onPlanetSelect} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
