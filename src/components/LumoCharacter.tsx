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
// Bouche — partagée entre les 3 personnages
// ─────────────────────────────────────────────────────────────────────────────
function Mouth({
  cx, cy, w, mood, speaking, mouthOpen, strokeColor,
}: {
  cx: number; cy: number; w: number;
  mood: LumoMood; speaking: boolean; mouthOpen: boolean; strokeColor: string;
}) {
  const sleeping = mood === "sleeping";
  const smile = mood === "happy" || mood === "excited" || mood === "proud";

  if (sleeping) {
    return <path d={`M${cx - w * 0.5},${cy} Q${cx},${cy + 4} ${cx + w * 0.5},${cy}`}
      stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }

  if (speaking && mouthOpen) {
    // Bouche ouverte qui parle
    return (
      <>
        <path d={`M${cx - w * 0.5},${cy - 1} Q${cx},${cy + w * 0.55} ${cx + w * 0.5},${cy - 1}`}
          fill="#8B1A2E" />
        {/* Dents du haut */}
        <path d={`M${cx - w * 0.45},${cy - 1} Q${cx},${cy + 6} ${cx + w * 0.45},${cy - 1}`}
          fill="white" />
        {/* Dents séparées */}
        <line x1={cx} y1={cy - 1} x2={cx} y2={cy + 5} stroke="#E5E7EB" strokeWidth="0.8" />
      </>
    );
  }

  if (smile) {
    return <path d={`M${cx - w * 0.55},${cy} Q${cx},${cy + w * 0.6} ${cx + w * 0.55},${cy}`}
      stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />;
  }

  return <path d={`M${cx - w * 0.4},${cy} Q${cx},${cy + w * 0.4} ${cx + w * 0.4},${cy}`}
    stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATERNELLE — petit enfant (grande tête, salopette, bras courts)
// ─────────────────────────────────────────────────────────────────────────────
function LumoChildMaternelle({
  mood, blink, speaking, mouthOpen, level,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean; level: number }) {
  const sleeping = mood === "sleeping";
  const happy    = mood === "happy" || mood === "excited" || mood === "proud";
  const excited  = mood === "excited";
  const eyeClosed = sleeping || blink;

  const leftArmD  = excited ? "M34,113 Q8,90 6,68"  : happy ? "M34,118 Q10,108 8,132"  : "M34,122 Q12,132 10,154";
  const rightArmD = excited ? "M86,113 Q112,90 114,68" : happy ? "M86,118 Q110,108 112,132" : "M86,122 Q108,132 110,154";
  const lhx = excited ? 5  : happy ? 7   : 9;
  const lhy = excited ? 65 : happy ? 130 : 155;
  const rhx = excited ? 115 : happy ? 113 : 111;
  const rhy = excited ? 65  : happy ? 130 : 155;

  return (
    <svg viewBox="0 0 120 215" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="matSkin" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FEE5C0" /><stop offset="100%" stopColor="#FBBF24" />
        </radialGradient>
        <radialGradient id="matFace" cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#FFF3DC" /><stop offset="100%" stopColor="#FDDCB5" />
        </radialGradient>
      </defs>

      {/* ── Chaussures ── */}
      <ellipse cx="46" cy="206" rx="17" ry="9" fill="#DC2626" />
      <ellipse cx="74" cy="206" rx="17" ry="9" fill="#DC2626" />
      <ellipse cx="43" cy="203" rx="10" ry="5" fill="#EF4444" />
      <ellipse cx="71" cy="203" rx="10" ry="5" fill="#EF4444" />

      {/* ── Jambes ── */}
      <rect x="39" y="160" width="14" height="48" rx="7" fill="url(#matSkin)" />
      <rect x="67" y="160" width="14" height="48" rx="7" fill="url(#matSkin)" />

      {/* ── Salopette ── */}
      <rect x="33" y="108" width="54" height="58" rx="14" fill="#3B82F6" />
      {/* Bavette salopette */}
      <rect x="43" y="95" width="34" height="28" rx="9" fill="#3B82F6" />
      {/* Bretelles */}
      <path d="M43,108 Q40,100 43,95" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M77,108 Q80,100 77,95" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Poche */}
      <rect x="51" y="127" width="18" height="14" rx="6" fill="#2563EB" />
      <line x1="60" y1="127" x2="60" y2="141" stroke="#1D4ED8" strokeWidth="1.5" />
      {/* T-shirt visible */}
      <rect x="37" y="108" width="46" height="18" rx="8" fill="#FEF9C3" />

      {/* ── Bras ── */}
      <path d={leftArmD}  stroke="url(#matSkin)" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d={rightArmD} stroke="url(#matSkin)" strokeWidth="13" strokeLinecap="round" fill="none" />
      {/* Mains */}
      <circle cx={lhx} cy={lhy} r="9.5" fill="url(#matSkin)" />
      <circle cx={rhx} cy={rhy} r="9.5" fill="url(#matSkin)" />
      {/* Doigts hints */}
      <circle cx={lhx - 3} cy={lhy - 8} r="4" fill="url(#matSkin)" />
      <circle cx={lhx + 4} cy={lhy - 9} r="4" fill="url(#matSkin)" />
      <circle cx={rhx + 3} cy={rhy - 8} r="4" fill="url(#matSkin)" />
      <circle cx={rhx - 4} cy={rhy - 9} r="4" fill="url(#matSkin)" />

      {/* ── Cou ── */}
      <rect x="54" y="97" width="12" height="17" rx="6" fill="url(#matSkin)" />

      {/* ── Oreilles ── */}
      <ellipse cx="22" cy="72" rx="7" ry="10" fill="url(#matSkin)" />
      <ellipse cx="98" cy="72" rx="7" ry="10" fill="url(#matSkin)" />
      <ellipse cx="22" cy="72" rx="4" ry="6" fill="#F9A8D4" opacity="0.4" />
      <ellipse cx="98" cy="72" rx="4" ry="6" fill="#F9A8D4" opacity="0.4" />

      {/* ── Tête ── */}
      <ellipse cx="60" cy="68" rx="38" ry="36" fill="url(#matFace)" />

      {/* ── Cheveux ── */}
      <ellipse cx="60" cy="34" rx="36" ry="18" fill="#92400E" />
      <circle cx="28" cy="50" r="14" fill="#92400E" />
      <circle cx="92" cy="50" r="14" fill="#92400E" />
      <circle cx="42" cy="36" r="13" fill="#92400E" />
      <circle cx="60" cy="33" r="14" fill="#7C3410" />
      <circle cx="78" cy="36" r="13" fill="#92400E" />
      {/* Mèche du devant */}
      <path d="M50,40 Q60,52 55,60" stroke="#7C3410" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* ── Yeux ── */}
      {eyeClosed ? (
        <>
          <path d="M32,66 Q44,58 56,66" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M64,66 Q76,58 88,66" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {sleeping && <>
            <path d="M30,62 Q44,55 58,62" stroke="#93C5FD" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          </>}
        </>
      ) : (
        <>
          <ellipse cx="44" cy="65" rx="13" ry="15" fill="white" />
          <ellipse cx="76" cy="65" rx="13" ry="15" fill="white" />
          {/* Iris coloré */}
          <circle cx="44" cy="67" r="9" fill={happy ? "#2563EB" : "#1D4ED8"} />
          <circle cx="76" cy="67" r="9" fill={happy ? "#2563EB" : "#1D4ED8"} />
          {/* Pupille */}
          <circle cx="44" cy="67" r="5" fill="#0F172A" />
          <circle cx="76" cy="67" r="5" fill="#0F172A" />
          {/* Reflets */}
          <circle cx="41" cy="63" r="3" fill="white" />
          <circle cx="73" cy="63" r="3" fill="white" />
          <circle cx="46" cy="69" r="1.5" fill="white" opacity="0.6" />
          <circle cx="78" cy="69" r="1.5" fill="white" opacity="0.6" />
          {/* Sourcils */}
          {happy && <>
            <path d="M33,52 Q44,46 55,52" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M65,52 Q76,46 87,52" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>}
          {/* Cils supérieurs */}
          <path d="M31,58 Q44,52 57,58" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M63,58 Q76,52 89,58" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Nez ── */}
      {!sleeping && <ellipse cx="60" cy="77" rx="5" ry="3.5" fill="#F9A8D4" opacity="0.6" />}

      {/* ── Joues ── */}
      <ellipse cx="28" cy="80" rx="10" ry="6" fill="#FCA5A5" opacity="0.55" />
      <ellipse cx="92" cy="80" rx="10" ry="6" fill="#FCA5A5" opacity="0.55" />

      {/* ── Bouche ── */}
      <Mouth cx={60} cy={86} w={22} mood={mood} speaking={speaking} mouthOpen={mouthOpen} strokeColor="#C2526E" />

      {/* ── Couronne niveau 10+ ── */}
      {level >= 10 && (
        <path d="M36,32 L42,20 L60,28 L78,20 L84,32 L60,38 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      )}

      {/* ── ZZZ endormi ── */}
      {sleeping && (
        <>
          <text x="82" y="45" fontSize="11" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="88" y="34" fontSize="14" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="95" y="21" fontSize="17" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}
      {/* ── Étoiles fier / excited ── */}
      {(mood === "proud" || mood === "excited") && (
        <>
          <text x="4"   y="55" fontSize="14" fill="#FCD34D" fontFamily="sans-serif">✦</text>
          <text x="104" y="50" fontSize="12" fill="#FCD34D" fontFamily="sans-serif">✦</text>
          <text x="8"   y="35" fontSize="9"  fill="#FCD34D" fontFamily="sans-serif">✦</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMAIRE — enfant de 8-10 ans (T-shirt + sac à dos visible)
// ─────────────────────────────────────────────────────────────────────────────
function LumoChildPrimaire({
  mood, blink, speaking, mouthOpen, level,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean; level: number }) {
  const sleeping = mood === "sleeping";
  const happy    = mood === "happy" || mood === "excited" || mood === "proud";
  const excited  = mood === "excited";
  const eyeClosed = sleeping || blink;

  const leftArmD  = excited ? "M36,110 Q8,88 6,64"   : happy ? "M36,114 Q10,104 8,128" : "M36,118 Q13,130 11,152";
  const rightArmD = excited ? "M84,110 Q112,88 114,64" : happy ? "M84,114 Q110,104 112,128" : "M84,118 Q107,130 109,152";
  const lhx = excited ? 5  : happy ? 7   : 10;
  const lhy = excited ? 61 : happy ? 126 : 153;
  const rhx = excited ? 115 : happy ? 113 : 110;
  const rhy = excited ? 61  : happy ? 126 : 153;

  return (
    <svg viewBox="0 0 120 215" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="priSkin" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDE8C8" /><stop offset="100%" stopColor="#E8A87C" />
        </radialGradient>
        <radialGradient id="priFace" cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#FFF0DC" /><stop offset="100%" stopColor="#F5C99B" />
        </radialGradient>
      </defs>

      {/* ── Baskets ── */}
      <rect x="36" y="200" width="22" height="11" rx="6" fill="#1E3A5F" />
      <rect x="62" y="200" width="22" height="11" rx="6" fill="#1E3A5F" />
      <rect x="36" y="198" width="22" height="8" rx="5" fill="#3B82F6" />
      <rect x="62" y="198" width="22" height="8" rx="5" fill="#3B82F6" />
      <line x1="40" y1="201" x2="54" y2="201" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="66" y1="201" x2="80" y2="201" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Jeans ── */}
      <rect x="38" y="158" width="16" height="46" rx="8" fill="#1E40AF" />
      <rect x="66" y="158" width="16" height="46" rx="8" fill="#1E40AF" />
      <line x1="46" y1="160" x2="46" y2="200" stroke="#1D3566" strokeWidth="1" opacity="0.5" />
      <line x1="74" y1="160" x2="74" y2="200" stroke="#1D3566" strokeWidth="1" opacity="0.5" />

      {/* ── T-shirt teal ── */}
      <rect x="33" y="105" width="54" height="58" rx="13" fill="#0D9488" />
      {/* Étoile sur le t-shirt */}
      <path d="M60,118 L62.5,125 L70,125 L64,130 L66.5,137 L60,132 L53.5,137 L56,130 L50,125 L57.5,125 Z"
        fill={level >= 5 ? "#FCD34D" : "#CCFBF1"} />
      {/* Col t-shirt */}
      <path d="M48,108 Q60,116 72,108" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Bras ── */}
      <path d={leftArmD}  stroke="url(#priSkin)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d={rightArmD} stroke="url(#priSkin)" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx={lhx} cy={lhy} r="9" fill="url(#priSkin)" />
      <circle cx={rhx} cy={rhy} r="9" fill="url(#priSkin)" />
      <circle cx={lhx - 2} cy={lhy - 7} r="3.5" fill="url(#priSkin)" />
      <circle cx={lhx + 4} cy={lhy - 8} r="3.5" fill="url(#priSkin)" />
      <circle cx={rhx + 2} cy={rhy - 7} r="3.5" fill="url(#priSkin)" />
      <circle cx={rhx - 4} cy={rhy - 8} r="3.5" fill="url(#priSkin)" />

      {/* ── Cou ── */}
      <rect x="55" y="96" width="10" height="15" rx="5" fill="url(#priSkin)" />

      {/* ── Oreilles ── */}
      <ellipse cx="24" cy="73" rx="6.5" ry="9" fill="url(#priSkin)" />
      <ellipse cx="96" cy="73" rx="6.5" ry="9" fill="url(#priSkin)" />
      <ellipse cx="24" cy="73" rx="3.5" ry="5.5" fill="#F9A8D4" opacity="0.3" />
      <ellipse cx="96" cy="73" rx="3.5" ry="5.5" fill="#F9A8D4" opacity="0.3" />

      {/* ── Tête ── */}
      <ellipse cx="60" cy="70" rx="36" ry="32" fill="url(#priFace)" />

      {/* ── Cheveux (châtain moyen) ── */}
      <ellipse cx="60" cy="40" rx="34" ry="16" fill="#78350F" />
      <circle cx="26" cy="55" r="12" fill="#92400E" />
      <circle cx="94" cy="55" r="12" fill="#92400E" />
      <ellipse cx="60" cy="38" rx="28" ry="12" fill="#92400E" />
      {/* Mèche */}
      <path d="M46,44 Q54,56 50,64" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M70,46 Q68,58 66,65" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Sourcils ── */}
      {!sleeping && (
        <>
          <path d={happy ? "M32,55 Q44,49 56,55" : "M33,57 Q44,53 55,57"}
            stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={happy ? "M64,55 Q76,49 88,55" : "M65,57 Q76,53 87,57"}
            stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Yeux ── */}
      {eyeClosed ? (
        <>
          <path d="M33,67 Q44,60 55,67" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M65,67 Q76,60 87,67" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="44" cy="67" rx="12" ry="13" fill="white" />
          <ellipse cx="76" cy="67" rx="12" ry="13" fill="white" />
          <circle cx="44" cy="69" r="8" fill={happy ? "#059669" : "#065F46"} />
          <circle cx="76" cy="69" r="8" fill={happy ? "#059669" : "#065F46"} />
          <circle cx="44" cy="69" r="4.5" fill="#0F172A" />
          <circle cx="76" cy="69" r="4.5" fill="#0F172A" />
          <circle cx="41" cy="65" r="2.5" fill="white" />
          <circle cx="73" cy="65" r="2.5" fill="white" />
          <circle cx="46" cy="71" r="1.5" fill="white" opacity="0.5" />
          <circle cx="78" cy="71" r="1.5" fill="white" opacity="0.5" />
          {/* Cils */}
          <path d="M32,62 Q44,56 56,62" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M64,62 Q76,56 88,62" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Nez ── */}
      {!sleeping && <path d="M55,78 Q60,82 65,78" stroke="#C8956C" strokeWidth="1.8" strokeLinecap="round" fill="none" />}

      {/* ── Joues ── */}
      <ellipse cx="28" cy="79" rx="9" ry="5.5" fill="#FCA5A5" opacity="0.45" />
      <ellipse cx="92" cy="79" rx="9" ry="5.5" fill="#FCA5A5" opacity="0.45" />

      {/* ── Bouche ── */}
      <Mouth cx={60} cy={86} w={20} mood={mood} speaking={speaking} mouthOpen={mouthOpen} strokeColor="#9F1239" />

      {/* ── Couronne ── */}
      {level >= 10 && (
        <path d="M38,36 L44,24 L60,32 L76,24 L82,36 L60,42 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      )}

      {/* ── ZZZ ── */}
      {sleeping && (
        <>
          <text x="84" y="48" fontSize="10" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="90" y="37" fontSize="13" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="97" y="24" fontSize="16" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}
      {(mood === "proud" || mood === "excited") && (
        <>
          <text x="3"   y="55" fontSize="14" fill="#34D399" fontFamily="sans-serif">✦</text>
          <text x="107" y="50" fontSize="12" fill="#34D399" fontFamily="sans-serif">✦</text>
          <text x="6"   y="35" fontSize="9"  fill="#34D399" fontFamily="sans-serif">✦</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLÈGE/LYCÉE — ado (proportions adultes, hoodie, casque autour du cou)
// ─────────────────────────────────────────────────────────────────────────────
function LumoChildCollege({
  mood, blink, speaking, mouthOpen, level,
}: { mood: LumoMood; blink: boolean; speaking: boolean; mouthOpen: boolean; level: number }) {
  const sleeping = mood === "sleeping";
  const happy    = mood === "happy" || mood === "excited" || mood === "proud";
  const excited  = mood === "excited";
  const eyeClosed = sleeping || blink;

  const leftArmD  = excited ? "M36,108 Q8,85 7,60"   : happy ? "M36,112 Q10,102 8,126" : "M36,116 Q13,128 12,152";
  const rightArmD = excited ? "M84,108 Q112,85 113,60" : happy ? "M84,112 Q110,102 112,126" : "M84,116 Q107,128 108,152";
  const lhx = excited ? 6   : happy ? 7   : 11;
  const lhy = excited ? 57  : happy ? 124 : 153;
  const rhx = excited ? 114 : happy ? 113 : 109;
  const rhy = excited ? 57  : happy ? 124 : 153;

  return (
    <svg viewBox="0 0 120 215" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="colSkin" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDDCB5" /><stop offset="100%" stopColor="#C8956C" />
        </radialGradient>
        <radialGradient id="colFace" cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#FDEBD0" /><stop offset="100%" stopColor="#D4A574" />
        </radialGradient>
      </defs>

      {/* ── Chaussures ── */}
      <rect x="36" y="203" width="20" height="10" rx="5" fill="#1C1917" />
      <rect x="64" y="203" width="20" height="10" rx="5" fill="#1C1917" />
      <rect x="36" y="200" width="20" height="7" rx="4" fill="#44403C" />
      <rect x="64" y="200" width="20" height="7" rx="4" fill="#44403C" />

      {/* ── Jeans slim ── */}
      <rect x="39" y="160" width="14" height="47" rx="7" fill="#1E3A5F" />
      <rect x="67" y="160" width="14" height="47" rx="7" fill="#1E3A5F" />

      {/* ── Hoodie ── */}
      <rect x="33" y="102" width="54" height="63" rx="14" fill="#4C1D95" />
      {/* Poche kangourou */}
      <path d="M45,145 Q60,152 75,145 L75,158 Q60,162 45,158 Z" fill="#3B0764" />
      {/* Zip central */}
      <line x1="60" y1="106" x2="60" y2="150" stroke="#3B0764" strokeWidth="1.5" opacity="0.6" />
      {/* Col hoodie */}
      <path d="M46,106 Q60,115 74,106" stroke="#3B0764" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Cordon capuche */}
      <path d="M52,110 Q50,118 48,125" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M68,110 Q70,118 72,125" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="125" r="2.5" fill="#6D28D9" />
      <circle cx="72" cy="125" r="2.5" fill="#6D28D9" />

      {/* ── Casque autour du cou ── */}
      <path d="M42,112 Q42,105 60,103 Q78,105 78,112" fill="none" stroke="#7C3AED" strokeWidth="3.5" />
      <rect x="36" y="109" width="9" height="14" rx="4" fill="#6D28D9" />
      <rect x="75" y="109" width="9" height="14" rx="4" fill="#6D28D9" />

      {/* ── Bras ── */}
      <path d={leftArmD}  stroke="url(#colSkin)" strokeWidth="11.5" strokeLinecap="round" fill="none" />
      <path d={rightArmD} stroke="url(#colSkin)" strokeWidth="11.5" strokeLinecap="round" fill="none" />
      <circle cx={lhx} cy={lhy} r="8.5" fill="url(#colSkin)" />
      <circle cx={rhx} cy={rhy} r="8.5" fill="url(#colSkin)" />
      <circle cx={lhx - 1} cy={lhy - 7} r="3.5" fill="url(#colSkin)" />
      <circle cx={lhx + 4} cy={lhy - 7} r="3.5" fill="url(#colSkin)" />
      <circle cx={rhx + 1} cy={rhy - 7} r="3.5" fill="url(#colSkin)" />
      <circle cx={rhx - 4} cy={rhy - 7} r="3.5" fill="url(#colSkin)" />

      {/* ── Cou ── */}
      <rect x="55" y="94" width="10" height="14" rx="5" fill="url(#colSkin)" />

      {/* ── Oreilles ── */}
      <ellipse cx="27" cy="74" rx="6" ry="8" fill="url(#colSkin)" />
      <ellipse cx="93" cy="74" rx="6" ry="8" fill="url(#colSkin)" />

      {/* ── Tête ── */}
      <ellipse cx="60" cy="70" rx="33" ry="30" fill="url(#colFace)" />

      {/* ── Cheveux ── */}
      <ellipse cx="60" cy="42" rx="31" ry="14" fill="#1C1917" />
      <circle cx="29" cy="57" r="10" fill="#292524" />
      <circle cx="91" cy="57" r="10" fill="#292524" />
      {/* Mèches stylées */}
      <path d="M38,46 Q44,58 40,67" stroke="#292524" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M60,40 Q58,52 55,62" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M72,46 Q70,56 68,64" stroke="#292524" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ── Sourcils (plus épais, expressifs) ── */}
      {!sleeping && (
        <>
          <path d={happy ? "M33,57 Q44,51 55,57" : "M34,59 Q44,55 54,59"}
            stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d={happy ? "M65,57 Q76,51 87,57" : "M66,59 Q76,55 86,59"}
            stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Yeux (amande, plus sophistiqués) ── */}
      {eyeClosed ? (
        <>
          <path d="M33,68 Q44,62 55,68" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M65,68 Q76,62 87,68" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="44" cy="68" rx="12" ry="10" fill="white" />
          <ellipse cx="76" cy="68" rx="12" ry="10" fill="white" />
          <circle cx="44" cy="68" r="7" fill={happy ? "#6D28D9" : "#4C1D95"} />
          <circle cx="76" cy="68" r="7" fill={happy ? "#6D28D9" : "#4C1D95"} />
          <circle cx="44" cy="68" r="4" fill="#0F172A" />
          <circle cx="76" cy="68" r="4" fill="#0F172A" />
          <circle cx="41" cy="65" r="2.5" fill="white" />
          <circle cx="73" cy="65" r="2.5" fill="white" />
          {/* Cils */}
          <path d="M32,63 Q44,58 56,63" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M64,63 Q76,58 88,63" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* ── Nez ── */}
      {!sleeping && (
        <path d="M55,78 Q60,83 65,78" stroke="#A0694A" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      {/* ── Bouche ── */}
      <Mouth cx={60} cy={87} w={18} mood={mood} speaking={speaking} mouthOpen={mouthOpen} strokeColor="#7C2D3B" />

      {/* ── Couronne ── */}
      {level >= 10 && (
        <path d="M40,38 L46,26 L60,34 L74,26 L80,38 L60,44 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      )}

      {/* ── Étoiles niveau 5+ ── */}
      {level >= 5 && level < 10 && (
        <path d="M60,38 L62,43 L68,43 L63,47 L65,52 L60,48 L55,52 L57,47 L52,43 L58,43 Z" fill="#FBBF24" />
      )}

      {/* ── ZZZ ── */}
      {sleeping && (
        <>
          <text x="84" y="48" fontSize="10" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="90" y="37" fontSize="13" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="97" y="24" fontSize="16" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      )}
      {(mood === "proud" || mood === "excited") && (
        <>
          <text x="3"   y="55" fontSize="14" fill="#A78BFA" fontFamily="sans-serif">✦</text>
          <text x="107" y="50" fontSize="12" fill="#A78BFA" fontFamily="sans-serif">✦</text>
          <text x="6"   y="35" fontSize="9"  fill="#A78BFA" fontFamily="sans-serif">✦</text>
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

  // Clignement aléatoire
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

  // Animation bouche qui parle
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

  const props = { mood, blink, speaking, mouthOpen, level };

  return (
    <div
      className={`relative inline-block select-none ${onClick ? "cursor-pointer active:scale-95 transition-transform" : ""} ${className}`}
      style={{ width: size, height: size * 1.15 }}
      onClick={onClick}
    >
      <div className={`w-full h-full ${animClass}`}>
        {ageGroup === "maternelle"    && <LumoChildMaternelle {...props} />}
        {ageGroup === "primaire"      && <LumoChildPrimaire   {...props} />}
        {ageGroup === "college-lycee" && <LumoChildCollege    {...props} />}
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
