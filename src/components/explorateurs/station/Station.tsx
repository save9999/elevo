'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LumoSphere } from '../lumo/LumoSphere';
import { IllustratedPlanet, type PlanetKind } from '../../cosmic/IllustratedPlanet';
import { PLANETS, type Planet } from './planets-data';

const PLANET_KINDS: Record<string, PlanetKind> = {
  alphabos: 'lettres',
  numeris: 'nombres',
  scripta: 'ecriture',
  verbalia: 'langage',
  memoria: 'memoire',
  geometra: 'espace',
};

export function Station({
  onPlanetSelect,
  cabinetHref,
}: {
  onPlanetSelect?: (planet: Planet) => void;
  cabinetHref?: string;
}) {
  const [hovered, setHovered] = useState<Planet | null>(null);
  const radius = 280;

  return (
    <div className="relative mx-auto flex min-h-[760px] w-full max-w-6xl items-center justify-center">
      {/* Decorative orbit rings */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: radius * 2 + 100,
          height: radius * 2 + 100,
          border: '1px dashed var(--ink-500)',
        }}
      />
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: radius * 2 + 200,
          height: radius * 2 + 200,
          border: '1px solid var(--ink-500)',
        }}
      />

      {/* Center : LUMO + label */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        {cabinetHref ? (
          <Link
            href={cabinetHref}
            className="rounded-full p-2 outline-none transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            aria-label="Entrer dans le Cabinet de LUMO"
          >
            <LumoSphere mood={hovered ? 'thinking' : 'idle'} size="xl" />
          </Link>
        ) : (
          <LumoSphere mood={hovered ? 'thinking' : 'idle'} size="xl" />
        )}

        <div className="min-h-[80px] text-center">
          <p className="eyebrow">
            <span className="deco-rule" />
            Station Elevo
          </p>
          <p
            className="mt-3 editorial-italic text-2xl transition-all"
            style={{
              color: hovered ? 'var(--gold-bright)' : 'var(--paper-muted)',
            }}
          >
            {hovered ? hovered.name : 'Choisis une planète'}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--paper-dim)' }}>
            {hovered ? hovered.domain : 'ou clique sur LUMO pour le Cabinet'}
          </p>
        </div>
      </div>

      {/* Planets in orbit */}
      <div className="absolute inset-0 flex items-center justify-center motion-safe:animate-[orbit-slow_180s_linear_infinite]">
        {PLANETS.map((planet, i) => {
          const angle = (360 / PLANETS.length) * i - 90;
          return (
            <div
              key={planet.slug}
              className="absolute"
              style={{
                transform: `rotate(${angle}deg) translateX(${radius}px)`,
              }}
            >
              <div
                className="motion-safe:animate-[orbit-counter-slow_180s_linear_infinite]"
                style={{ transform: `rotate(${-angle}deg)` }}
                onMouseEnter={() => setHovered(planet)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  onClick={() => onPlanetSelect?.(planet)}
                  className="group flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ink-900)]"
                  aria-label={`Planète ${planet.name}`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    <IllustratedPlanet
                      kind={PLANET_KINDS[planet.slug]}
                      size={120}
                    />
                  </div>
                  <p
                    className="editorial-italic text-base transition"
                    style={{
                      color: 'var(--paper)',
                      opacity: hovered?.slug === planet.slug ? 1 : 0.75,
                    }}
                  >
                    {planet.name}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
