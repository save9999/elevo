/**
 * Planète illustrée — pas un simple cercle gradient.
 *
 * Chaque planète a :
 *  - une surface gradient
 *  - des cratères / taches
 *  - une atmosphère lumineuse autour
 *  - éventuellement un anneau
 *  - une rotation lente sur elle-même
 *
 * Tout en SVG, paramétrable par "kind".
 */

export type PlanetKind =
  | 'lettres'      // bleue, surface lisse, anneau
  | 'nombres'      // ambre, surface chaude, cratères
  | 'memoire'      // violette, surface irisée
  | 'ecriture'     // émeraude, surface dense
  | 'langage'      // rose, atmosphère épaisse
  | 'espace'       // cyan/turquoise, surface géométrique
  ;

const PLANETS: Record<
  PlanetKind,
  {
    coreLight: string;
    coreMid: string;
    coreDeep: string;
    atmoColor: string;
    cratersColor: string;
    hasRing: boolean;
    ringColor: string;
    surface: 'smooth' | 'craters' | 'rings' | 'swirls' | 'geometric' | 'hazy';
  }
> = {
  lettres: {
    coreLight: '#bae6fd',
    coreMid: '#3b82f6',
    coreDeep: '#1e3a8a',
    atmoColor: '#60a5fa',
    cratersColor: '#1e40af',
    hasRing: true,
    ringColor: '#93c5fd',
    surface: 'smooth',
  },
  nombres: {
    coreLight: '#fed7aa',
    coreMid: '#f97316',
    coreDeep: '#7c2d12',
    atmoColor: '#fb923c',
    cratersColor: '#9a3412',
    hasRing: false,
    ringColor: '#fdba74',
    surface: 'craters',
  },
  memoire: {
    coreLight: '#e9d5ff',
    coreMid: '#a855f7',
    coreDeep: '#581c87',
    atmoColor: '#c084fc',
    cratersColor: '#6b21a8',
    hasRing: true,
    ringColor: '#d8b4fe',
    surface: 'swirls',
  },
  ecriture: {
    coreLight: '#bbf7d0',
    coreMid: '#10b981',
    coreDeep: '#064e3b',
    atmoColor: '#34d399',
    cratersColor: '#065f46',
    hasRing: false,
    ringColor: '#6ee7b7',
    surface: 'craters',
  },
  langage: {
    coreLight: '#fbcfe8',
    coreMid: '#ec4899',
    coreDeep: '#831843',
    atmoColor: '#f472b6',
    cratersColor: '#9d174d',
    hasRing: false,
    ringColor: '#f9a8d4',
    surface: 'hazy',
  },
  espace: {
    coreLight: '#a5f3fc',
    coreMid: '#06b6d4',
    coreDeep: '#0e7490',
    atmoColor: '#22d3ee',
    cratersColor: '#155e75',
    hasRing: true,
    ringColor: '#67e8f9',
    surface: 'geometric',
  },
};

