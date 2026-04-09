"use client";
import { useState, useEffect } from "react";

export type LumoMood = "idle" | "happy" | "excited" | "sleeping" | "proud";

interface LumoProps {
  ageGroup: "maternelle" | "primaire" | "college-lycee";
  level?: number;
  mood?: LumoMood;
  speaking?: boolean;
  size?: number;
  onClick?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PETIT LUMO — Maternelle (3-6 ans)
// Créature ronde, fourrure violette, oreilles rondes, étoile dorée,
// coussinets, queue bouclée, grands yeux expressifs
// ─────────────────────────────────────────────────────────────────────────────
function LumoMaternelle({
  mood, blink, speaking, mouthOpen,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const excited = mood === "excited";
  const eyeClosed = sleeping || blink;

  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="s-fur" cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="25%" stopColor="#e9d5ff" />
          <stop offset="60%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#a855f7" />
        </radialGradient>
        <radialGradient id="s-fur-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9333ea" />
        </radialGradient>
        <radialGradient id="s-belly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#faf5ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="s-iris" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="40%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <radialGradient id="s-shine" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s-shadow">
          <stop offset="0%" stopColor="#2e1065" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
        </radialGradient>
        <filter id="s-starglow">
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx="100" cy="228" rx="42" ry="8" fill="url(#s-shadow)" />

      {/* Corps */}
      <ellipse cx="100" cy="168" rx="36" ry="32" fill="url(#s-fur-body)" />
      <ellipse cx="100" cy="168" rx="36" ry="32" fill="url(#s-shine)" />
      <ellipse cx="100" cy="172" rx="22" ry="20" fill="url(#s-belly)" />

      {/* Bras */}
      <ellipse cx="58" cy="162" rx="16" ry="11" fill="#c084fc" transform={excited ? "rotate(-35, 58, 152)" : happy ? "rotate(-20, 58, 162)" : "rotate(-10, 58, 162)"} />
      <ellipse cx="58" cy="160" rx="14" ry="9" fill="#d8b4fe" transform={excited ? "rotate(-35, 58, 150)" : happy ? "rotate(-20, 58, 160)" : "rotate(-10, 58, 160)"} />
      <circle cx={excited ? 44 : 48} cy={excited ? 148 : 160} r="4" fill="#e9d5ff" opacity="0.6" />

      <ellipse cx="142" cy="158" rx="16" ry="11" fill="#c084fc" transform={excited ? "rotate(35, 142, 148)" : happy ? "rotate(25, 142, 158)" : "rotate(10, 142, 158)"} />
      <ellipse cx="142" cy="156" rx="14" ry="9" fill="#d8b4fe" transform={excited ? "rotate(35, 142, 146)" : happy ? "rotate(25, 142, 156)" : "rotate(10, 142, 156)"} />
      <circle cx={excited ? 156 : 152} cy={excited ? 144 : 155} r="4" fill="#e9d5ff" opacity="0.6" />

      {/* Pieds avec coussinets */}
      <ellipse cx="78" cy="198" rx="18" ry="12" fill="#9333ea" />
      <ellipse cx="78" cy="196" rx="16" ry="10" fill="#a855f7" />
      <circle cx="70" cy="196" r="3.5" fill="#d8b4fe" opacity="0.5" />
      <circle cx="78" cy="193" r="3" fill="#d8b4fe" opacity="0.5" />
      <circle cx="86" cy="196" r="3.5" fill="#d8b4fe" opacity="0.5" />

      <ellipse cx="122" cy="198" rx="18" ry="12" fill="#9333ea" />
      <ellipse cx="122" cy="196" rx="16" ry="10" fill="#a855f7" />
      <circle cx="114" cy="196" r="3.5" fill="#d8b4fe" opacity="0.5" />
      <circle cx="122" cy="193" r="3" fill="#d8b4fe" opacity="0.5" />
      <circle cx="130" cy="196" r="3.5" fill="#d8b4fe" opacity="0.5" />

      {/* Queue bouclée */}
      <path d="M 136 175 Q 155 168 158 180 Q 160 190 150 188 Q 145 186 148 180"
        fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" />
      <path d="M 136 175 Q 155 168 158 180 Q 160 190 150 188 Q 145 186 148 180"
        fill="none" stroke="#d8b4fe" strokeWidth="3" strokeLinecap="round" />

      {/* Tête */}
      <circle cx="100" cy="90" r="58" fill="url(#s-fur)" />
      <circle cx="100" cy="90" r="58" fill="url(#s-shine)" />

      {/* Touffe de poils */}
      <path d="M 92 34 Q 95 22 100 28 Q 105 18 108 32" fill="#d8b4fe" stroke="#c084fc" strokeWidth="1" />
      <path d="M 96 36 Q 98 28 100 30 Q 102 24 104 35" fill="#e9d5ff" />

      {/* Oreilles rondes */}
      <ellipse cx="46" cy="42" rx="22" ry="28" fill="#c084fc" transform="rotate(-20, 46, 42)" />
      <ellipse cx="46" cy="42" rx="18" ry="24" fill="#d8b4fe" transform="rotate(-20, 46, 42)" />
      <ellipse cx="44" cy="40" rx="8" ry="14" fill="#f5d0fe" opacity="0.5" transform="rotate(-20, 44, 40)" />

      <ellipse cx="154" cy="42" rx="22" ry="28" fill="#c084fc" transform="rotate(20, 154, 42)" />
      <ellipse cx="154" cy="42" rx="18" ry="24" fill="#d8b4fe" transform="rotate(20, 154, 42)" />
      <ellipse cx="156" cy="40" rx="8" ry="14" fill="#f5d0fe" opacity="0.5" transform="rotate(20, 156, 40)" />

      {/* Yeux */}
      {eyeClosed ? (
        <>
          <path d="M 64,86 Q 78,76 92,86" stroke="#4c1d95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 108,86 Q 122,76 136,86" stroke="#4c1d95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="78" cy="86" rx="17" ry="19" fill="white" />
          <ellipse cx="122" cy="86" rx="17" ry="19" fill="white" />
          <circle cx="80" cy="86" r="11" fill="url(#s-iris)" />
          <circle cx="124" cy="86" r="11" fill="url(#s-iris)" />
          <circle cx="80" cy="86" r="11" fill="none" stroke="#4c1d95" strokeWidth="0.8" opacity="0.3" />
          <circle cx="124" cy="86" r="11" fill="none" stroke="#4c1d95" strokeWidth="0.8" opacity="0.3" />
          <circle cx="81" cy="85" r="5.5" fill="#1e1b4b" />
          <circle cx="125" cy="85" r="5.5" fill="#1e1b4b" />
          <circle cx="85" cy="79" r="5" fill="white" opacity="0.95" />
          <circle cx="129" cy="79" r="5" fill="white" opacity="0.95" />
          <circle cx="76" cy="91" r="3" fill="white" opacity="0.45" />
          <circle cx="120" cy="91" r="3" fill="white" opacity="0.45" />
          <circle cx="83" cy="82" r="1.5" fill="white" opacity="0.7" />
          <circle cx="127" cy="82" r="1.5" fill="white" opacity="0.7" />
        </>
      )}

      {/* Sourcils subtils */}
      {happy && !eyeClosed && (
        <>
          <path d="M 64 70 Q 74 66 86 70" stroke="#9333ea" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
          <path d="M 114 70 Q 124 66 136 70" stroke="#9333ea" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        </>
      )}

      {/* Nez */}
      {!sleeping && (
        <>
          <ellipse cx="100" cy="98" rx="5" ry="3.5" fill="#9333ea" opacity="0.6" />
          <ellipse cx="100" cy="97" rx="3" ry="2" fill="#c084fc" opacity="0.4" />
          <circle cx="98" cy="96.5" r="1.5" fill="white" opacity="0.4" />
        </>
      )}

      {/* Bouche */}
      {speaking && mouthOpen ? (
        <>
          <path d="M 85 105 Q 100 118 115 105" fill="#7c2d6a" />
          <path d="M 88 106 Q 100 112 112 106" fill="white" opacity="0.6" />
        </>
      ) : sleeping ? (
        <path d="M 90 106 Q 100 110 110 106" stroke="#6b21a8" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path d="M 85 105 Q 92 114 100 115 Q 108 114 115 105" stroke="#6b21a8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {happy && <path d="M 90 107 Q 100 116 110 107" fill="#f9a8d4" opacity="0.3" />}
        </>
      )}

      {/* Joues */}
      <circle cx="56" cy="100" r="14" fill="url(#s-cheek)" />
      <circle cx="144" cy="100" r="14" fill="url(#s-cheek)" />

      {/* Étoile dorée sur le front */}
      <g filter="url(#s-starglow)">
        <polygon points="100,38 104,48 115,49 107,56 109,67 100,61 91,67 93,56 85,49 96,48" fill="#fbbf24" />
        <polygon points="100,42 103,49 110,50 105,54 107,61 100,57 93,61 95,54 90,50 97,49" fill="#fde68a" opacity="0.7" />
        <circle cx="100" cy="52" r="3" fill="white" opacity="0.4" />
      </g>

      {/* ZZZ endormi */}
      {sleeping && (
        <>
          <text x="140" y="60" fontSize="11" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.6">z</text>
          <text x="150" y="45" fontSize="14" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">z</text>
          <text x="160" y="28" fontSize="18" fill="#a78bfa" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">z</text>
        </>
      )}

      {/* Particules excité/fier */}
      {(mood === "excited" || mood === "proud") && (
        <>
          <circle cx="38" cy="28" r="2.5" fill="#fbbf24" opacity="0.7" />
          <circle cx="168" cy="38" r="2" fill="#a78bfa" opacity="0.6" />
          <circle cx="55" cy="20" r="1.5" fill="#60a5fa" opacity="0.5" />
          <text x="30" y="55" fontSize="8" fill="#fbbf24" opacity="0.5" fontFamily="sans-serif">✦</text>
          <text x="172" y="60" fontSize="6" fill="#a78bfa" opacity="0.4" fontFamily="sans-serif">✦</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LUMO EXPLORATEUR — Primaire (7-11 ans)
// Oreilles pointues, écharpe dorée, cristal bleu, queue longue,
// regard confiant, sourcils expressifs
// ─────────────────────────────────────────────────────────────────────────────
function LumoExplorateur({
  mood, blink, speaking, mouthOpen,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const excited = mood === "excited";
  const eyeClosed = sleeping || blink;

  return (
    <svg viewBox="0 0 210 275" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="m-fur" cx="45%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="30%" stopColor="#c7d2fe" />
          <stop offset="65%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
        <radialGradient id="m-body" cx="50%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <radialGradient id="m-belly" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#eef2ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="m-iris" cx="42%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3730a3" />
        </radialGradient>
        <radialGradient id="m-shine" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="m-shadow">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="m-scarf" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="m-glow">
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ombre */}
      <ellipse cx="105" cy="262" rx="44" ry="7" fill="url(#m-shadow)" />

      {/* Corps */}
      <rect x="70" y="160" width="70" height="60" rx="30" fill="url(#m-body)" />
      <rect x="70" y="160" width="70" height="60" rx="30" fill="url(#m-shine)" />
      <ellipse cx="105" cy="182" rx="22" ry="20" fill="url(#m-belly)" />

      {/* Écharpe dorée */}
      <path d="M 70 158 Q 105 170 140 158 Q 140 172 105 176 Q 70 172 70 158" fill="url(#m-scarf)" />
      <path d="M 70 158 Q 105 165 140 158 Q 140 166 105 169 Q 70 166 70 158" fill="#fde68a" opacity="0.4" />
      <path d="M 128 166 Q 144 174 142 190" fill="#f59e0b" opacity="0.6" />

      {/* Bras */}
      <path d={excited ? "M 66 174 Q 36 158 28 168" : happy ? "M 66 174 Q 44 168 36 178" : "M 66 174 Q 50 172 42 184"}
        stroke="#a5b4fc" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d={excited ? "M 144 170 Q 174 152 182 162" : happy ? "M 144 170 Q 166 162 174 172" : "M 144 170 Q 160 166 168 178"}
        stroke="#a5b4fc" strokeWidth="14" strokeLinecap="round" fill="none" />

      {/* Pieds */}
      <path d="M 80 218 Q 72 236 80 242 Q 90 248 100 240 L 100 218" fill="#4f46e5" />
      <ellipse cx="86" cy="240" rx="12" ry="7" fill="#6366f1" />
      <circle cx="78" cy="240" r="3" fill="#a5b4fc" opacity="0.4" />
      <circle cx="86" cy="237" r="2.5" fill="#a5b4fc" opacity="0.4" />
      <circle cx="94" cy="240" r="3" fill="#a5b4fc" opacity="0.4" />

      <path d="M 110 218 Q 102 236 110 242 Q 120 248 130 240 L 130 218" fill="#4f46e5" />
      <ellipse cx="116" cy="240" rx="12" ry="7" fill="#6366f1" />
      <circle cx="108" cy="240" r="3" fill="#a5b4fc" opacity="0.4" />
      <circle cx="116" cy="237" r="2.5" fill="#a5b4fc" opacity="0.4" />
      <circle cx="124" cy="240" r="3" fill="#a5b4fc" opacity="0.4" />

      {/* Queue */}
      <path d="M 146 192 Q 170 182 176 198 Q 180 212 168 215 Q 160 218 164 206"
        fill="none" stroke="#818cf8" strokeWidth="7" strokeLinecap="round" />
      <path d="M 146 192 Q 170 182 176 198 Q 180 212 168 215 Q 160 218 164 206"
        fill="none" stroke="#a5b4fc" strokeWidth="3.5" strokeLinecap="round" />

      {/* Tête */}
      <circle cx="105" cy="96" r="58" fill="url(#m-fur)" />
      <circle cx="105" cy="96" r="58" fill="url(#m-shine)" />

      {/* Touffe */}
      <path d="M 96 40 Q 100 26 105 34 Q 110 22 114 38" fill="#a5b4fc" stroke="#818cf8" strokeWidth="0.8" />
      <path d="M 100 42 Q 104 32 105 36 Q 108 28 112 40" fill="#c7d2fe" />

      {/* Oreilles pointues */}
      <path d="M 54 68 Q 32 26 57 14 Q 62 30 60 62" fill="#a5b4fc" />
      <path d="M 56 60 Q 40 32 57 20" fill="#c7d2fe" opacity="0.5" />
      <path d="M 56 50 Q 46 36 57 26" fill="#e0e7ff" opacity="0.35" />

      <path d="M 156 68 Q 178 26 153 14 Q 148 30 150 62" fill="#a5b4fc" />
      <path d="M 154 60 Q 170 32 153 20" fill="#c7d2fe" opacity="0.5" />
      <path d="M 154 50 Q 164 36 153 26" fill="#e0e7ff" opacity="0.35" />

      {/* Yeux */}
      {eyeClosed ? (
        <>
          <path d="M 71,90 Q 85,80 99,90" stroke="#3730a3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 111,90 Q 125,80 139,90" stroke="#3730a3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="85" cy="90" rx="15" ry="17" fill="white" />
          <ellipse cx="125" cy="90" rx="15" ry="17" fill="white" />
          <circle cx="87" cy="90" r="10" fill="url(#m-iris)" />
          <circle cx="127" cy="90" r="10" fill="url(#m-iris)" />
          <circle cx="87" cy="90" r="10" fill="none" stroke="#3730a3" strokeWidth="0.6" opacity="0.4" />
          <circle cx="127" cy="90" r="10" fill="none" stroke="#3730a3" strokeWidth="0.6" opacity="0.4" />
          <circle cx="88" cy="88" r="4.5" fill="#1e1b4b" />
          <circle cx="128" cy="88" r="4.5" fill="#1e1b4b" />
          <circle cx="91" cy="84" r="4" fill="white" opacity="0.95" />
          <circle cx="131" cy="84" r="4" fill="white" opacity="0.95" />
          <circle cx="83" cy="94" r="2" fill="white" opacity="0.35" />
          <circle cx="123" cy="94" r="2" fill="white" opacity="0.35" />
          <circle cx="90" cy="86" r="1.2" fill="white" opacity="0.6" />
          <circle cx="130" cy="86" r="1.2" fill="white" opacity="0.6" />
        </>
      )}

      {/* Sourcils */}
      {!sleeping && !eyeClosed && (
        <>
          <path d={happy ? "M 72 74 Q 84 68 96 74" : "M 73 76 Q 84 72 95 76"}
            stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d={happy ? "M 114 74 Q 126 68 138 74" : "M 115 76 Q 126 72 137 76"}
            stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
        </>
      )}

      {/* Nez */}
      {!sleeping && (
        <>
          <ellipse cx="105" cy="102" rx="4.5" ry="3" fill="#6366f1" opacity="0.45" />
          <circle cx="103" cy="101" r="1.5" fill="white" opacity="0.3" />
        </>
      )}

      {/* Bouche */}
      {speaking && mouthOpen ? (
        <>
          <path d="M 90 110 Q 105 122 120 110" fill="#4c2066" />
          <path d="M 94 111 Q 105 117 116 111" fill="white" opacity="0.5" />
        </>
      ) : sleeping ? (
        <path d="M 95 110 Q 105 114 115 110" stroke="#3730a3" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path d="M 90 110 Q 105 120 120 110" stroke="#3730a3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {happy && <path d="M 95 112 Q 105 118 115 112" fill="#818cf8" opacity="0.15" />}
        </>
      )}

      {/* Joues */}
      <circle cx="64" cy="104" r="10" fill="url(#m-cheek)" />
      <circle cx="146" cy="104" r="10" fill="url(#m-cheek)" />

      {/* Cristal bleu sur le front */}
      <g filter="url(#m-glow)">
        <polygon points="105,34 110,46 120,47 112,53 115,64 105,57 95,64 98,53 90,47 100,46" fill="#60a5fa" />
        <polygon points="105,39 108,46 115,47 110,51 112,58 105,54 98,58 100,51 95,47 102,46" fill="#93c5fd" opacity="0.5" />
        <circle cx="105" cy="50" r="3" fill="white" opacity="0.35" />
      </g>

      {/* ZZZ */}
      {sleeping && (
        <>
          <text x="145" y="62" fontSize="10" fill="#818cf8" fontWeight="bold" fontFamily="sans-serif" opacity="0.6">z</text>
          <text x="155" y="48" fontSize="13" fill="#818cf8" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">z</text>
          <text x="165" y="32" fontSize="16" fill="#818cf8" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">z</text>
        </>
      )}

      {/* Particules */}
      {(mood === "excited" || mood === "proud") && (
        <>
          <circle cx="28" cy="35" r="2.5" fill="#60a5fa" opacity="0.6" />
          <circle cx="182" cy="45" r="2" fill="#a78bfa" opacity="0.5" />
          <text x="25" y="65" fontSize="9" fill="#fbbf24" opacity="0.4" fontFamily="sans-serif">✦</text>
          <text x="178" y="68" fontSize="7" fill="#818cf8" opacity="0.3" fontFamily="sans-serif">✦</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LUMO GUARDIAN — Collège/Lycée (12-18 ans)
// Style anime mature, yeux en amande, corps structuré,
// cape d'énergie, runes lumineuses, constellation
// ─────────────────────────────────────────────────────────────────────────────
function LumoGuardian({
  mood, blink, speaking, mouthOpen,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean }) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy" || mood === "excited" || mood === "proud";
  const excited = mood === "excited";
  const eyeClosed = sleeping || blink;

  return (
    <svg viewBox="0 0 260 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="t-head" cx="40%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="25%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </radialGradient>
        <radialGradient id="t-body" cx="48%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="40%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id="t-cape-l" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#312e81" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="t-cape-r" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#312e81" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="t-iris" cx="45%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="30%" stopColor="#3b82f6" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id="t-armor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#312e81" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="t-gem" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id="t-shine" cx="35%" cy="22%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="t-shadow">
          <stop offset="0%" stopColor="#0a0a2a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a0a2a" stopOpacity="0" />
        </radialGradient>
        <filter id="t-glow">
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="t-glow2">
          <feGaussianBlur stdDeviation="4" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ombre */}
      <ellipse cx="130" cy="368" rx="55" ry="9" fill="url(#t-shadow)" />

      {/* Cape */}
      <path d="M 88 195 Q 45 240 55 320 Q 62 348 85 340 Q 78 290 84 230 Z" fill="url(#t-cape-l)" />
      <path d="M 172 195 Q 215 240 205 320 Q 198 348 175 340 Q 182 290 176 230 Z" fill="url(#t-cape-r)" />

      {/* Corps structuré */}
      <path d="M 96 195 Q 92 210 94 245 Q 96 260 110 268 L 130 270 L 150 268 Q 164 260 166 245 Q 168 210 164 195 Q 150 185 130 183 Q 110 185 96 195" fill="url(#t-body)" />
      <path d="M 96 195 Q 92 210 94 245 Q 96 260 110 268 L 130 270 L 150 268 Q 164 260 166 245 Q 168 210 164 195 Q 150 185 130 183 Q 110 185 96 195" fill="url(#t-shine)" />

      {/* Plastron */}
      <path d="M 110 195 Q 130 190 150 195 Q 152 220 130 235 Q 108 220 110 195" fill="url(#t-armor)" stroke="#6366f1" strokeWidth="0.5" opacity="0.6" />

      {/* Cristal de poitrine */}
      <g filter="url(#t-glow)">
        <polygon points="130,200 135,210 133,222 130,225 127,222 125,210" fill="url(#t-gem)" />
        <polygon points="130,204 133,210 132,219 130,221 128,219 127,210" fill="#93c5fd" opacity="0.5" />
      </g>

      {/* Runes sur le corps */}
      <path d="M 108 240 L 112 248 L 108 256" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.25" />
      <path d="M 152 240 L 148 248 L 152 256" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.25" />

      {/* Bras */}
      <path d={excited
        ? "M 92 200 Q 55 180 40 190 Q 32 200 38 206"
        : happy
        ? "M 92 200 Q 62 192 50 204 Q 44 214 50 220"
        : "M 92 200 Q 68 198 55 210 Q 46 222 50 228"}
        fill="#4f46e5" stroke="#312e81" strokeWidth="0.8" />
      <path d={excited
        ? "M 168 196 Q 205 174 220 184 Q 228 194 222 200"
        : happy
        ? "M 168 196 Q 198 186 210 198 Q 218 210 212 216"
        : "M 168 196 Q 192 192 205 204 Q 214 216 210 222"}
        fill="#4f46e5" stroke="#312e81" strokeWidth="0.8" />

      {/* Runes sur les bras */}
      <path d="M 62 218 Q 58 216 56 220" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.2" />
      <path d="M 198 212 Q 202 210 204 214" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.2" />

      {/* Jambes */}
      <path d="M 108 266 L 104 310 Q 98 330 104 338 Q 112 344 122 336 L 124 310 L 118 268" fill="#312e81" />
      <path d="M 102 322 Q 114 318 122 322" stroke="#4f46e5" strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M 142 268 L 136 310 Q 130 330 136 338 Q 144 344 154 336 L 156 310 L 152 266" fill="#312e81" />
      <path d="M 134 322 Q 146 318 154 322" stroke="#4f46e5" strokeWidth="1.2" fill="none" opacity="0.4" />

      {/* Queue majestueuse */}
      <path d="M 168 280 Q 205 265 215 290 Q 222 315 206 325 Q 195 332 198 315 Q 202 298 188 290"
        fill="none" stroke="#312e81" strokeWidth="9" strokeLinecap="round" />
      <path d="M 168 280 Q 205 265 215 290 Q 222 315 206 325 Q 195 332 198 315 Q 202 298 188 290"
        fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" />
      <path d="M 168 280 Q 205 265 215 290 Q 222 315 206 325 Q 195 332 198 315 Q 202 298 188 290"
        fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />

      {/* Tête */}
      <circle cx="130" cy="118" r="62" fill="url(#t-head)" />
      <circle cx="130" cy="118" r="62" fill="url(#t-shine)" />

      {/* Mèches de cheveux */}
      <path d="M 112 58 Q 120 38 130 48 Q 136 32 144 55 Q 150 40 148 58" fill="#4f46e5" />
      <path d="M 118 60 Q 124 44 130 50 Q 134 38 140 56" fill="#6366f1" />
      <path d="M 72 98 Q 58 80 64 66" stroke="#4f46e5" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M 188 98 Q 202 80 196 66" stroke="#4f46e5" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Oreilles longues anime */}
      <path d="M 72 92 Q 28 28 68 4 Q 74 24 72 84" fill="#4f46e5" />
      <path d="M 74 80 Q 40 30 68 12 Q 72 28 73 76" fill="#6366f1" />
      <path d="M 74 68 Q 52 36 68 18" fill="#818cf8" opacity="0.4" />

      <path d="M 188 92 Q 232 28 192 4 Q 186 24 188 84" fill="#4f46e5" />
      <path d="M 186 80 Q 220 30 192 12 Q 188 28 187 76" fill="#6366f1" />
      <path d="M 186 68 Q 208 36 192 18" fill="#818cf8" opacity="0.4" />

      {/* Yeux en amande */}
      {eyeClosed ? (
        <>
          <path d="M 98,112 Q 112,104 126,112" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 134,112 Q 148,104 162,112" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Oeil gauche — amande */}
          <path d="M 98 112 Q 110 98 124 110 Q 114 122 100 118 Z" fill="white" />
          <circle cx="112" cy="112" r="9.5" fill="url(#t-iris)" />
          <circle cx="112" cy="112" r="9.5" fill="none" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.6" />
          <circle cx="112" cy="112" r="7" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
          <circle cx="113" cy="111" r="4.5" fill="#0a0a2e" />
          <circle cx="117" cy="106" r="4" fill="white" opacity="0.95" />
          <circle cx="107" cy="116" r="2.5" fill="white" opacity="0.3" />

          {/* Oeil droit — amande */}
          <path d="M 136 110 Q 148 98 162 112 Q 152 122 138 118 Z" fill="white" />
          <circle cx="150" cy="112" r="9.5" fill="url(#t-iris)" />
          <circle cx="150" cy="112" r="9.5" fill="none" stroke="#1e3a8a" strokeWidth="0.4" opacity="0.6" />
          <circle cx="150" cy="112" r="7" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.3" />
          <circle cx="151" cy="111" r="4.5" fill="#0a0a2e" />
          <circle cx="155" cy="106" r="4" fill="white" opacity="0.95" />
          <circle cx="145" cy="116" r="2.5" fill="white" opacity="0.3" />
        </>
      )}

      {/* Sourcils angulaires */}
      {!sleeping && !eyeClosed && (
        <>
          <path d={happy ? "M 98 96 Q 112 88 126 97" : "M 100 98 Q 112 92 124 99"}
            stroke="#1e1b4b" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d={happy ? "M 134 97 Q 148 88 162 96" : "M 136 99 Q 148 92 160 98"}
            stroke="#1e1b4b" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.55" />
        </>
      )}

      {/* Marques tribales */}
      <path d="M 88 118 L 94 116" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M 86 124 L 92 122" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.2" />
      <path d="M 166 118 L 172 116" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M 168 124 L 174 122" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.2" />

      {/* Nez */}
      {!sleeping && (
        <path d="M 128 128 Q 130 131 132 128" stroke="#312e81" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
      )}

      {/* Bouche */}
      {speaking && mouthOpen ? (
        <>
          <path d="M 118 138 Q 130 146 142 138" fill="#1e1040" />
          <path d="M 122 139 Q 130 143 138 139" fill="white" opacity="0.3" />
        </>
      ) : sleeping ? (
        <path d="M 122 138 Q 130 141 138 138" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      ) : (
        <path d="M 120 138 Q 130 143 140 138" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />
      )}

      {/* PAS de joues roses pour l'ado */}

      {/* Constellation sur le front */}
      <g filter="url(#t-glow2)">
        <polygon points="130,48 137,62 150,64 140,74 144,88 130,80 116,88 120,74 110,64 123,62" fill="#3b82f6" />
        <polygon points="130,54 135,64 144,65 137,72 140,82 130,76 120,82 123,72 116,65 125,64" fill="#60a5fa" opacity="0.6" />
        <polygon points="130,59 133,65 139,66 135,70 137,77 130,73 123,77 125,70 121,66 127,65" fill="#93c5fd" opacity="0.4" />
        <circle cx="130" cy="68" r="4" fill="#bfdbfe" opacity="0.3" />
      </g>

      {/* ZZZ */}
      {sleeping && (
        <>
          <text x="170" y="80" fontSize="12" fill="#6366f1" fontWeight="bold" fontFamily="sans-serif" opacity="0.5">z</text>
          <text x="182" y="62" fontSize="15" fill="#6366f1" fontWeight="bold" fontFamily="sans-serif" opacity="0.6">z</text>
          <text x="194" y="42" fontSize="18" fill="#6366f1" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">z</text>
        </>
      )}

      {/* Particules */}
      {(mood === "excited" || mood === "proud") && (
        <>
          <circle cx="30" cy="55" r="2.5" fill="#60a5fa" opacity="0.5" />
          <circle cx="232" cy="65" r="2" fill="#818cf8" opacity="0.4" />
          <circle cx="50" cy="160" r="1.5" fill="#a5b4fc" opacity="0.3" />
          <circle cx="215" cy="170" r="1.5" fill="#60a5fa" opacity="0.3" />
          <text x="25" y="80" fontSize="10" fill="#fbbf24" opacity="0.3" fontFamily="sans-serif">✦</text>
          <text x="230" y="85" fontSize="8" fill="#a78bfa" opacity="0.3" fontFamily="sans-serif">✦</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal exporté
// ─────────────────────────────────────────────────────────────────────────────
export default function LumoCharacter({
  ageGroup, level = 1, mood = "idle", speaking = false,
  size = 160, onClick, className = "",
}: LumoProps) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (mood === "sleeping") return;
    let timeout: ReturnType<typeof setTimeout>;
    function scheduleBlink() {
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); scheduleBlink(); }, 130);
      }, 2200 + Math.random() * 3800);
    }
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [mood]);

  useEffect(() => {
    if (!speaking) { setMouthOpen(false); return; }
    const interval = setInterval(() => setMouthOpen((o) => !o), 180);
    return () => clearInterval(interval);
  }, [speaking]);

  const animClass =
    mood === "sleeping" ? "lumo-sleeping" :
    mood === "excited"  ? "lumo-excited"  :
    mood === "happy" || mood === "proud" ? "lumo-happy" :
    "lumo-idle";

  const heightRatio = ageGroup === "college-lycee" ? 1.46 : ageGroup === "primaire" ? 1.31 : 1.2;
  const props = { mood, blink, speaking, mouthOpen };

  return (
    <div
      className={`relative inline-block select-none ${onClick ? "cursor-pointer active:scale-95 transition-transform" : ""} ${className}`}
      style={{ width: size, height: size * heightRatio }}
      onClick={onClick}
    >
      <div className={`w-full h-full ${animClass}`}>
        {ageGroup === "maternelle"    && <LumoMaternelle {...props} />}
        {ageGroup === "primaire"      && <LumoExplorateur {...props} />}
        {ageGroup === "college-lycee" && <LumoGuardian {...props} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires exportés
// ─────────────────────────────────────────────────────────────────────────────
export function getLumoMood(child: {
  streak: number; xp: number; level: number; lastActivity: string | null;
}): LumoMood {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) return "sleeping";
  const hasPlayedToday = child.lastActivity
    ? new Date(child.lastActivity).toDateString() === new Date().toDateString()
    : false;
  if (child.streak >= 7) return "excited";
  if (child.level >= 5 && hasPlayedToday) return "proud";
  if (!hasPlayedToday) return "happy";
  if (child.streak >= 3) return "happy";
  return "idle";
}

export function getLumoMessage(child: {
  name: string; streak: number; level: number; lastActivity: string | null;
}): string {
  const firstName = child.name.split(" ")[0];
  const hour = new Date().getHours();
  const hasPlayedToday = child.lastActivity
    ? new Date(child.lastActivity).toDateString() === new Date().toDateString()
    : false;

  if (hour >= 22 || hour < 7) return `Chut… je dors 😴 Reviens demain ${firstName} !`;
  if (child.streak >= 7) return `${child.streak} jours d'affilée ! Tu es INARRÊTABLE ! 🔥🔥`;
  if (child.streak >= 3) return `${child.streak} jours consécutifs ! Quelle régularité ! 💪`;
  if (!hasPlayedToday && hour < 12) return `Bonjour ${firstName} ! Je t'attendais ! ☀️`;
  if (!hasPlayedToday && hour < 18) return `Coucou ${firstName} ! Une session ensemble ? 🎯`;
  if (!hasPlayedToday) return `Bonsoir ${firstName} ! Une dernière aventure ? 🌙`;
  if (child.level >= 5) return `Niveau ${child.level} ! Tu grandis si vite ${firstName} ! ⭐`;
  const msgs = [
    `Continue comme ça ${firstName}, tu es fantastique ! 🌟`,
    `Chaque exercice te rend plus fort(e) ! 💪`,
    `Je suis tellement fier de toi ! 🎉`,
    `Tu veux essayer un nouveau module ? 🚀`,
    `Ensemble on peut tout apprendre ! 🤝`,
  ];
  return msgs[Math.floor(Date.now() / 10000) % msgs.length];
}
