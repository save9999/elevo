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

const SIZES: Record<LumoSize, number> = {
  sm: 64,
  md: 110,
  lg: 180,
  xl: 280,
};

/**
 * LUMO — l'IA holographique d'Elevo.
 *
 * Personnage SVG complet, conçu comme un esprit céleste à mi-chemin entre
 * une étoile et une créature. Pas un simple cercle gradient : un vrai
 * personnage avec yeux, expression, halo orbital et particules ambiantes.
 *
 * Tout est en SVG inline + animations CSS — zéro asset externe, zéro Lottie.
 * Léger et déformable à toutes les tailles.
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
  const px = SIZES[size];
  const moodCfg = MOODS[mood];

  return (
    <div
      className={clsx('relative inline-block', className)}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`LUMO, ${mood}`}
    >
      <svg
        viewBox="0 0 200 200"
        width={px}
        height={px}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Body radial gradient — depends on mood */}
          <radialGradient id={`lumo-body-${mood}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={moodCfg.bodyHighlight} />
            <stop offset="45%" stopColor={moodCfg.bodyMid} />
            <stop offset="100%" stopColor={moodCfg.bodyDeep} />
          </radialGradient>
          {/* Outer glow */}
          <radialGradient id={`lumo-glow-${mood}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={moodCfg.glow} stopOpacity="0.6" />
            <stop offset="50%" stopColor={moodCfg.glow} stopOpacity="0.2" />
            <stop offset="100%" stopColor={moodCfg.glow} stopOpacity="0" />
          </radialGradient>
          {/* Subtle inner shimmer */}
          <radialGradient id={`lumo-shimmer-${mood}`} cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer halo glow — VERY soft, large */}
        <circle
          cx="100"
          cy="100"
          r="98"
          fill={`url(#lumo-glow-${mood})`}
          style={{
            transformOrigin: '100px 100px',
            animation: mood === 'sleeping' ? 'none' : 'lumo-breathe 4s ease-in-out infinite',
          }}
        />

        {/* Orbital ring — outer, slow rotation */}
        <g
          style={{
            transformOrigin: '100px 100px',
            animation: mood === 'sleeping' ? 'none' : 'lumo-halo-spin 18s linear infinite',
          }}
        >
          <ellipse
            cx="100"
            cy="100"
            rx="86"
            ry="22"
            fill="none"
            stroke={moodCfg.ring}
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity={mood === 'sleeping' ? '0.2' : '0.55'}
            transform="rotate(-18 100 100)"
          />
          {/* Orbital dot to make rotation visible */}
          <circle cx="186" cy="100" r="2.5" fill={moodCfg.ring} opacity="0.85"
            transform="rotate(-18 100 100)" />
        </g>

        {/* Orbital ring — inner, counter-rotating */}
        <g
          style={{
            transformOrigin: '100px 100px',
            animation: mood === 'sleeping' ? 'none' : 'lumo-halo-spin-rev 26s linear infinite',
          }}
        >
          <ellipse
            cx="100"
            cy="100"
            rx="76"
            ry="14"
            fill="none"
            stroke={moodCfg.ringInner}
            strokeWidth="0.8"
            strokeDasharray="1 4"
            opacity={mood === 'sleeping' ? '0.1' : '0.4'}
            transform="rotate(28 100 100)"
          />
        </g>

        {/* Body container — breathes */}
        <g
          style={{
            transformOrigin: '100px 100px',
            animation: mood === 'sleeping' ? 'lumo-breathe 6s ease-in-out infinite' : `lumo-breathe ${moodCfg.breatheSpeed}s ease-in-out infinite`,
          }}
        >
          {/* Body sphere */}
          <circle cx="100" cy="100" r="52" fill={`url(#lumo-body-${mood})`} />

          {/* Top-left specular highlight (3D feel) */}
          <ellipse
            cx="82"
            cy="82"
            rx="20"
            ry="14"
            fill={`url(#lumo-shimmer-${mood})`}
            opacity="0.85"
          />

          {/* Subtle inner ring (energy core) */}
          <circle
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.15"
          />

          {/* === FACE === */}
          {/* Eyes */}
          {mood === 'sleeping' ? (
            <>
              {/* Closed eye lines */}
              <path d="M 78 102 Q 86 106 94 102" stroke={moodCfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 106 102 Q 114 106 122 102" stroke={moodCfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Eye whites */}
              <g style={{
                transformOrigin: '100px 100px',
                animation: 'lumo-blink 5s ease-in-out infinite',
              }}>
                <ellipse cx="86" cy="98" rx="7" ry="9" fill="white" opacity="0.95" />
                <ellipse cx="114" cy="98" rx="7" ry="9" fill="white" opacity="0.95" />
                {/* Pupils */}
                <circle cx={86 + moodCfg.pupilOffsetX} cy={98 + moodCfg.pupilOffsetY} r="3.5" fill={moodCfg.faceColor} />
                <circle cx={114 + moodCfg.pupilOffsetX} cy={98 + moodCfg.pupilOffsetY} r="3.5" fill={moodCfg.faceColor} />
                {/* Eye sparkle */}
                <circle cx={87 + moodCfg.pupilOffsetX} cy={96 + moodCfg.pupilOffsetY} r="1.2" fill="white" />
                <circle cx={115 + moodCfg.pupilOffsetX} cy={96 + moodCfg.pupilOffsetY} r="1.2" fill="white" />
              </g>
            </>
          )}

          {/* Mouth — varies by mood */}
          {mood === 'speaking' && (
            <ellipse cx="100" cy="120" rx="6" ry="4" fill={moodCfg.faceColor} />
          )}
          {mood === 'idle' && (
            <path d="M 92 120 Q 100 124 108 120" stroke={moodCfg.faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {mood === 'happy' && (
            <path d="M 88 118 Q 100 130 112 118" stroke={moodCfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mood === 'gentle' && (
            <path d="M 92 121 Q 100 124 108 121" stroke={moodCfg.faceColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}
          {mood === 'thinking' && (
            <line x1="94" y1="121" x2="106" y2="121" stroke={moodCfg.faceColor} strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Cheek blush for happy/gentle */}
          {(mood === 'happy' || mood === 'gentle') && (
            <>
              <ellipse cx="78" cy="113" rx="5" ry="3" fill={moodCfg.blush} opacity="0.65" />
              <ellipse cx="122" cy="113" rx="5" ry="3" fill={moodCfg.blush} opacity="0.65" />
            </>
          )}

          {/* Sleep Z */}
          {mood === 'sleeping' && (
            <text
              x="135"
              y="75"
              fontFamily="serif"
              fontSize="20"
              fill="white"
              opacity="0.6"
              fontStyle="italic"
            >
              z
            </text>
          )}

          {/* Thinking dots */}
          {mood === 'thinking' && (
            <g opacity="0.7">
              <circle cx="135" cy="60" r="2" fill={moodCfg.glow} />
              <circle cx="142" cy="55" r="1.6" fill={moodCfg.glow} />
              <circle cx="148" cy="50" r="1.2" fill={moodCfg.glow} />
            </g>
          )}
        </g>

        {/* Floating ambient particles (only when awake) */}
        {mood !== 'sleeping' && (
          <>
            <circle cx="35" cy="60" r="2" fill={moodCfg.particle1} style={{
              transformOrigin: '35px 60px',
              animation: 'lumo-particle-float 4s ease-in-out infinite',
            }} />
            <circle cx="170" cy="80" r="1.6" fill={moodCfg.particle2} style={{
              transformOrigin: '170px 80px',
              animation: 'lumo-particle-float-2 3.5s ease-in-out infinite 0.5s',
            }} />
            <circle cx="50" cy="155" r="2.2" fill={moodCfg.particle1} style={{
              transformOrigin: '50px 155px',
              animation: 'lumo-particle-float-3 5s ease-in-out infinite 1s',
            }} />
            <circle cx="160" cy="160" r="1.8" fill={moodCfg.particle2} style={{
              transformOrigin: '160px 160px',
              animation: 'lumo-particle-float 4.5s ease-in-out infinite 1.5s',
            }} />
            {mood === 'happy' && (
              <>
                <circle cx="100" cy="30" r="2.5" fill="#fde68a" style={{
                  transformOrigin: '100px 30px',
                  animation: 'lumo-particle-float-2 2.5s ease-in-out infinite',
                }} />
                <circle cx="20" cy="100" r="2" fill="#fbbf24" style={{
                  transformOrigin: '20px 100px',
                  animation: 'lumo-particle-float 3s ease-in-out infinite 0.3s',
                }} />
                <circle cx="180" cy="120" r="2.2" fill="#fde68a" style={{
                  transformOrigin: '180px 120px',
                  animation: 'lumo-particle-float-3 2.8s ease-in-out infinite 0.6s',
                }} />
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Configurations par mood — couleurs, rythme, expressions.
 */
const MOODS: Record<
  LumoMood,
  {
    bodyHighlight: string;
    bodyMid: string;
    bodyDeep: string;
    glow: string;
    ring: string;
    ringInner: string;
    faceColor: string;
    blush: string;
    particle1: string;
    particle2: string;
    breatheSpeed: number;
    pupilOffsetX: number;
    pupilOffsetY: number;
  }
> = {
  idle: {
    bodyHighlight: '#bae6fd',
    bodyMid: '#38bdf8',
    bodyDeep: '#1e3a8a',
    glow: '#22d3ee',
    ring: '#67e8f9',
    ringInner: '#c7d2fe',
    faceColor: '#0a0e27',
    blush: '#f0abfc',
    particle1: '#67e8f9',
    particle2: '#fde68a',
    breatheSpeed: 4,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  speaking: {
    bodyHighlight: '#bae6fd',
    bodyMid: '#22d3ee',
    bodyDeep: '#1e3a8a',
    glow: '#22d3ee',
    ring: '#67e8f9',
    ringInner: '#c7d2fe',
    faceColor: '#0a0e27',
    blush: '#f0abfc',
    particle1: '#67e8f9',
    particle2: '#22d3ee',
    breatheSpeed: 0.6,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  thinking: {
    bodyHighlight: '#bbf7d0',
    bodyMid: '#34d399',
    bodyDeep: '#14532d',
    glow: '#10b981',
    ring: '#6ee7b7',
    ringInner: '#a7f3d0',
    faceColor: '#0a0e27',
    blush: '#f0abfc',
    particle1: '#6ee7b7',
    particle2: '#a7f3d0',
    breatheSpeed: 5,
    pupilOffsetX: 0,
    pupilOffsetY: -2.5, // looks up
  },
  happy: {
    bodyHighlight: '#fef3c7',
    bodyMid: '#fbbf24',
    bodyDeep: '#92400e',
    glow: '#fbbf24',
    ring: '#fde68a',
    ringInner: '#fef3c7',
    faceColor: '#451a03',
    blush: '#fb7185',
    particle1: '#fde68a',
    particle2: '#fbbf24',
    breatheSpeed: 1.4,
    pupilOffsetX: 0,
    pupilOffsetY: 1, // squinting joyfully
  },
  gentle: {
    bodyHighlight: '#fbcfe8',
    bodyMid: '#f9a8d4',
    bodyDeep: '#9d174d',
    glow: '#ec4899',
    ring: '#f9a8d4',
    ringInner: '#fbcfe8',
    faceColor: '#4a044e',
    blush: '#fb7185',
    particle1: '#f9a8d4',
    particle2: '#fbcfe8',
    breatheSpeed: 5.5,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  sleeping: {
    bodyHighlight: '#cbd5e1',
    bodyMid: '#64748b',
    bodyDeep: '#1e293b',
    glow: '#475569',
    ring: '#475569',
    ringInner: '#475569',
    faceColor: '#0a0e27',
    blush: '#475569',
    particle1: '#475569',
    particle2: '#475569',
    breatheSpeed: 8,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
};
