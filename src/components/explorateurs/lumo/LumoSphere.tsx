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
  xl: 260,
};

/**
 * LUMO — personnage IA version light theme.
 * Body plus doux (bleu ciel + blanc), halo moins agressif, face friendly.
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
  const cfg = MOODS[mood];

  return (
    <div
      className={clsx('relative inline-block', className)}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`LUMO, ${mood}`}
    >
      <svg viewBox="0 0 200 200" width={px} height={px} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`lumo-body-${mood}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={cfg.bodyHighlight} />
            <stop offset="45%" stopColor={cfg.bodyMid} />
            <stop offset="100%" stopColor={cfg.bodyDeep} />
          </radialGradient>
          <radialGradient id={`lumo-glow-${mood}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={cfg.glow} stopOpacity="0.5" />
            <stop offset="50%" stopColor={cfg.glow} stopOpacity="0.15" />
            <stop offset="100%" stopColor={cfg.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`lumo-shimmer-${mood}`} cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo */}
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

        {/* Orbital rings */}
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
            stroke={cfg.ring}
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity={mood === 'sleeping' ? '0.2' : '0.5'}
            transform="rotate(-18 100 100)"
          />
          <circle cx="186" cy="100" r="2.5" fill={cfg.ring} opacity="0.7"
            transform="rotate(-18 100 100)" />
        </g>
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
            stroke={cfg.ringInner}
            strokeWidth="0.8"
            strokeDasharray="1 4"
            opacity={mood === 'sleeping' ? '0.1' : '0.35'}
            transform="rotate(28 100 100)"
          />
        </g>

        {/* Body */}
        <g
          style={{
            transformOrigin: '100px 100px',
            animation: mood === 'sleeping' ? 'lumo-breathe 6s ease-in-out infinite' : `lumo-breathe ${cfg.breatheSpeed}s ease-in-out infinite`,
          }}
        >
          <circle cx="100" cy="100" r="52" fill={`url(#lumo-body-${mood})`} />
          <ellipse cx="82" cy="82" rx="22" ry="15" fill={`url(#lumo-shimmer-${mood})`} />
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.25" />

          {/* Eyes */}
          {mood === 'sleeping' ? (
            <>
              <path d="M 78 102 Q 86 106 94 102" stroke={cfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 106 102 Q 114 106 122 102" stroke={cfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <g style={{
              transformOrigin: '100px 100px',
              animation: 'lumo-blink 5s ease-in-out infinite',
            }}>
              <ellipse cx="86" cy="98" rx="7" ry="9" fill="white" />
              <ellipse cx="114" cy="98" rx="7" ry="9" fill="white" />
              <circle cx={86 + cfg.pupilOffsetX} cy={98 + cfg.pupilOffsetY} r="3.5" fill={cfg.faceColor} />
              <circle cx={114 + cfg.pupilOffsetX} cy={98 + cfg.pupilOffsetY} r="3.5" fill={cfg.faceColor} />
              <circle cx={87 + cfg.pupilOffsetX} cy={96 + cfg.pupilOffsetY} r="1.2" fill="white" />
              <circle cx={115 + cfg.pupilOffsetX} cy={96 + cfg.pupilOffsetY} r="1.2" fill="white" />
            </g>
          )}

          {/* Mouth */}
          {mood === 'speaking' && (
            <ellipse cx="100" cy="120" rx="6" ry="4" fill={cfg.faceColor} />
          )}
          {mood === 'idle' && (
            <path d="M 92 120 Q 100 124 108 120" stroke={cfg.faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {mood === 'happy' && (
            <path d="M 88 118 Q 100 130 112 118" stroke={cfg.faceColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {mood === 'gentle' && (
            <path d="M 92 121 Q 100 124 108 121" stroke={cfg.faceColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}
          {mood === 'thinking' && (
            <line x1="94" y1="121" x2="106" y2="121" stroke={cfg.faceColor} strokeWidth="2" strokeLinecap="round" />
          )}

          {(mood === 'happy' || mood === 'gentle') && (
            <>
              <ellipse cx="78" cy="113" rx="5" ry="3" fill={cfg.blush} opacity="0.7" />
              <ellipse cx="122" cy="113" rx="5" ry="3" fill={cfg.blush} opacity="0.7" />
            </>
          )}

          {mood === 'sleeping' && (
            <text x="135" y="75" fontFamily="serif" fontSize="20" fill={cfg.faceColor} opacity="0.6" fontStyle="italic">z</text>
          )}

          {mood === 'thinking' && (
            <g opacity="0.7">
              <circle cx="135" cy="60" r="2" fill={cfg.glow} />
              <circle cx="142" cy="55" r="1.6" fill={cfg.glow} />
              <circle cx="148" cy="50" r="1.2" fill={cfg.glow} />
            </g>
          )}
        </g>

        {/* Floating particles */}
        {mood !== 'sleeping' && (
          <>
            <circle cx="35" cy="60" r="2.2" fill={cfg.particle1} style={{
              transformOrigin: '35px 60px',
              animation: 'lumo-particle-float 4s ease-in-out infinite',
            }} />
            <circle cx="170" cy="80" r="1.8" fill={cfg.particle2} style={{
              transformOrigin: '170px 80px',
              animation: 'lumo-particle-float-2 3.5s ease-in-out infinite 0.5s',
            }} />
            <circle cx="50" cy="155" r="2.4" fill={cfg.particle1} style={{
              transformOrigin: '50px 155px',
              animation: 'lumo-particle-float-3 5s ease-in-out infinite 1s',
            }} />
            <circle cx="160" cy="160" r="2" fill={cfg.particle2} style={{
              transformOrigin: '160px 160px',
              animation: 'lumo-particle-float 4.5s ease-in-out infinite 1.5s',
            }} />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Palette light-friendly : tons plus saturés mais sans le noir profond.
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
    bodyHighlight: '#e0f2fe',
    bodyMid: '#38bdf8',
    bodyDeep: '#0369a1',
    glow: '#0ea5e9',
    ring: '#0ea5e9',
    ringInner: '#7dd3fc',
    faceColor: '#0b1930',
    blush: '#fda4af',
    particle1: '#0ea5e9',
    particle2: '#10b981',
    breatheSpeed: 4,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  speaking: {
    bodyHighlight: '#e0f2fe',
    bodyMid: '#0ea5e9',
    bodyDeep: '#075985',
    glow: '#0ea5e9',
    ring: '#0ea5e9',
    ringInner: '#7dd3fc',
    faceColor: '#0b1930',
    blush: '#fda4af',
    particle1: '#0ea5e9',
    particle2: '#38bdf8',
    breatheSpeed: 0.6,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  thinking: {
    bodyHighlight: '#d1fae5',
    bodyMid: '#10b981',
    bodyDeep: '#065f46',
    glow: '#059669',
    ring: '#10b981',
    ringInner: '#6ee7b7',
    faceColor: '#0b1930',
    blush: '#fda4af',
    particle1: '#10b981',
    particle2: '#6ee7b7',
    breatheSpeed: 5,
    pupilOffsetX: 0,
    pupilOffsetY: -2.5,
  },
  happy: {
    bodyHighlight: '#fef3c7',
    bodyMid: '#fbbf24',
    bodyDeep: '#b45309',
    glow: '#f59e0b',
    ring: '#fbbf24',
    ringInner: '#fde68a',
    faceColor: '#451a03',
    blush: '#fb7185',
    particle1: '#fde68a',
    particle2: '#fbbf24',
    breatheSpeed: 1.4,
    pupilOffsetX: 0,
    pupilOffsetY: 1,
  },
  gentle: {
    bodyHighlight: '#fce7f3',
    bodyMid: '#f472b6',
    bodyDeep: '#9d174d',
    glow: '#ec4899',
    ring: '#f472b6',
    ringInner: '#fbcfe8',
    faceColor: '#500724',
    blush: '#fb7185',
    particle1: '#f472b6',
    particle2: '#fbcfe8',
    breatheSpeed: 5.5,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
  sleeping: {
    bodyHighlight: '#e2e8f0',
    bodyMid: '#94a3b8',
    bodyDeep: '#334155',
    glow: '#64748b',
    ring: '#64748b',
    ringInner: '#64748b',
    faceColor: '#0b1930',
    blush: '#64748b',
    particle1: '#64748b',
    particle2: '#64748b',
    breatheSpeed: 8,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
  },
};
