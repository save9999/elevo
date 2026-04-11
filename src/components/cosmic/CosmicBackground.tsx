/**
 * CosmicBackground — fond céleste éditorial.
 *
 * Plusieurs couches :
 *  1. Champ d'étoiles fixe (densité variable, twinkle décalé)
 *  2. Constellations dessinées (lignes pointillées entre étoiles)
 *  3. Nébuleuses volumétriques (3 blobs colorés flous, drift lent)
 *  4. Grain texturé via globals.css (.grain)
 *
 * Pas de canvas, pas de WebGL — full SVG/CSS pour rester léger.
 */
export function CosmicBackground({
  variant = 'default',
}: {
  variant?: 'default' | 'warm' | 'cool' | 'storm';
}) {
  const palette = PALETTES[variant];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Background base color (additionnel à celui de la page) */}
      <div className="absolute inset-0" style={{ backgroundColor: palette.base }} />

      {/* Nebulae — 3 large blurred blobs with parallax-like drift */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: palette.nebula1,
          top: '5%',
          left: '-15%',
          opacity: 0.5,
          animation: 'nebula-drift 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-[700px] w-[700px] rounded-full blur-[140px]"
        style={{
          background: palette.nebula2,
          bottom: '-20%',
          right: '-10%',
          opacity: 0.45,
          animation: 'nebula-drift 28s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{
          background: palette.nebula3,
          top: '30%',
          right: '20%',
          opacity: 0.35,
          animation: 'nebula-drift 35s ease-in-out infinite',
        }}
      />

      {/* Stars — SVG layer with constellations */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="big-star">
            <stop offset="0%" stopColor="white" />
            <stop offset="50%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Tiny star field */}
        {STARS.map((s, i) => (
          <circle
            key={`s-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={s.o}
            style={{
              transformOrigin: `${s.x}px ${s.y}px`,
              animation: `star-twinkle ${s.t}s ease-in-out infinite ${s.d}s`,
            }}
          />
        ))}

        {/* Bigger glowing stars */}
        {BIG_STARS.map((s, i) => (
          <g key={`bs-${i}`}>
            <circle cx={s.x} cy={s.y} r={s.r * 4} fill="url(#big-star)" opacity={s.o} />
            <circle cx={s.x} cy={s.y} r={s.r} fill="white" />
            {/* Cross sparkle */}
            <line
              x1={s.x - s.r * 5}
              y1={s.y}
              x2={s.x + s.r * 5}
              y2={s.y}
              stroke="white"
              strokeWidth="0.4"
              opacity={s.o * 0.8}
            />
            <line
              x1={s.x}
              y1={s.y - s.r * 5}
              x2={s.x}
              y2={s.y + s.r * 5}
              stroke="white"
              strokeWidth="0.4"
              opacity={s.o * 0.8}
            />
          </g>
        ))}

        {/* Constellations — dotted lines between selected stars */}
        {CONSTELLATIONS.map((c, i) => (
          <polyline
            key={`c-${i}`}
            points={c.points}
            fill="none"
            stroke={palette.constellation}
            strokeWidth="0.6"
            strokeDasharray="2 4"
            opacity="0.4"
            style={{ animation: 'constellation-pulse 8s ease-in-out infinite' }}
          />
        ))}
      </svg>
    </div>
  );
}

const PALETTES = {
  default: {
    base: '#0a0e27',
    nebula1: 'radial-gradient(circle, #4338ca 0%, transparent 70%)',
    nebula2: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
    nebula3: 'radial-gradient(circle, #0891b2 0%, transparent 70%)',
    constellation: '#fbbf24',
  },
  warm: {
    base: '#1a0a1f',
    nebula1: 'radial-gradient(circle, #c026d3 0%, transparent 70%)',
    nebula2: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
    nebula3: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
    constellation: '#fde68a',
  },
  cool: {
    base: '#040920',
    nebula1: 'radial-gradient(circle, #0284c7 0%, transparent 70%)',
    nebula2: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
    nebula3: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
    constellation: '#67e8f9',
  },
  storm: {
    base: '#0a0a18',
    nebula1: 'radial-gradient(circle, #475569 0%, transparent 70%)',
    nebula2: 'radial-gradient(circle, #1e293b 0%, transparent 70%)',
    nebula3: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
    constellation: '#94a3b8',
  },
};

// Pre-computed star field — deterministic, never changes between SSR/client
const STARS: Array<{ x: number; y: number; r: number; o: number; t: number; d: number }> = [
  { x: 80, y: 60, r: 0.7, o: 0.6, t: 4, d: 0 },
  { x: 230, y: 110, r: 0.5, o: 0.5, t: 5, d: 1 },
  { x: 410, y: 80, r: 0.9, o: 0.8, t: 3.5, d: 0.5 },
  { x: 570, y: 200, r: 0.6, o: 0.55, t: 4.5, d: 1.5 },
  { x: 720, y: 50, r: 1.1, o: 0.85, t: 3, d: 0.2 },
  { x: 880, y: 180, r: 0.6, o: 0.5, t: 5.5, d: 0.8 },
  { x: 1040, y: 90, r: 0.8, o: 0.7, t: 4, d: 1.2 },
  { x: 1200, y: 230, r: 0.5, o: 0.45, t: 6, d: 0.4 },
  { x: 1360, y: 60, r: 0.9, o: 0.75, t: 3.8, d: 1.6 },
  { x: 1530, y: 140, r: 0.7, o: 0.6, t: 4.2, d: 0.9 },
  { x: 50, y: 290, r: 0.8, o: 0.65, t: 5, d: 0.3 },
  { x: 200, y: 380, r: 0.6, o: 0.5, t: 4.8, d: 1.1 },
  { x: 380, y: 320, r: 1, o: 0.8, t: 3.2, d: 0.6 },
  { x: 540, y: 410, r: 0.5, o: 0.45, t: 5.5, d: 1.4 },
  { x: 690, y: 360, r: 0.7, o: 0.6, t: 4, d: 0 },
  { x: 850, y: 470, r: 1.1, o: 0.85, t: 3.5, d: 0.7 },
  { x: 1010, y: 290, r: 0.6, o: 0.55, t: 5, d: 1.3 },
  { x: 1180, y: 400, r: 0.8, o: 0.7, t: 4.5, d: 0.5 },
  { x: 1340, y: 350, r: 0.5, o: 0.5, t: 5.8, d: 1.7 },
  { x: 1500, y: 280, r: 0.9, o: 0.75, t: 3.7, d: 0.8 },
  { x: 100, y: 530, r: 0.7, o: 0.6, t: 4.6, d: 0.2 },
  { x: 270, y: 600, r: 0.6, o: 0.5, t: 5.2, d: 1.5 },
  { x: 440, y: 540, r: 0.9, o: 0.75, t: 3.4, d: 0.6 },
  { x: 600, y: 650, r: 0.5, o: 0.45, t: 5.6, d: 1.1 },
  { x: 760, y: 580, r: 1, o: 0.8, t: 3.8, d: 0.4 },
  { x: 920, y: 700, r: 0.7, o: 0.6, t: 4.3, d: 1.2 },
  { x: 1080, y: 540, r: 0.6, o: 0.55, t: 5.1, d: 0.7 },
  { x: 1250, y: 660, r: 0.8, o: 0.7, t: 4.4, d: 1.6 },
  { x: 1410, y: 590, r: 0.5, o: 0.5, t: 5.7, d: 0.3 },
  { x: 1560, y: 510, r: 0.9, o: 0.75, t: 3.6, d: 1 },
  { x: 60, y: 800, r: 0.7, o: 0.6, t: 4.9, d: 0.9 },
  { x: 220, y: 850, r: 0.5, o: 0.45, t: 5.3, d: 0.1 },
  { x: 390, y: 780, r: 1, o: 0.8, t: 3.3, d: 1.4 },
  { x: 560, y: 920, r: 0.6, o: 0.55, t: 5.4, d: 0.5 },
  { x: 720, y: 830, r: 0.8, o: 0.7, t: 4.1, d: 1.3 },
  { x: 890, y: 880, r: 0.5, o: 0.5, t: 6, d: 0.7 },
  { x: 1050, y: 770, r: 0.9, o: 0.75, t: 3.9, d: 1.5 },
  { x: 1220, y: 900, r: 0.7, o: 0.6, t: 4.7, d: 0.4 },
  { x: 1380, y: 820, r: 0.6, o: 0.55, t: 5.5, d: 1.1 },
  { x: 1540, y: 930, r: 1, o: 0.85, t: 3.1, d: 0.6 },
];

const BIG_STARS: Array<{ x: number; y: number; r: number; o: number }> = [
  { x: 320, y: 180, r: 1.5, o: 0.9 },
  { x: 980, y: 130, r: 1.2, o: 0.85 },
  { x: 1450, y: 220, r: 1.4, o: 0.8 },
  { x: 250, y: 480, r: 1.3, o: 0.85 },
  { x: 1100, y: 480, r: 1.6, o: 0.95 },
  { x: 720, y: 720, r: 1.4, o: 0.85 },
  { x: 1380, y: 750, r: 1.2, o: 0.8 },
];

// Constellations — sets of points forming shapes
const CONSTELLATIONS: Array<{ points: string }> = [
  { points: '320,180 410,80 570,200 720,50' },
  { points: '980,130 1100,290 1200,230 1340,350' },
  { points: '250,480 380,320 540,410 690,360' },
  { points: '850,470 1080,540 1180,400 1100,480' },
];
