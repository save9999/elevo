"use client";
import { useEffect, useState, useId } from "react";

export type TimeOfDay = "morning" | "noon" | "evening" | "night";

interface LumoHouseProps {
  onRoomSelect: (roomId: string) => void;
  childName: string;
  lumoMood?: "idle" | "happy" | "excited" | "sleeping" | "proud";
  level?: number;
}

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "noon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

const SKY_GRADIENTS: Record<TimeOfDay, { from: string; to: string }> = {
  morning: { from: "#fef3c7", to: "#93c5fd" },
  noon: { from: "#7dd3fc", to: "#bfdbfe" },
  evening: { from: "#fb923c", to: "#c084fc" },
  night: { from: "#1e1b4b", to: "#312e81" },
};

// Rooms layout on the house facade
interface RoomPosition {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  windowColor: string;
  floor: "ground" | "first" | "attic" | "garden";
}

const ROOMS: RoomPosition[] = [
  // Ground floor
  { id: "salon", name: "Salon cosy", icon: "💖", x: 90, y: 320, w: 120, h: 100, windowColor: "#fca5a5", floor: "ground" },
  { id: "classe", name: "Classe", icon: "✏️", x: 220, y: 320, w: 110, h: 100, windowColor: "#a78bfa", floor: "ground" },
  { id: "bureau", name: "Bureau", icon: "🧮", x: 340, y: 320, w: 110, h: 100, windowColor: "#86efac", floor: "ground" },
  // First floor
  { id: "chambre", name: "Chambre", icon: "🛏️", x: 90, y: 210, w: 120, h: 100, windowColor: "#93c5fd", floor: "first" },
  { id: "atelier", name: "Atelier", icon: "🎨", x: 220, y: 210, w: 110, h: 100, windowColor: "#fcd34d", floor: "first" },
  { id: "labo", name: "Laboratoire", icon: "🔬", x: 340, y: 210, w: 110, h: 100, windowColor: "#67e8f9", floor: "first" },
  // Attic
  { id: "grenier", name: "Grenier mystère", icon: "🧠", x: 200, y: 110, w: 140, h: 90, windowColor: "#f0abfc", floor: "attic" },
  // Garden
  { id: "jardin", name: "Jardin", icon: "🌱", x: 475, y: 320, w: 110, h: 100, windowColor: "#86efac", floor: "garden" },
  { id: "cour", name: "Cour de récré", icon: "🤝", x: 475, y: 210, w: 110, h: 100, windowColor: "#fda4af", floor: "garden" },
];

