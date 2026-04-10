"use client";
import { useEffect, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

interface LumoHouseProps {
  onRoomSelect: (roomId: string) => void;
  childName: string;
  level?: number;
}

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return "dawn";
  if (h >= 9 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

// Palette atmosphérique par moment de la journée
const SKIES: Record<TimeOfDay, { top: string; mid: string; bottom: string; sun: string; ambient: string }> = {
  dawn: {
    top: "#fef3c7",
    mid: "#fed7aa",
    bottom: "#fdba74",
    sun: "#fbbf24",
    ambient: "#fef9e7",
  },
  day: {
    top: "#bae6fd",
    mid: "#dbeafe",
    bottom: "#e0e7ff",
    sun: "#fbbf24",
    ambient: "#eff6ff",
  },
  dusk: {
    top: "#1e1b4b",
    mid: "#7c3aed",
    bottom: "#f472b6",
    sun: "#fb923c",
    ambient: "#fef3c7",
  },
  night: {
    top: "#0c0a1f",
    mid: "#1e1b4b",
    bottom: "#312e81",
    sun: "#f0f9ff",
    ambient: "#4338ca",
  },
};

// ── Layout des pièces dans la maison ──
interface RoomNode {
  id: string;
  name: string;
  shortName: string;
  // Position of window on house façade (viewBox 800x600)
  winX: number;
  winY: number;
  winW: number;
  winH: number;
  // Unique tint color that'll glow inside the window at night
  glowColor: string;
  // Silhouette visible inside (simple decorative element)
  silhouette: "bed" | "desk" | "easel" | "cauldron" | "sofa" | "ball" | "books" | "blackboard" | "plant";
  // For tooltip
  emoji: string;
  floor: "ground" | "first" | "attic" | "annex";
}

const ROOMS: RoomNode[] = [
  // Ground floor (3 rooms)
  { id: "salon", name: "Salon cosy", shortName: "Salon", winX: 170, winY: 360, winW: 90, winH: 85, glowColor: "#fca5a5", silhouette: "sofa", emoji: "🛋️", floor: "ground" },
  { id: "classe", name: "Salle de classe", shortName: "Classe", winX: 290, winY: 360, winW: 90, winH: 85, glowColor: "#a78bfa", silhouette: "blackboard", emoji: "📚", floor: "ground" },
  { id: "bureau", name: "Bureau d'étude", shortName: "Bureau", winX: 410, winY: 360, winW: 90, winH: 85, glowColor: "#6ee7b7", silhouette: "desk", emoji: "📐", floor: "ground" },

  // First floor (3 rooms)
  { id: "chambre", name: "Chambre", shortName: "Chambre", winX: 170, winY: 240, winW: 90, winH: 85, glowColor: "#fde047", silhouette: "bed", emoji: "🛏️", floor: "first" },
  { id: "atelier", name: "Atelier d'art", shortName: "Atelier", winX: 290, winY: 240, winW: 90, winH: 85, glowColor: "#fb923c", silhouette: "easel", emoji: "🎨", floor: "first" },
  { id: "labo", name: "Laboratoire", shortName: "Labo", winX: 410, winY: 240, winW: 90, winH: 85, glowColor: "#67e8f9", silhouette: "cauldron", emoji: "🔬", floor: "first" },

  // Attic (1 room)
  { id: "grenier", name: "Grenier mystère", shortName: "Grenier", winX: 305, winY: 140, winW: 90, winH: 70, glowColor: "#c084fc", silhouette: "books", emoji: "📜", floor: "attic" },

  // Annex / extension (2 rooms — small building on the right)
  { id: "cour", name: "Cour de récré", shortName: "Cour", winX: 560, winY: 260, winW: 80, winH: 75, glowColor: "#fb923c", silhouette: "ball", emoji: "⚽", floor: "annex" },
  { id: "jardin", name: "Serre & jardin", shortName: "Jardin", winX: 560, winY: 370, winW: 80, winH: 75, glowColor: "#86efac", silhouette: "plant", emoji: "🌱", floor: "annex" },
];

// ── Silhouettes vues à travers les fenêtres (tout petits éléments déco) ──
function RoomSilhouette({ type, cx, cy }: { type: RoomNode["silhouette"]; cx: number; cy: number }) {
  const common = { fill: "#1c1917", opacity: 0.3 };
  switch (type) {
    case "bed":
      return (
        <>
          <rect x={cx - 20} y={cy + 8} width="40" height="14" rx="3" {...common} />
          <rect x={cx - 20} y={cy + 2} width="10" height="10" rx="2" {...common} />
        </>
      );
    case "desk":
      return (
        <>
          <rect x={cx - 18} y={cy + 6} width="36" height="5" {...common} />
          <rect x={cx - 16} y={cy + 11} width="3" height="12" {...common} />
          <rect x={cx + 13} y={cy + 11} width="3" height="12" {...common} />
          <rect x={cx - 14} y={cy - 2} width="20" height="8" rx="1" {...common} />
        </>
      );
    case "easel":
      return (
        <>
          <rect x={cx - 14} y={cy - 6} width="28" height="20" rx="1" {...common} />
          <line x1={cx} y1={cy + 14} x2={cx - 12} y2={cy + 25} stroke="#1c1917" strokeWidth="2" opacity="0.3" />
          <line x1={cx} y1={cy + 14} x2={cx + 12} y2={cy + 25} stroke="#1c1917" strokeWidth="2" opacity="0.3" />
        </>
      );
    case "cauldron":
      return (
        <>
          <ellipse cx={cx} cy={cy + 15} rx="18" ry="5" {...common} />
          <path d={`M ${cx - 18} ${cy + 15} Q ${cx - 18} ${cy + 2} ${cx} ${cy} Q ${cx + 18} ${cy + 2} ${cx + 18} ${cy + 15}`} fill="none" stroke="#1c1917" strokeWidth="3" opacity="0.3" />
          <circle cx={cx - 4} cy={cy - 8} r="2" {...common} />
          <circle cx={cx + 4} cy={cy - 12} r="1.5" {...common} />
        </>
      );
    case "sofa":
      return (
        <>
          <rect x={cx - 22} y={cy + 4} width="44" height="14" rx="4" {...common} />
          <rect x={cx - 22} y={cy - 2} width="8" height="10" rx="3" {...common} />
          <rect x={cx + 14} y={cy - 2} width="8" height="10" rx="3" {...common} />
        </>
      );
    case "ball":
      return (
        <>
          <circle cx={cx} cy={cy + 8} r="12" fill="none" stroke="#1c1917" strokeWidth="2" opacity="0.3" />
          <path d={`M ${cx - 12} ${cy + 8} L ${cx + 12} ${cy + 8}`} stroke="#1c1917" strokeWidth="1.5" opacity="0.3" />
          <path d={`M ${cx} ${cy - 4} L ${cx} ${cy + 20}`} stroke="#1c1917" strokeWidth="1.5" opacity="0.3" />
        </>
      );
    case "books":
      return (
        <>
          <rect x={cx - 18} y={cy + 2} width="5" height="16" {...common} />
          <rect x={cx - 12} y={cy - 2} width="5" height="20" {...common} />
          <rect x={cx - 6} y={cy + 4} width="5" height="14" {...common} />
          <rect x={cx} y={cy} width="5" height="18" {...common} />
          <rect x={cx + 6} y={cy + 6} width="5" height="12" {...common} />
        </>
      );
    case "blackboard":
      return (
        <>
          <rect x={cx - 22} y={cy - 8} width="44" height="24" rx="1" fill="#1c1917" opacity="0.35" />
          <line x1={cx - 16} y1={cy - 2} x2={cx + 4} y2={cy - 2} stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1={cx - 16} y1={cy + 4} x2={cx - 2} y2={cy + 4} stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1={cx - 16} y1={cy + 10} x2={cx + 6} y2={cy + 10} stroke="white" strokeWidth="1" opacity="0.5" />
        </>
      );
    case "plant":
      return (
        <>
          <rect x={cx - 8} y={cy + 10} width="16" height="10" rx="1" {...common} />
          <path d={`M ${cx} ${cy + 10} Q ${cx - 8} ${cy - 4} ${cx - 10} ${cy - 12}`} fill="none" stroke="#16a34a" strokeWidth="3" opacity="0.5" />
          <path d={`M ${cx} ${cy + 10} Q ${cx + 8} ${cy - 2} ${cx + 12} ${cy - 10}`} fill="none" stroke="#16a34a" strokeWidth="3" opacity="0.5" />
          <circle cx={cx - 10} cy={cy - 12} r="3" fill="#16a34a" opacity="0.6" />
          <circle cx={cx + 12} cy={cy - 10} r="3" fill="#16a34a" opacity="0.6" />
        </>
      );
    default:
      return null;
  }
}

export default function LumoHouse({ onRoomSelect, childName, level = 1 }: LumoHouseProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tod, setTod] = useState<TimeOfDay>("day");
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    setTod(getTimeOfDay());
    const i = setInterval(() => setTod(getTimeOfDay()), 60000);
    return () => clearInterval(i);
  }, []);

  const sky = SKIES[tod];
  const isDark = tod === "night" || tod === "dusk";
  const windowsLit = isDark || tod === "dawn";

  return (
    <div className="relative w-full" style={{ aspectRatio: "800 / 600" }}>
      <svg viewBox="0 0 800 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Sky gradient - 3 stops for depth */}
          <linearGradient id={`sky-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sky.top} />
            <stop offset="50%" stopColor={sky.mid} />
            <stop offset="100%" stopColor={sky.bottom} />
          </linearGradient>

          {/* Ground gradient */}
          <linearGradient id={`ground-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#1e1b4b" : "#86efac"} />
            <stop offset="100%" stopColor={isDark ? "#0c0a1f" : "#14532d"} />
          </linearGradient>

          {/* House wall gradient - subtle shading */}
          <linearGradient id={`wall-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#3b2a20" : "#f5e6c5"} />
            <stop offset="100%" stopColor={isDark ? "#1a0f08" : "#e7c89f"} />
          </linearGradient>

          {/* Roof - warm reddish gradient */}
          <linearGradient id={`roof-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#4c1d24" : "#a33c45"} />
            <stop offset="100%" stopColor={isDark ? "#2d1114" : "#6b1e26"} />
          </linearGradient>

          {/* Annex wall */}
          <linearGradient id={`annexwall-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#2c1f15" : "#eaddc0"} />
            <stop offset="100%" stopColor={isDark ? "#150c05" : "#d4b890"} />
          </linearGradient>

          {/* Window glow */}
          <radialGradient id={`winglow-${uid}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity={windowsLit ? "1" : "0.4"} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={windowsLit ? "0.5" : "0.1"} />
          </radialGradient>

          {/* Soft ambient light around house at night */}
          <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sky.ambient} stopOpacity={isDark ? "0.25" : "0"} />
            <stop offset="100%" stopColor={sky.ambient} stopOpacity="0" />
          </radialGradient>

          {/* Sun/Moon */}
          <radialGradient id={`celestial-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tod === "night" ? "#fef9c3" : sky.sun} />
            <stop offset="70%" stopColor={tod === "night" ? "#e5e7eb" : sky.sun} />
            <stop offset="100%" stopColor={tod === "night" ? "#d1d5db" : "#f97316"} stopOpacity="0.4" />
          </radialGradient>

          {/* Tree foliage */}
          <radialGradient id={`foliage-${uid}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={isDark ? "#166534" : "#4ade80"} />
            <stop offset="100%" stopColor={isDark ? "#052e16" : "#15803d"} />
          </radialGradient>

          {/* Soft glow filter */}
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation="4" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for hovered window */}
          <filter id={`hoverglow-${uid}`}>
            <feGaussianBlur stdDeviation="8" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Window highlight (vertical light ray effect) */}
          <linearGradient id={`highlight-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0.15" />
            <stop offset="60%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ═══ SKY ═══ */}
        <rect x="0" y="0" width="800" height="460" fill={`url(#sky-${uid})`} />

        {/* Stars (night only) */}
        {tod === "night" && Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 41) % 800;
          const y = (i * 19) % 380;
          const s = (i % 3) * 0.5 + 0.5;
          return (
            <circle key={`s${i}`} cx={x} cy={y} r={s} fill="white">
              <animate
                attributeName="opacity"
                values={`${0.3 + (i % 3) * 0.2};${0.8};${0.3 + (i % 3) * 0.2}`}
                dur={`${2 + (i % 4)}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* Distant mountains (silhouette layer for depth) */}
        <path
          d="M 0 360 L 80 310 L 150 340 L 220 295 L 310 330 L 380 300 L 460 340 L 540 305 L 640 335 L 720 310 L 800 340 L 800 460 L 0 460 Z"
          fill={isDark ? "#1e1b4b" : "#a5b4fc"}
          opacity="0.35"
        />
        <path
          d="M 0 395 L 90 360 L 170 385 L 260 355 L 350 380 L 440 360 L 530 385 L 620 365 L 720 385 L 800 370 L 800 460 L 0 460 Z"
          fill={isDark ? "#312e81" : "#818cf8"}
          opacity="0.25"
        />

        {/* Sun/Moon */}
        <g>
          <circle
            cx={tod === "night" || tod === "dusk" ? 650 : 130}
            cy={tod === "dawn" ? 140 : tod === "day" ? 80 : 100}
            r="50"
            fill={`url(#celestial-${uid})`}
            opacity="0.4"
            filter={`url(#glow-${uid})`}
          />
          <circle
            cx={tod === "night" || tod === "dusk" ? 650 : 130}
            cy={tod === "dawn" ? 140 : tod === "day" ? 80 : 100}
            r="32"
            fill={`url(#celestial-${uid})`}
          />
          {tod === "night" && (
            <>
              <circle cx="640" cy="92" r="3" fill="#9ca3af" opacity="0.5" />
              <circle cx="662" cy="105" r="4" fill="#9ca3af" opacity="0.5" />
              <circle cx="655" cy="85" r="2" fill="#9ca3af" opacity="0.5" />
            </>
          )}
        </g>

        {/* Clouds (day/dawn only) */}
        {!isDark && (
          <g opacity="0.85">
            <ellipse cx="280" cy="75" rx="45" ry="12" fill="white">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="30 0" dur="60s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="300" cy="72" rx="30" ry="10" fill="white">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="30 0" dur="60s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="265" cy="70" rx="22" ry="9" fill="white">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="30 0" dur="60s" repeatCount="indefinite" />
            </ellipse>

            <ellipse cx="520" cy="130" rx="38" ry="10" fill="white" opacity="0.7" />
            <ellipse cx="540" cy="127" rx="26" ry="9" fill="white" opacity="0.7" />
          </g>
        )}

        {/* Ambient glow around house at night */}
        {isDark && (
          <ellipse cx="400" cy="420" rx="400" ry="180" fill={`url(#halo-${uid})`} />
        )}

        {/* ═══ GROUND ═══ */}
        <rect x="0" y="460" width="800" height="140" fill={`url(#ground-${uid})`} />

        {/* Soft ground grass texture */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 23) % 800;
          return (
            <path
              key={`g${i}`}
              d={`M ${x} 465 Q ${x - 1} 460 ${x - 2} 455 M ${x + 3} 465 Q ${x + 3} 461 ${x + 4} 458`}
              stroke={isDark ? "#14532d" : "#166534"}
              strokeWidth="0.7"
              fill="none"
              opacity="0.5"
            />
          );
        })}

        {/* Fireflies at night */}
        {tod === "night" && Array.from({ length: 12 }).map((_, i) => {
          const x = 50 + (i * 67) % 700;
          const y = 380 + (i * 13) % 100;
          return (
            <circle key={`ff${i}`} cx={x} cy={y} r="1.5" fill="#fde047">
              <animate attributeName="opacity" values="0;1;0" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
              <animate attributeName="cy" values={`${y};${y - 30};${y}`} dur={`${5 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* ═══ TREES (decoration, left & right of house) ═══ */}
        {/* Left tree */}
        <g>
          <rect x="48" y="395" width="10" height="70" fill={isDark ? "#1a0f08" : "#78350f"} rx="2" />
          <circle cx="53" cy="400" r="42" fill={`url(#foliage-${uid})`} />
          <circle cx="30" cy="385" r="26" fill={`url(#foliage-${uid})`} />
          <circle cx="76" cy="385" r="26" fill={`url(#foliage-${uid})`} />
          <circle cx="53" cy="360" r="28" fill={`url(#foliage-${uid})`} />
          {!isDark && (
            <>
              <circle cx="38" cy="385" r="3" fill="#ef4444" />
              <circle cx="65" cy="378" r="3" fill="#ef4444" />
              <circle cx="52" cy="395" r="3" fill="#ef4444" />
            </>
          )}
        </g>

        {/* Right tree */}
        <g>
          <rect x="740" y="405" width="9" height="60" fill={isDark ? "#1a0f08" : "#78350f"} rx="2" />
          <circle cx="744" cy="400" r="36" fill={`url(#foliage-${uid})`} />
          <circle cx="725" cy="388" r="22" fill={`url(#foliage-${uid})`} />
          <circle cx="763" cy="388" r="22" fill={`url(#foliage-${uid})`} />
          {!isDark && (
            <>
              <circle cx="735" cy="395" r="2.5" fill="#f59e0b" />
              <circle cx="755" cy="385" r="2.5" fill="#f59e0b" />
            </>
          )}
        </g>

        {/* ═══ HOUSE — MAIN ═══ */}

        {/* Main building walls */}
        <rect x="130" y="230" width="390" height="230" fill={`url(#wall-${uid})`} />

        {/* Timber frame (half-timbered house look) */}
        {!isDark && (
          <g opacity="0.55">
            <line x1="130" y1="340" x2="520" y2="340" stroke="#7c3f1d" strokeWidth="2.5" />
            <line x1="220" y1="230" x2="220" y2="460" stroke="#7c3f1d" strokeWidth="2" />
            <line x1="330" y1="230" x2="330" y2="340" stroke="#7c3f1d" strokeWidth="2" />
            <line x1="430" y1="230" x2="430" y2="340" stroke="#7c3f1d" strokeWidth="2" />
            {/* Diagonal cross-braces */}
            <line x1="130" y1="340" x2="220" y2="230" stroke="#7c3f1d" strokeWidth="2" opacity="0.5" />
            <line x1="220" y1="460" x2="330" y2="340" stroke="#7c3f1d" strokeWidth="2" opacity="0.5" />
          </g>
        )}

        {/* Main roof - triangular attic */}
        <polygon
          points="110,230 325,100 540,230"
          fill={`url(#roof-${uid})`}
        />
        {/* Roof edge (slight 3D) */}
        <polygon points="110,230 540,230 540,238 110,238" fill={isDark ? "#2d1114" : "#6b1e26"} />
        {/* Roof tiles pattern */}
        {!isDark && Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`rt${i}`}
            x1={130 + i * 40}
            y1={220 - i * 6}
            x2={160 + i * 40}
            y2={200 - i * 6}
            stroke="#6b1e26"
            strokeWidth="0.7"
            opacity="0.4"
          />
        ))}

        {/* Chimney with smoke */}
        <rect x="400" y="140" width="30" height="70" fill={isDark ? "#3b2a20" : "#8a5a44"} stroke={isDark ? "#1a0f08" : "#5a3a28"} strokeWidth="1.5" />
        <rect x="395" y="135" width="40" height="10" fill={isDark ? "#1a0f08" : "#5a3a28"} />

        {/* Smoke rising */}
        <g opacity="0.55">
          <circle cx="415" cy="130" r="8" fill="white">
            <animate attributeName="cy" values="130;80;40" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.55;0.3;0" dur="6s" repeatCount="indefinite" />
            <animate attributeName="r" values="8;14;20" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="420" cy="128" r="6" fill="white">
            <animate attributeName="cy" values="128;70;30" dur="6s" repeatCount="indefinite" begin="1s" />
            <animate attributeName="opacity" values="0.5;0.25;0" dur="6s" repeatCount="indefinite" begin="1s" />
            <animate attributeName="r" values="6;12;18" dur="6s" repeatCount="indefinite" begin="1s" />
          </circle>
          <circle cx="412" cy="125" r="5" fill="white">
            <animate attributeName="cy" values="125;65;25" dur="6s" repeatCount="indefinite" begin="2s" />
            <animate attributeName="opacity" values="0.45;0.2;0" dur="6s" repeatCount="indefinite" begin="2s" />
            <animate attributeName="r" values="5;11;16" dur="6s" repeatCount="indefinite" begin="2s" />
          </circle>
        </g>

        {/* ═══ ANNEX building (right side) ═══ */}
        <rect x="540" y="250" width="130" height="210" fill={`url(#annexwall-${uid})`} />
        <polygon points="520,250 605,180 690,250" fill={`url(#roof-${uid})`} />
        <polygon points="520,250 690,250 690,258 520,258" fill={isDark ? "#2d1114" : "#6b1e26"} />

        {!isDark && (
          <line x1="540" y1="355" x2="670" y2="355" stroke="#7c3f1d" strokeWidth="2" opacity="0.55" />
        )}

        {/* Door (between salon and classe, ground floor) */}
        <rect x="230" y="395" width="50" height="65" fill={isDark ? "#1a0f08" : "#5a2d0f"} rx="3" />
        <rect x="233" y="398" width="44" height="32" fill={isDark ? "#2d1114" : "#7c3f1d"} rx="2" />
        <rect x="233" y="432" width="44" height="26" fill={isDark ? "#2d1114" : "#7c3f1d"} rx="2" />
        <circle cx="272" cy="428" r="1.8" fill={isDark ? "#fde047" : "#a16207"} />
        {/* Door lantern (glows at night) */}
        <g>
          <rect x="215" y="395" width="8" height="14" fill={isDark ? "#f59e0b" : "#d97706"} opacity={isDark ? "0.9" : "0.5"} />
          {isDark && <circle cx="219" cy="402" r="15" fill="#fde047" opacity="0.2" />}
        </g>

        {/* ═══ ROOMS (clickable windows) ═══ */}
        {ROOMS.map((room) => {
          const isHovered = hovered === room.id;
          return (
            <g
              key={room.id}
              style={{ cursor: "pointer" }}
              onClick={() => onRoomSelect(room.id)}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Window frame (outer) */}
              <rect
                x={room.winX - 4}
                y={room.winY - 4}
                width={room.winW + 8}
                height={room.winH + 8}
                fill={isDark ? "#1a0f08" : "#5a2d0f"}
                rx="3"
              />

              {/* Window glass - glowing at night */}
              <rect
                x={room.winX}
                y={room.winY}
                width={room.winW}
                height={room.winH}
                fill={windowsLit ? `url(#winglow-${uid})` : room.glowColor}
                opacity={windowsLit ? "1" : "0.5"}
              />

              {/* Window light rays effect (stronger when lit) */}
              {windowsLit && (
                <rect
                  x={room.winX}
                  y={room.winY}
                  width={room.winW}
                  height={room.winH}
                  fill={`url(#highlight-${uid})`}
                />
              )}

              {/* Window frame cross */}
              <line
                x1={room.winX + room.winW / 2}
                y1={room.winY}
                x2={room.winX + room.winW / 2}
                y2={room.winY + room.winH}
                stroke={isDark ? "#1a0f08" : "#5a2d0f"}
                strokeWidth="3"
              />
              <line
                x1={room.winX}
                y1={room.winY + room.winH / 2}
                x2={room.winX + room.winW}
                y2={room.winY + room.winH / 2}
                stroke={isDark ? "#1a0f08" : "#5a2d0f"}
                strokeWidth="3"
              />

              {/* Silhouette (discrete) */}
              <RoomSilhouette
                type={room.silhouette}
                cx={room.winX + room.winW / 2}
                cy={room.winY + room.winH / 2}
              />

              {/* Window sill */}
              <rect
                x={room.winX - 6}
                y={room.winY + room.winH - 2}
                width={room.winW + 12}
                height="6"
                fill={isDark ? "#1a0f08" : "#5a2d0f"}
                rx="1"
              />

              {/* Hover state: golden glowing frame + tooltip */}
              {isHovered && (
                <>
                  <rect
                    x={room.winX - 6}
                    y={room.winY - 6}
                    width={room.winW + 12}
                    height={room.winH + 12}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    rx="4"
                    filter={`url(#hoverglow-${uid})`}
                  >
                    <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                  {/* Tooltip label above */}
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={room.winX + room.winW / 2 - 55}
                      y={room.winY - 38}
                      width="110"
                      height="26"
                      rx="13"
                      fill="#1c1917"
                      opacity="0.95"
                    />
                    <text
                      x={room.winX + room.winW / 2}
                      y={room.winY - 20}
                      fontSize="13"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                      letterSpacing="-0.01em"
                    >
                      {room.name}
                    </text>
                    {/* Little triangle pointing down */}
                    <polygon
                      points={`${room.winX + room.winW / 2 - 6},${room.winY - 12} ${room.winX + room.winW / 2 + 6},${room.winY - 12} ${room.winX + room.winW / 2},${room.winY - 6}`}
                      fill="#1c1917"
                      opacity="0.95"
                    />
                  </g>
                </>
              )}
            </g>
          );
        })}

        {/* ═══ Lumo outside (small, waving) ═══ */}
        <g transform="translate(300, 500)">
          {/* Shadow */}
          <ellipse cx="0" cy="32" rx="16" ry="3" fill="#000" opacity="0.25" />
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -3; 0 0"
              dur="2.5s"
              repeatCount="indefinite"
            />
            {/* Body */}
            <ellipse cx="0" cy="8" rx="14" ry="12" fill="#8b5cf6" />
            {/* Head */}
            <circle cx="0" cy="-10" r="18" fill="#a78bfa" />
            {/* Ears */}
            <ellipse cx="-14" cy="-20" rx="6" ry="9" fill="#8b5cf6" transform="rotate(-20,-14,-20)" />
            <ellipse cx="14" cy="-20" rx="6" ry="9" fill="#8b5cf6" transform="rotate(20,14,-20)" />
            {/* Eyes */}
            <circle cx="-5" cy="-12" r="2.5" fill="#1c1917" />
            <circle cx="5" cy="-12" r="2.5" fill="#1c1917" />
            <circle cx="-4" cy="-13" r="0.8" fill="white" />
            <circle cx="6" cy="-13" r="0.8" fill="white" />
            {/* Smile */}
            <path d="M -5 -6 Q 0 -2 5 -6" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Waving arm */}
            <ellipse cx="-18" cy="2" rx="4" ry="3" fill="#8b5cf6" transform="rotate(-30,-18,2)">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-30 -18 2; -60 -18 2; -30 -18 2"
                dur="1.6s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse cx="18" cy="2" rx="4" ry="3" fill="#8b5cf6" transform="rotate(15,18,2)" />
            {/* Star on head */}
            <polygon
              points="0,-30 1.5,-26 5,-26 2,-23 3,-19 0,-21 -3,-19 -2,-23 -5,-26 -1.5,-26"
              fill="#fbbf24"
              filter={`url(#glow-${uid})`}
            />
          </g>
        </g>

        {/* Welcome sign (small) */}
        <g transform="translate(340, 490)">
          <rect x="0" y="0" width="140" height="24" rx="12" fill="white" stroke="#e7e5e4" strokeWidth="1.5" opacity="0.95" />
          <text x="70" y="16" fontSize="11" fill="#44403c" textAnchor="middle" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            Bonjour {childName.split(" ")[0].slice(0, 12)} !
          </text>
        </g>
      </svg>

      {/* Time of day badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-neutral-200/60 text-xs font-medium text-neutral-700">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
        {tod === "dawn" && "Matin"}
        {tod === "day" && "Après-midi"}
        {tod === "dusk" && "Soir"}
        {tod === "night" && "Nuit"}
      </div>

      {/* Level badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-md">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
        </svg>
        Niveau {level}
      </div>

      {/* Hovered room label (bottom) */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-neutral-200/60"
          >
            <span className="text-xs font-medium text-neutral-600">
              Clique pour entrer dans <strong className="text-neutral-900">{ROOMS.find((r) => r.id === hovered)?.name}</strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