export function IllustratedPlanet({
  kind,
  size = 200,
  className,
  spin = true,
}: {
  kind: PlanetKind;
  size?: number;
  className?: string;
  spin?: boolean;
}) {
  const cfg = PLANETS[kind];
  const id = `${kind}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`atmo-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={cfg.atmoColor} stopOpacity="0" />
            <stop offset="55%" stopColor={cfg.atmoColor} stopOpacity="0.3" />
            <stop offset="80%" stopColor={cfg.atmoColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={cfg.atmoColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`core-${id}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={cfg.coreLight} />
            <stop offset="55%" stopColor={cfg.coreMid} />
            <stop offset="100%" stopColor={cfg.coreDeep} />
          </radialGradient>
          <radialGradient id={`shimmer-${id}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip-${id}`}>
            <circle cx="100" cy="100" r="64" />
          </clipPath>
        </defs>

        {/* Atmosphere glow */}
        <circle cx="100" cy="100" r="92" fill={`url(#atmo-${id})`} />

        {/* Ring back half (behind planet) */}
        {cfg.hasRing && (
          <ellipse
            cx="100"
            cy="100"
            rx="92"
            ry="20"
            fill="none"
            stroke={cfg.ringColor}
            strokeWidth="3"
            opacity="0.6"
            transform="rotate(-15 100 100)"
            strokeDasharray="0 0 100 200"
          />
        )}

        {/* Planet body */}
        <g
          style={{
            transformOrigin: '100px 100px',
            animation: spin ? 'planet-spin 60s linear infinite' : 'none',
          }}
        >
          <circle cx="100" cy="100" r="64" fill={`url(#core-${id})`} />

          {/* Surface details — varies by kind */}
          <g clipPath={`url(#clip-${id})`}>
            {cfg.surface === 'craters' && (
              <>
                <circle cx="78" cy="85" r="8" fill={cfg.cratersColor} opacity="0.5" />
                <circle cx="120" cy="110" r="12" fill={cfg.cratersColor} opacity="0.55" />
                <circle cx="95" cy="135" r="6" fill={cfg.cratersColor} opacity="0.45" />
                <circle cx="135" cy="78" r="5" fill={cfg.cratersColor} opacity="0.5" />
                <circle cx="65" cy="120" r="9" fill={cfg.cratersColor} opacity="0.5" />
              </>
            )}
            {cfg.surface === 'swirls' && (
              <>
                <path d="M 50 90 Q 100 70 150 100 Q 100 130 50 110" fill="none" stroke={cfg.cratersColor} strokeWidth="3" opacity="0.5" />
                <path d="M 60 130 Q 100 110 140 140" fill="none" stroke={cfg.cratersColor} strokeWidth="2.5" opacity="0.4" />
                <path d="M 70 70 Q 110 60 140 80" fill="none" stroke={cfg.cratersColor} strokeWidth="2" opacity="0.45" />
              </>
            )}
            {cfg.surface === 'geometric' && (
              <>
                <polygon points="80,80 110,75 105,105 75,100" fill={cfg.cratersColor} opacity="0.4" />
                <polygon points="115,110 145,115 140,140 110,130" fill={cfg.cratersColor} opacity="0.5" />
                <line x1="60" y1="100" x2="140" y2="105" stroke={cfg.cratersColor} strokeWidth="1.5" opacity="0.5" />
                <line x1="100" y1="60" x2="105" y2="140" stroke={cfg.cratersColor} strokeWidth="1.5" opacity="0.5" />
              </>
            )}
            {cfg.surface === 'hazy' && (
              <>
                <ellipse cx="100" cy="80" rx="50" ry="8" fill={cfg.cratersColor} opacity="0.35" />
                <ellipse cx="100" cy="105" rx="55" ry="6" fill={cfg.cratersColor} opacity="0.3" />
                <ellipse cx="100" cy="130" rx="48" ry="7" fill={cfg.cratersColor} opacity="0.4" />
              </>
            )}
            {cfg.surface === 'smooth' && (
              <>
                <ellipse cx="85" cy="115" rx="22" ry="6" fill={cfg.cratersColor} opacity="0.3" />
                <ellipse cx="120" cy="90" rx="18" ry="5" fill={cfg.cratersColor} opacity="0.35" />
              </>
            )}
          </g>

          {/* Specular highlight */}
          <ellipse cx="78" cy="78" rx="22" ry="14" fill={`url(#shimmer-${id})`} />
        </g>

        {/* Ring front half (in front of planet) */}
        {cfg.hasRing && (
          <ellipse
            cx="100"
            cy="100"
            rx="92"
            ry="20"
            fill="none"
            stroke={cfg.ringColor}
            strokeWidth="3"
            opacity="0.85"
            transform="rotate(-15 100 100)"
            strokeDasharray="200 0 100 200"
          />
        )}
      </svg>
    </div>
  );
}
