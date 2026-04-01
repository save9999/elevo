"use client";
import { useState, useEffect } from "react";

export type LumoMood = "idle" | "happy" | "excited" | "sleeping" | "proud";

interface LumoProps {
  ageGroup: "maternelle" | "primaire" | "college-lycee";
  level?: number;
  mood?: LumoMood;
  size?: number;
  onClick?: () => void;
  className?: string;
}

// ── Maternelle : petit blob rond doré avec grande antenne ───────────────────
function LumoMaternelle({ mood, level, blink }: { mood: LumoMood; level: number; blink: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const eyeBlind = sleeping || blink;

  return (
    <svg viewBox="0 0 100 118" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="matBody" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <radialGradient id="matGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <filter id="matShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Aura */}
      <ellipse cx="50" cy="76" rx="48" ry="44" fill="url(#matGlow)" />

      {/* Corps principal */}
      <ellipse cx="50" cy="76" rx="40" ry="37" fill="url(#matBody)" filter="url(#matShadow)" />

      {/* Reflet corps */}
      <ellipse cx="38" cy="62" rx="14" ry="9" fill="#FFFBEB" opacity="0.5" />

      {/* Antenne */}
      <line x1="50" y1="39" x2="50" y2="18" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      {level >= 10 ? (
        /* Couronne */
        <path d="M43,14 L46,8 L50,12 L54,6 L57,12 L60,8 L57,18 L43,18 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
      ) : (
        <>
          <circle cx="50" cy="12" r="7" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="50" cy="12" r="3" fill="#F59E0B" />
          {level >= 5 && <path d="M50,8 L51,11 L54,11 L52,13 L53,16 L50,14 L47,16 L48,13 L46,11 L49,11 Z" fill="#FBBF24" />}
        </>
      )}

      {/* Yeux */}
      {eyeBlind || sleeping ? (
        <>
          <path d="M27,66 Q36,59 45,66" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55,66 Q64,59 73,66" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : happy ? (
        <>
          <ellipse cx="36" cy="66" rx="11" ry="12" fill="white" />
          <ellipse cx="64" cy="66" rx="11" ry="12" fill="white" />
          <path d="M26,67 Q36,78 46,67" fill="#1E293B" />
          <path d="M54,67 Q64,78 74,67" fill="#1E293B" />
          <circle cx="33" cy="63" r="2.5" fill="white" opacity="0.9" />
          <circle cx="61" cy="63" r="2.5" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <ellipse cx="36" cy="67" rx="11" ry="12" fill="white" />
          <ellipse cx="64" cy="67" rx="11" ry="12" fill="white" />
          <circle cx="36" cy="69" r="7.5" fill="#1E293B" />
          <circle cx="64" cy="69" r="7.5" fill="#1E293B" />
          <circle cx="33" cy="66" r="2.5" fill="white" />
          <circle cx="61" cy="66" r="2.5" fill="white" />
        </>
      )}

      {/* Joues */}
      <ellipse cx="22" cy="80" rx="7.5" ry="4.5" fill="#FCA5A5" opacity="0.55" />
      <ellipse cx="78" cy="80" rx="7.5" ry="4.5" fill="#FCA5A5" opacity="0.55" />

      {/* Bouche */}
      {sleeping ? (
        <path d="M40,86 Q50,89 60,86" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : happy ? (
        <path d="M35,84 Q50,100 65,84" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="#FDE68A" />
      ) : (
        <path d="M38,84 Q50,95 62,84" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* ZZZ si endormi */}
      {sleeping && (
        <>
          <text x="68" y="52" fontSize="9" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="73" y="42" fontSize="12" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="80" y="30" fontSize="15" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}

      {/* Étoiles si fier */}
      {mood === "proud" && (
        <>
          <text x="10" y="50" fontSize="12" fill="#FCD34D">✦</text>
          <text x="82" y="55" fontSize="10" fill="#FCD34D">✦</text>
          <text x="16" y="35" fontSize="8" fill="#FCD34D">✦</text>
        </>
      )}
    </svg>
  );
}

// ── Primaire : blob ovale teal avec nageoires et badge étoile ────────────────
function LumoPrimaire({ mood, level, blink }: { mood: LumoMood; level: number; blink: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const eyeBlind = sleeping || blink;

  return (
    <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="priBody" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        <radialGradient id="priGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
        </radialGradient>
        <filter id="priShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#059669" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Aura */}
      <ellipse cx="50" cy="80" rx="46" ry="50" fill="url(#priGlow)" />

      {/* Nageoires oreilles */}
      <ellipse cx="14" cy="67" rx="9" ry="16" fill="#10B981" transform="rotate(-20 14 67)" opacity="0.85" />
      <ellipse cx="86" cy="67" rx="9" ry="16" fill="#10B981" transform="rotate(20 86 67)" opacity="0.85" />
      <ellipse cx="14" cy="67" rx="5" ry="10" fill="#34D399" transform="rotate(-20 14 67)" opacity="0.6" />
      <ellipse cx="86" cy="67" rx="5" ry="10" fill="#34D399" transform="rotate(20 86 67)" opacity="0.6" />

      {/* Corps */}
      <ellipse cx="50" cy="80" rx="36" ry="50" fill="url(#priBody)" filter="url(#priShadow)" />

      {/* Reflet */}
      <ellipse cx="40" cy="60" rx="12" ry="8" fill="#ECFDF5" opacity="0.45" />

      {/* Couronne si niveau 10+ */}
      {level >= 10 && (
        <path d="M36,28 L40,20 L50,26 L60,18 L64,28 L50,32 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
      )}

      {/* Sourcils */}
      {!sleeping && (
        <>
          <path d="M28,54 Q36,49 44,54" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M56,54 Q64,49 72,54" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Yeux */}
      {eyeBlind || sleeping ? (
        <>
          <path d="M28,62 Q36,56 44,62" stroke="#065F46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M56,62 Q64,56 72,62" stroke="#065F46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : happy ? (
        <>
          <ellipse cx="36" cy="62" rx="10" ry="11" fill="white" />
          <ellipse cx="64" cy="62" rx="10" ry="11" fill="white" />
          <path d="M27,63 Q36,73 45,63" fill="#065F46" />
          <path d="M55,63 Q64,73 73,63" fill="#065F46" />
          <circle cx="33" cy="60" r="2.5" fill="white" opacity="0.9" />
          <circle cx="61" cy="60" r="2.5" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <ellipse cx="36" cy="62" rx="10" ry="11" fill="white" />
          <ellipse cx="64" cy="62" rx="10" ry="11" fill="white" />
          <circle cx="36" cy="64" r="7" fill="#065F46" />
          <circle cx="64" cy="64" r="7" fill="#065F46" />
          <circle cx="33" cy="61" r="2.5" fill="white" />
          <circle cx="61" cy="61" r="2.5" fill="white" />
        </>
      )}

      {/* Bouche */}
      {sleeping ? (
        <path d="M40,79 Q50,82 60,79" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : happy ? (
        <path d="M35,78 Q50,94 65,78" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="#A7F3D0" />
      ) : (
        <path d="M38,78 Q50,90 62,78" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Badge étoile */}
      <path d="M50,94 L52.4,101 L60,101 L54,105.4 L56.4,112.4 L50,108 L43.6,112.4 L46,105.4 L40,101 L47.6,101 Z"
        fill={level >= 5 ? "#FCD34D" : "#D1FAE5"} stroke="#059669" strokeWidth="0.5" />

      {/* ZZZ */}
      {sleeping && (
        <>
          <text x="70" y="50" fontSize="9" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="76" y="40" fontSize="12" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="83" y="28" fontSize="15" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}

      {/* Étoiles si fier */}
      {mood === "proud" && (
        <>
          <text x="8" y="55" fontSize="12" fill="#34D399">✦</text>
          <text x="84" y="50" fontSize="10" fill="#34D399">✦</text>
          <text x="12" y="38" fontSize="8" fill="#34D399">✦</text>
        </>
      )}
    </svg>
  );
}

// ── Collège/Lycée : blob haut violet avec casque ─────────────────────────────
function LumoCollege({ mood, level, blink }: { mood: LumoMood; level: number; blink: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const eyeBlind = sleeping || blink;

  return (
    <svg viewBox="0 0 100 145" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="colBody" cx="38%" cy="28%" r="73%">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
        <radialGradient id="colGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
        </radialGradient>
        <filter id="colShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#6D28D9" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Aura */}
      <ellipse cx="50" cy="90" rx="44" ry="55" fill="url(#colGlow)" />

      {/* Arc casque */}
      <path d="M22,62 Q22,28 50,25 Q78,28 78,62" fill="none" stroke="#6D28D9" strokeWidth="4" strokeLinecap="round" />

      {/* Oreillettes casque */}
      <rect x="10" y="58" width="16" height="22" rx="8" fill="#7C3AED" />
      <rect x="10" y="62" width="16" height="14" rx="7" fill="#A78BFA" />
      <rect x="74" y="58" width="16" height="22" rx="8" fill="#7C3AED" />
      <rect x="74" y="62" width="16" height="14" rx="7" fill="#A78BFA" />

      {/* Corps */}
      <ellipse cx="50" cy="92" rx="33" ry="52" fill="url(#colBody)" filter="url(#colShadow)" />

      {/* Reflet */}
      <ellipse cx="40" cy="70" rx="11" ry="7" fill="#F5F3FF" opacity="0.4" />

      {/* Constellations sur le corps */}
      <circle cx="48" cy="105" r="1.5" fill="#DDD6FE" opacity="0.8" />
      <circle cx="55" cy="112" r="1" fill="#DDD6FE" opacity="0.7" />
      <circle cx="43" cy="115" r="1" fill="#DDD6FE" opacity="0.6" />
      <circle cx="60" cy="100" r="1.2" fill="#DDD6FE" opacity="0.7" />
      <line x1="48" y1="105" x2="55" y2="112" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.4" />
      <line x1="55" y1="112" x2="43" y2="115" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.4" />
      <line x1="43" y1="115" x2="48" y2="105" stroke="#DDD6FE" strokeWidth="0.5" opacity="0.4" />

      {/* Couronne niveau 10+ */}
      {level >= 10 && (
        <path d="M38,22 L42,14 L50,20 L58,12 L62,22 L50,26 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.8" />
      )}

      {/* Yeux (amande, plus sophistiqués) */}
      {eyeBlind || sleeping ? (
        <>
          <path d="M29,75 Q38,70 47,75" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M53,75 Q62,70 71,75" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : happy ? (
        <>
          <ellipse cx="38" cy="75" rx="11" ry="8" fill="white" />
          <ellipse cx="62" cy="75" rx="11" ry="8" fill="white" />
          <path d="M28,76 Q38,84 48,76" fill="#4C1D95" />
          <path d="M52,76 Q62,84 72,76" fill="#4C1D95" />
          <circle cx="35" cy="73" r="2" fill="white" opacity="0.9" />
          <circle cx="59" cy="73" r="2" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <ellipse cx="38" cy="75" rx="11" ry="8" fill="white" />
          <ellipse cx="62" cy="75" rx="11" ry="8" fill="white" />
          <circle cx="38" cy="75" r="5.5" fill="#4C1D95" />
          <circle cx="62" cy="75" r="5.5" fill="#4C1D95" />
          <circle cx="36" cy="73" r="2" fill="white" />
          <circle cx="60" cy="73" r="2" fill="white" />
        </>
      )}

      {/* Bouche */}
      {sleeping ? (
        <path d="M41,88 Q50,90 59,88" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : happy ? (
        <path d="M36,86 Q50,99 64,86" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" fill="#DDD6FE" />
      ) : (
        <path d="M40,87 Q50,95 60,87" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Étoiles niveau 5+ sur casque */}
      {level >= 5 && (
        <text x="44" y="23" fontSize="8" fill="#FCD34D" fontFamily="sans-serif">✦ ✦ ✦</text>
      )}

      {/* ZZZ */}
      {sleeping && (
        <>
          <text x="72" y="58" fontSize="9" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="78" y="47" fontSize="12" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="85" y="34" fontSize="15" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}

      {/* Étoiles fier */}
      {mood === "proud" && (
        <>
          <text x="6" y="60" fontSize="12" fill="#A78BFA">✦</text>
          <text x="86" y="55" fontSize="10" fill="#A78BFA">✦</text>
          <text x="10" y="42" fontSize="8" fill="#A78BFA">✦</text>
        </>
      )}
    </svg>
  );
}

// ── Particules autour du personnage (excited/proud) ───────────────────────────
function Sparkles({ color }: { color: string }) {
  const particles = [
    { x: -20, y: -10, delay: 0, size: 12 },
    { x: 20, y: -20, delay: 0.2, size: 16 },
    { x: -25, y: 15, delay: 0.4, size: 10 },
    { x: 25, y: 5, delay: 0.1, size: 14 },
    { x: 0, y: -30, delay: 0.3, size: 12 },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none lumo-sparkle"
          style={{
            left: `calc(50% + ${p.x}px)`,
            top: `calc(30% + ${p.y}px)`,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            color,
          }}
        >
          ✦
        </div>
      ))}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function LumoCharacter({ ageGroup, level = 1, mood = "idle", size = 160, onClick, className = "" }: LumoProps) {
  const [blink, setBlink] = useState(false);

  // Clignement aléatoire
  useEffect(() => {
    if (mood === "sleeping") return;
    let timeout: ReturnType<typeof setTimeout>;
    function scheduleBlink() {
      const delay = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); scheduleBlink(); }, 140);
      }, delay);
    }
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [mood]);

  const animClass =
    mood === "sleeping" ? "lumo-sleeping" :
    mood === "excited" ? "lumo-excited" :
    mood === "happy" || mood === "proud" ? "lumo-happy" :
    "lumo-idle";

  const sparkleColor =
    ageGroup === "maternelle" ? "#F59E0B" :
    ageGroup === "primaire" ? "#10B981" :
    "#A78BFA";

  return (
    <div
      className={`relative inline-block ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size * 1.1 }}
      onClick={onClick}
    >
      <div className={`w-full h-full ${animClass}`}>
        {ageGroup === "maternelle" && <LumoMaternelle mood={mood} level={level} blink={blink} />}
        {ageGroup === "primaire" && <LumoPrimaire mood={mood} level={level} blink={blink} />}
        {ageGroup === "college-lycee" && <LumoCollege mood={mood} level={level} blink={blink} />}
      </div>
      {(mood === "excited" || mood === "proud") && <Sparkles color={sparkleColor} />}
    </div>
  );
}

// ── Calcul de l'humeur automatique basée sur les données enfant ───────────────
export function getLumoMood(child: {
  streak: number;
  xp: number;
  level: number;
  lastActivity: string | null;
}): LumoMood {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) return "sleeping";

  const hasPlayedToday = child.lastActivity
    ? new Date(child.lastActivity).toDateString() === new Date().toDateString()
    : false;

  if (child.streak >= 7) return "excited";
  if (child.level >= 5 && hasPlayedToday) return "proud";
  if (!hasPlayedToday) return "happy"; // content de revoir l'enfant
  if (child.streak >= 3) return "happy";
  return "idle";
}

// ── Messages contextuels de Lumo ─────────────────────────────────────────────
export function getLumoMessage(child: {
  name: string;
  streak: number;
  level: number;
  lastActivity: string | null;
}): string {
  const firstName = child.name.split(" ")[0];
  const hour = new Date().getHours();
  const hasPlayedToday = child.lastActivity
    ? new Date(child.lastActivity).toDateString() === new Date().toDateString()
    : false;

  if (hour >= 22 || hour < 7) {
    return `Chut… je dors 😴 Reviens demain ${firstName} !`;
  }
  if (child.streak >= 7) {
    return `${child.streak} jours d'affilée ! Tu es INARRÊTABLE ${firstName} ! 🔥🔥`;
  }
  if (child.streak >= 3) {
    return `${child.streak} jours consécutifs ! On est une super équipe ! 💪`;
  }
  if (!hasPlayedToday && hour >= 6 && hour < 12) {
    return `Bonjour ${firstName} ! Je t'attendais ! Prêt(e) pour apprendre ? ☀️`;
  }
  if (!hasPlayedToday && hour >= 12 && hour < 18) {
    return `Coucou ${firstName} ! On fait une session ensemble ? 🎯`;
  }
  if (!hasPlayedToday) {
    return `Bonsoir ${firstName} ! Une dernière aventure avant demain ? 🌙`;
  }
  if (child.level >= 5) {
    return `Niveau ${child.level} atteint ! Tu grandis si vite ${firstName} ! ⭐`;
  }
  const msgs = [
    `Continue comme ça ${firstName}, tu es fantastique ! 🌟`,
    `Chaque exercice te rend plus fort(e) ! 💪`,
    `Je suis tellement fier de toi ${firstName} ! 🎉`,
    `Tu veux essayer un nouveau module ? Je t'accompagne ! 🚀`,
    `Ensemble on peut tout apprendre ${firstName} ! 🤝`,
  ];
  return msgs[Math.floor(Date.now() / 10000) % msgs.length];
}
