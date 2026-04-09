"use client";

export type LumoMood = "idle" | "happy" | "excited" | "sleeping" | "proud";

interface LumoCompanionProps {
  mood?: LumoMood;
  size?: "sm" | "md" | "lg" | "xl";
  speaking?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { w: 48, h: 48 },
  md: { w: 80, h: 80 },
  lg: { w: 112, h: 112 },
  xl: { w: 144, h: 144 },
};

const GLOW_COLORS: Record<LumoMood, string> = {
  idle: "from-violet-400/30 to-purple-400/30",
  happy: "from-indigo-400/30 to-blue-400/30",
  excited: "from-pink-400/40 to-violet-400/40",
  sleeping: "from-blue-400/20 to-indigo-400/20",
  proud: "from-amber-400/40 to-violet-400/40",
};

function LumoMiniSVG({ mood }: { mood: LumoMood }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const eyeClosed = sleeping;

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="lc-fur" cx="42%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <radialGradient id="lc-shine" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lc-iris" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <filter id="lc-glow">
          <feGaussianBlur stdDeviation="1.5" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Corps compact */}
      <ellipse cx="50" cy="72" rx="18" ry="15" fill="#9333ea" />
      <ellipse cx="50" cy="72" rx="18" ry="15" fill="url(#lc-shine)" />
      <ellipse cx="50" cy="74" rx="11" ry="9" fill="#faf5ff" opacity="0.2" />

      {/* Pattes */}
      <ellipse cx="38" cy="86" rx="8" ry="5" fill="#7c3aed" />
      <ellipse cx="62" cy="86" rx="8" ry="5" fill="#7c3aed" />

      {/* Bras */}
      <ellipse cx="30" cy="70" rx="7" ry="5" fill="#a855f7" transform="rotate(-15,30,70)" />
      <ellipse cx="70" cy="68" rx="7" ry="5" fill="#a855f7" transform="rotate(15,70,68)" />

      {/* Tête */}
      <circle cx="50" cy="42" r="28" fill="url(#lc-fur)" />
      <circle cx="50" cy="42" r="28" fill="url(#lc-shine)" />

      {/* Oreilles */}
      <ellipse cx="24" cy="22" rx="10" ry="14" fill="#c084fc" transform="rotate(-18,24,22)" />
      <ellipse cx="24" cy="22" rx="7" ry="10" fill="#d8b4fe" transform="rotate(-18,24,22)" />
      <ellipse cx="76" cy="22" rx="10" ry="14" fill="#c084fc" transform="rotate(18,76,22)" />
      <ellipse cx="76" cy="22" rx="7" ry="10" fill="#d8b4fe" transform="rotate(18,76,22)" />

      {/* Yeux */}
      {eyeClosed ? (
        <>
          <path d="M 34,40 Q 40,36 46,40" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 54,40 Q 60,36 66,40" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="40" cy="40" rx="7" ry="8" fill="white" />
          <ellipse cx="60" cy="40" rx="7" ry="8" fill="white" />
          <circle cx="41" cy="40" r="5" fill="url(#lc-iris)" />
          <circle cx="61" cy="40" r="5" fill="url(#lc-iris)" />
          <circle cx="41" cy="39" r="2.5" fill="#1e1b4b" />
          <circle cx="61" cy="39" r="2.5" fill="#1e1b4b" />
          <circle cx="43" cy="37" r="2" fill="white" opacity="0.95" />
          <circle cx="63" cy="37" r="2" fill="white" opacity="0.95" />
          <circle cx="39" cy="43" r="1" fill="white" opacity="0.4" />
          <circle cx="59" cy="43" r="1" fill="white" opacity="0.4" />
        </>
      )}

      {/* Nez */}
      {!sleeping && <ellipse cx="50" cy="47" rx="2.5" ry="1.8" fill="#9333ea" opacity="0.5" />}

      {/* Bouche */}
      {sleeping ? (
        <path d="M 45 52 Q 50 54 55 52" stroke="#6b21a8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : happy ? (
        <path d="M 42 52 Q 50 59 58 52" stroke="#6b21a8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 44 52 Q 50 56 56 52" stroke="#6b21a8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Joues */}
      {!sleeping && (
        <>
          <circle cx="30" cy="48" r="5" fill="#fda4af" opacity="0.35" />
          <circle cx="70" cy="48" r="5" fill="#fda4af" opacity="0.35" />
        </>
      )}

      {/* Étoile */}
      <g filter="url(#lc-glow)">
        <polygon points="50,14 52,20 58,20 53,24 55,30 50,26 45,30 47,24 42,20 48,20" fill="#fbbf24" />
      </g>

      {/* ZZZ */}
      {sleeping && (
        <>
          <text x="68" y="28" fontSize="6" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.6">z</text>
          <text x="74" y="20" fontSize="8" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">z</text>
          <text x="80" y="10" fontSize="10" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">z</text>
        </>
      )}

      {/* Sparkles */}
      {(mood === "excited" || mood === "proud") && (
        <>
          <text x="8" y="18" fontSize="6" fill="#fbbf24" opacity="0.6" fontFamily="sans-serif">✦</text>
          <text x="82" y="14" fontSize="5" fill="#a78bfa" opacity="0.5" fontFamily="sans-serif">✦</text>
        </>
      )}

      {/* Queue */}
      <path d="M 68 76 Q 80 72 82 78 Q 83 82 78 82" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function LumoCompanion({ mood = "idle", size = "md", speaking = false, className = "" }: LumoCompanionProps) {
  const sizeCfg = SIZE_CONFIG[size];
  const glowColor = GLOW_COLORS[mood];
  const animClass = mood === "sleeping" ? "lumo-sleeping" : mood === "excited" ? "lumo-excited" : "animate-float";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow ring */}
      <div
        className={`absolute rounded-full bg-gradient-to-br ${glowColor} blur-xl ${animClass}`}
        style={{ width: sizeCfg.w, height: sizeCfg.h }}
      />

      {/* Character */}
      <div
        className={`relative flex items-center justify-center ${animClass}`}
        style={{ width: sizeCfg.w, height: sizeCfg.h }}
      >
        <LumoMiniSVG mood={mood} />

        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
            <span className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export helpers
export function getLumoMood(child: { streak: number; level: number; lastActivity: string | null }): LumoMood {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) return "sleeping";
  if (child.streak >= 7) return "excited";
  if (child.level >= 5) return "proud";
  if (child.lastActivity) return "happy";
  return "idle";
}

export function getLumoMessage(child: { name: string; streak: number; level: number }): string {
  const hour = new Date().getHours();
  const msgs: string[] = [];

  if (hour < 12) msgs.push(`Bonjour ${child.name} ! Prêt pour l'aventure ? ☀️`);
  else if (hour < 18) msgs.push(`Coucou ${child.name} ! On continue l'aventure ? 🌟`);
  else msgs.push(`Bonsoir ${child.name} ! Une dernière aventure ? 🌙`);

  if (child.streak > 0) msgs.push(`${child.streak} jours de suite ! Tu es incroyable ! 🔥`);
  if (child.level > 1) msgs.push(`Niveau ${child.level}, impressionnant ! Continue ! 💪`);

  msgs.push(
    `Choisis un chapitre sur la carte ! 🗺️`,
    `Clique sur moi si tu as besoin d'aide ! 💬`,
    `Tes quêtes du jour t'attendent ! 🔔`,
  );

  return msgs[Math.floor(Math.random() * msgs.length)];
}