export default function LumoHouse({ onRoomSelect, childName, lumoMood = "happy", level = 1 }: LumoHouseProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("noon");
  const [smokeOffset, setSmokeOffset] = useState(0);
  const [birdPos, setBirdPos] = useState(0);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Animate smoke
  useEffect(() => {
    const interval = setInterval(() => setSmokeOffset((s) => (s + 1) % 100), 100);
    return () => clearInterval(interval);
  }, []);

  // Animate bird
  useEffect(() => {
    const interval = setInterval(() => setBirdPos((p) => (p + 0.5) % 120), 50);
    return () => clearInterval(interval);
  }, []);

  const sky = SKY_GRADIENTS[timeOfDay];
  const isNight = timeOfDay === "night";
  const isEvening = timeOfDay === "evening";
  const windowsLit = isNight || isEvening;

  return (
    <div className="relative w-full" style={{ aspectRatio: "700 / 600" }}>
      <svg viewBox="0 0 700 600" className="w-full h-full" style={{ imageRendering: "auto" }}>
        <defs>
          {/* Sky gradient */}
          <linearGradient id={`sky${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sky.from} />
            <stop offset="100%" stopColor={sky.to} />
          </linearGradient>
          {/* Grass */}
          <linearGradient id={`grass${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          {/* House walls */}
          <linearGradient id={`walls${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          {/* Roof */}
          <linearGradient id={`roof${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          {/* Window glow at night */}
          <radialGradient id={`windowGlow${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
          </radialGradient>
          {/* Sun/moon */}
          <radialGradient id={`sun${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isNight ? "#fef3c7" : "#fef3c7"} />
            <stop offset="100%" stopColor={isNight ? "#e5e7eb" : "#fbbf24"} />
          </radialGradient>
          {/* Tree */}
          <radialGradient id={`tree${uid}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#166534" />
          </radialGradient>
          {/* Smoke */}
          <radialGradient id={`smoke${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Glow filter */}
          <filter id={`glow${uid}`}>
            <feGaussianBlur stdDeviation="4" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* === SKY === */}
        <rect x="0" y="0" width="700" height="440" fill={`url(#sky${uid})`} />

        {/* Stars at night */}
        {isNight && Array.from({ length: 35 }).map((_, i) => {
          const x = (i * 73) % 700;
          const y = (i * 37) % 350;
          const size = (i % 3) + 0.8;
          return (
            <circle key={i} cx={x} cy={y} r={size} fill="white" opacity={0.4 + (i % 3) * 0.2}>
              <animate attributeName="opacity" values={`${0.3 + (i % 3) * 0.2};${0.7 + (i % 3) * 0.2};${0.3 + (i % 3) * 0.2}`} dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Sun / Moon */}
        <circle cx={isNight ? 580 : 120} cy={80} r={isNight ? 35 : 40} fill={`url(#sun${uid})`} filter={`url(#glow${uid})`}>
          {!isNight && <animate attributeName="r" values="40;42;40" dur="4s" repeatCount="indefinite" />}
        </circle>
        {isNight && (
          // Moon craters
          <>
            <circle cx="570" cy="75" r="3" fill="#9ca3af" opacity="0.5" />
            <circle cx="590" cy="85" r="4" fill="#9ca3af" opacity="0.5" />
            <circle cx="585" cy="68" r="2" fill="#9ca3af" opacity="0.5" />
          </>
        )}

        {/* Clouds (day only) */}
        {!isNight && (
          <>
            <g opacity={isEvening ? 0.7 : 0.9}>
              <ellipse cx="250" cy="80" rx="40" ry="14" fill="white" />
              <ellipse cx="270" cy="75" rx="28" ry="12" fill="white" />
              <ellipse cx="235" cy="75" rx="22" ry="10" fill="white" />
              <animate attributeName="transform" type="translate" from="0 0" to="20 0" dur="20s" repeatCount="indefinite" />
            </g>
            <g opacity={isEvening ? 0.6 : 0.8}>
              <ellipse cx="450" cy="120" rx="35" ry="12" fill="white" />
              <ellipse cx="470" cy="115" rx="24" ry="10" fill="white" />
              <ellipse cx="435" cy="115" rx="18" ry="8" fill="white" />
            </g>
          </>
        )}

        {/* Bird flying */}
        {!isNight && (
          <g transform={`translate(${100 + birdPos * 5}, ${60 + Math.sin(birdPos * 0.2) * 8})`}>
            <path d="M 0 0 Q -5 -4 -10 0 M 0 0 Q 5 -4 10 0" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* === GRASS / GROUND === */}
        <rect x="0" y="420" width="700" height="180" fill={`url(#grass${uid})`} />
        {/* Grass blades */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i * 23) % 700;
          return <path key={`g${i}`} d={`M ${x} 425 L ${x - 2} 420 L ${x + 2} 420 Z`} fill="#166534" opacity="0.4" />;
        })}
        {/* Flowers scattered */}
        {[[50, 520], [150, 540], [380, 530], [520, 545], [620, 525]].map(([cx, cy], i) => (
          <g key={`f${i}`}>
            <circle cx={cx} cy={cy - 6} r="3" fill="#fde047" />
            <circle cx={cx - 4} cy={cy - 2} r="3" fill="#fca5a5" />
            <circle cx={cx + 4} cy={cy - 2} r="3" fill="#fca5a5" />
            <circle cx={cx - 2} cy={cy + 2} r="3" fill="#fca5a5" />
            <circle cx={cx + 2} cy={cy + 2} r="3" fill="#fca5a5" />
            <circle cx={cx} cy={cy} r="2" fill="#fcd34d" />
          </g>
        ))}

        {/* Path to house */}
        <path d="M 320 600 Q 320 500 310 440 L 390 440 Q 380 500 380 600 Z" fill="#d4a574" opacity="0.8" />
        <path d="M 330 580 L 370 580" stroke="#92400e" strokeWidth="1" opacity="0.4" />
        <path d="M 325 540 L 375 540" stroke="#92400e" strokeWidth="1" opacity="0.4" />
        <path d="M 322 500 L 378 500" stroke="#92400e" strokeWidth="1" opacity="0.4" />
        <path d="M 320 460 L 380 460" stroke="#92400e" strokeWidth="1" opacity="0.4" />

        {/* Trees on sides */}
        <g>
          {/* Left tree */}
          <rect x="30" y="380" width="12" height="50" fill="#78350f" />
          <circle cx="36" cy="370" r="35" fill={`url(#tree${uid})`} />
          <circle cx="20" cy="360" r="25" fill={`url(#tree${uid})`} />
          <circle cx="52" cy="360" r="25" fill={`url(#tree${uid})`} />
          <circle cx="36" cy="345" r="25" fill={`url(#tree${uid})`} />
          {/* Apples */}
          <circle cx="25" cy="360" r="3" fill="#ef4444" />
          <circle cx="45" cy="355" r="3" fill="#ef4444" />
          <circle cx="40" cy="375" r="3" fill="#ef4444" />
        </g>
        <g>
          {/* Right tree */}
          <rect x="655" y="385" width="10" height="45" fill="#78350f" />
          <circle cx="660" cy="375" r="30" fill={`url(#tree${uid})`} />
          <circle cx="645" cy="368" r="22" fill={`url(#tree${uid})`} />
          <circle cx="675" cy="368" r="22" fill={`url(#tree${uid})`} />
          <circle cx="650" cy="365" r="3" fill="#ef4444" />
          <circle cx="670" cy="370" r="3" fill="#ef4444" />
        </g>

        {/* === HOUSE === */}
        <g>
          {/* Main body walls */}
          <rect x="80" y="200" width="380" height="240" fill={`url(#walls${uid})`} stroke="#92400e" strokeWidth="2" />
          {/* Wood planks texture */}
          <line x1="80" y1="260" x2="460" y2="260" stroke="#92400e" strokeWidth="0.5" opacity="0.3" />
          <line x1="80" y1="310" x2="460" y2="310" stroke="#92400e" strokeWidth="0.5" opacity="0.3" />
          <line x1="80" y1="370" x2="460" y2="370" stroke="#92400e" strokeWidth="0.5" opacity="0.3" />

          {/* Garden extension (right side) */}
          <rect x="460" y="200" width="150" height="240" fill="#86efac" stroke="#16a34a" strokeWidth="2" />
          <rect x="460" y="200" width="150" height="240" fill={`url(#grass${uid})`} opacity="0.6" />
          {/* Garden fence */}
          <line x1="465" y1="200" x2="465" y2="440" stroke="#78350f" strokeWidth="3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={`fp${i}`} x={470 + i * 25} y="200" width="3" height="240" fill="#78350f" opacity="0.6" />
          ))}

          {/* Roof - main house */}
          <polygon points="60,200 270,90 475,200" fill={`url(#roof${uid})`} stroke="#7f1d1d" strokeWidth="2" />
          {/* Roof tiles pattern */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`rt${i}`} x1={80 + i * 50} y1={185 - i * 3} x2={100 + i * 50} y2={165 - i * 3} stroke="#7f1d1d" strokeWidth="0.5" opacity="0.4" />
          ))}

          {/* Roof - garden side */}
          <polygon points="460,200 535,150 610,200" fill={`url(#roof${uid})`} stroke="#7f1d1d" strokeWidth="2" />

          {/* Chimney */}
          <rect x="380" y="130" width="25" height="60" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <rect x="375" y="125" width="35" height="10" fill="#78350f" />
          {/* Smoke */}
          {[0, 1, 2].map((i) => {
            const delay = (smokeOffset + i * 30) % 100;
            const opacity = 1 - delay / 100;
            return (
              <circle key={`sm${i}`} cx={393 + (delay % 20) - 10} cy={120 - delay * 0.8} r={5 + delay * 0.15} fill={`url(#smoke${uid})`} opacity={opacity * 0.7} />
            );
          })}

          {/* === FRONT DOOR === */}
          <rect x="260" y="360" width="60" height="80" fill="#78350f" stroke="#451a03" strokeWidth="2" rx="4" />
          <rect x="265" y="368" width="50" height="30" fill="#92400e" stroke="#451a03" strokeWidth="1" rx="2" />
          <rect x="265" y="402" width="50" height="30" fill="#92400e" stroke="#451a03" strokeWidth="1" rx="2" />
          <circle cx="310" cy="400" r="2" fill="#fbbf24" />
          {/* Door sign */}
          <rect x="268" y="355" width="44" height="12" fill="#fef3c7" stroke="#78350f" strokeWidth="1" rx="2" />
          <text x="290" y="364" fontSize="8" fill="#78350f" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">LUMO</text>
        </g>

        {/* === ROOMS (clickable windows) === */}
        {ROOMS.map((room) => {
          const isHovered = hoveredRoom === room.id;
          const lit = windowsLit;
          return (
            <g
              key={room.id}
              style={{ cursor: "pointer" }}
              onClick={() => onRoomSelect(room.id)}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              {/* Window frame */}
              <rect
                x={room.x} y={room.y} width={room.w} height={room.h}
                fill={lit ? `url(#windowGlow${uid})` : room.windowColor}
                stroke="#78350f"
                strokeWidth={isHovered ? "4" : "3"}
                rx="4"
                opacity={isHovered ? 1 : 0.9}
                style={{ transition: "all 0.3s" }}
              />
              {/* Window cross */}
              <line x1={room.x + room.w / 2} y1={room.y} x2={room.x + room.w / 2} y2={room.y + room.h} stroke="#78350f" strokeWidth="2" />
              <line x1={room.x} y1={room.y + room.h / 2} x2={room.x + room.w} y2={room.y + room.h / 2} stroke="#78350f" strokeWidth="2" />
              {/* Hover glow */}
              {isHovered && (
                <rect x={room.x - 4} y={room.y - 4} width={room.w + 8} height={room.h + 8} fill="none" stroke="#fbbf24" strokeWidth="3" rx="6" filter={`url(#glow${uid})`}>
                  <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
                </rect>
              )}
              {/* Room icon */}
              <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 8} fontSize="28" textAnchor="middle" style={{ pointerEvents: "none" }}>
                {room.icon}
              </text>
              {/* Room name tooltip on hover */}
              {isHovered && (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={room.x + room.w / 2 - 55} y={room.y - 28} width="110" height="22" rx="11" fill="#1e1b4b" opacity="0.92" />
                  <text x={room.x + room.w / 2} y={room.y - 13} fontSize="12" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                    {room.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* === LUMO OUTSIDE (on the path, waving) === */}
        <g transform="translate(350, 500)" style={{ cursor: "pointer" }}>
          {/* Lumo shadow */}
          <ellipse cx="0" cy="35" rx="18" ry="4" fill="#1e1b4b" opacity="0.25" />
          {/* Lumo body */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="2s" repeatCount="indefinite" />
            {/* Body */}
            <ellipse cx="0" cy="10" rx="16" ry="14" fill="#c084fc" />
            <ellipse cx="0" cy="10" rx="16" ry="14" fill="white" opacity="0.15" />
            {/* Head */}
            <circle cx="0" cy="-10" r="22" fill="#d8b4fe" />
            <circle cx="0" cy="-10" r="22" fill="white" opacity="0.15" />
            {/* Ears */}
            <ellipse cx="-16" cy="-22" rx="8" ry="11" fill="#c084fc" transform="rotate(-20,-16,-22)" />
            <ellipse cx="16" cy="-22" rx="8" ry="11" fill="#c084fc" transform="rotate(20,16,-22)" />
            {/* Eyes */}
            <ellipse cx="-7" cy="-12" rx="4" ry="5" fill="white" />
            <ellipse cx="7" cy="-12" rx="4" ry="5" fill="white" />
            <circle cx="-7" cy="-11" r="2.5" fill="#4c1d95" />
            <circle cx="7" cy="-11" r="2.5" fill="#4c1d95" />
            <circle cx="-6" cy="-13" r="1" fill="white" />
            <circle cx="8" cy="-13" r="1" fill="white" />
            {/* Smile */}
            <path d="M -6 -3 Q 0 3 6 -3" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="-14" cy="-5" r="3" fill="#fda4af" opacity="0.5" />
            <circle cx="14" cy="-5" r="3" fill="#fda4af" opacity="0.5" />
            {/* Star */}
            <polygon points="0,-30 1.5,-26 5,-26 2,-23 3,-19 0,-21 -3,-19 -2,-23 -5,-26 -1.5,-26" fill="#fbbf24" />
            {/* Waving arm */}
            <ellipse cx="-20" cy="5" rx="5" ry="3" fill="#c084fc" transform="rotate(-30,-20,5)">
              <animateTransform attributeName="transform" type="rotate" values="-30 -20 5; -50 -20 5; -30 -20 5" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="20" cy="5" rx="5" ry="3" fill="#c084fc" transform="rotate(15,20,5)" />
            {/* Feet */}
            <ellipse cx="-7" cy="28" rx="7" ry="4" fill="#9333ea" />
            <ellipse cx="7" cy="28" rx="7" ry="4" fill="#9333ea" />
          </g>
          {/* Speech bubble */}
          <g transform="translate(30, -25)">
            <rect x="0" y="0" width="120" height="28" rx="14" fill="white" stroke="#c084fc" strokeWidth="2" />
            <path d="M 10 28 L 5 38 L 20 28 Z" fill="white" stroke="#c084fc" strokeWidth="2" />
            <text x="60" y="18" fontSize="11" fill="#4c1d95" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
              Salut {childName.split(" ")[0].slice(0, 8)} !
            </text>
          </g>
        </g>

        {/* Level badge (top right) */}
        <g transform="translate(620, 30)">
          <circle cx="0" cy="0" r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
          <text x="0" y="-3" fontSize="8" fill="#78350f" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">NIV.</text>
          <text x="0" y="10" fontSize="14" fill="#78350f" textAnchor="middle" fontWeight="900" fontFamily="sans-serif">{level}</text>
        </g>
      </svg>

      {/* Time of day indicator */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
        {timeOfDay === "morning" && "🌅 Matin"}
        {timeOfDay === "noon" && "☀️ Après-midi"}
        {timeOfDay === "evening" && "🌆 Soir"}
        {timeOfDay === "night" && "🌙 Nuit"}
      </div>
    </div>
  );
}
