"use client";
import { useState, useId, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export type RoomId = "chambre" | "bureau" | "atelier" | "jardin" | "salon" | "cour" | "grenier" | "classe" | "labo";

interface RoomConfig {
  id: RoomId;
  name: string;
  icon: string;
  subtitle: string;
  bgFrom: string;
  bgTo: string;
  floor: string;
  accent: string;
  module: string;  // module id to launch
}

export const ROOM_CONFIGS: Record<RoomId, RoomConfig> = {
  chambre: {
    id: "chambre", name: "La Chambre de Lumo", icon: "🛏️", subtitle: "Lis et écoute des histoires",
    bgFrom: "#dbeafe", bgTo: "#93c5fd", floor: "#a78bfa", accent: "blue", module: "reading",
  },
  bureau: {
    id: "bureau", name: "Le Bureau d'étude", icon: "🧮", subtitle: "Résous des énigmes et calcule",
    bgFrom: "#dcfce7", bgTo: "#86efac", floor: "#92400e", accent: "green", module: "math",
  },
  atelier: {
    id: "atelier", name: "L'Atelier d'art", icon: "🎨", subtitle: "Exprime ta créativité",
    bgFrom: "#fef3c7", bgTo: "#fcd34d", floor: "#b45309", accent: "amber", module: "creativity",
  },
  jardin: {
    id: "jardin", name: "Le Jardin de Lumo", icon: "🌱", subtitle: "Apprends la nature et la santé",
    bgFrom: "#d1fae5", bgTo: "#6ee7b7", floor: "#14532d", accent: "emerald", module: "physical",
  },
  salon: {
    id: "salon", name: "Le Salon cosy", icon: "💖", subtitle: "Comprends tes émotions",
    bgFrom: "#fce7f3", bgTo: "#f9a8d4", floor: "#881337", accent: "pink", module: "emotional",
  },
  cour: {
    id: "cour", name: "La Cour de récré", icon: "🤝", subtitle: "Amis et relations",
    bgFrom: "#fed7aa", bgTo: "#fb923c", floor: "#78350f", accent: "orange", module: "social",
  },
  grenier: {
    id: "grenier", name: "Le Grenier mystère", icon: "🧠", subtitle: "Entraîne ta mémoire",
    bgFrom: "#e9d5ff", bgTo: "#c084fc", floor: "#4c1d95", accent: "violet", module: "memory",
  },
  classe: {
    id: "classe", name: "La Salle de classe", icon: "✏️", subtitle: "Écriture et expression",
    bgFrom: "#ede9fe", bgTo: "#a78bfa", floor: "#312e81", accent: "indigo", module: "writing",
  },
  labo: {
    id: "labo", name: "Le Laboratoire", icon: "🔬", subtitle: "Bilan et super-pouvoirs",
    bgFrom: "#cffafe", bgTo: "#67e8f9", floor: "#155e75", accent: "cyan", module: "assessment",
  },
};

interface RoomSceneProps {
  roomId: RoomId;
  childName: string;
  onPlay: () => void;
  onBack: () => void;
}

// Objects that Lumo can interact with in each room
interface InteractiveObject {
  x: number;
  y: number;
  emoji: string;
  size: number;
  sound: "pop" | "click" | "pop" | "woosh" | "star";
  reaction?: string;
}

const ROOM_OBJECTS: Record<RoomId, InteractiveObject[]> = {
  chambre: [
    { x: 60, y: 250, emoji: "📚", size: 40, sound: "pop", reaction: "Un nouveau livre ! 📖" },
    { x: 120, y: 270, emoji: "🧸", size: 45, sound: "pop", reaction: "Mon doudou !" },
    { x: 350, y: 120, emoji: "🌙", size: 30, sound: "star", reaction: "Bonne nuit..." },
    { x: 280, y: 240, emoji: "🛏️", size: 60, sound: "pop", reaction: "Mon lit douillet !" },
    { x: 40, y: 80, emoji: "⭐", size: 20, sound: "star" },
    { x: 380, y: 60, emoji: "✨", size: 18, sound: "star" },
  ],
  bureau: [
    { x: 60, y: 240, emoji: "📐", size: 35, sound: "click", reaction: "Pour mesurer !" },
    { x: 120, y: 260, emoji: "✏️", size: 30, sound: "click", reaction: "Un crayon tout neuf !" },
    { x: 280, y: 150, emoji: "🔢", size: 50, sound: "pop", reaction: "Les chiffres !" },
    { x: 350, y: 250, emoji: "🖥️", size: 50, sound: "click" },
    { x: 60, y: 150, emoji: "📊", size: 40, sound: "click" },
  ],
  atelier: [
    { x: 60, y: 150, emoji: "🎨", size: 50, sound: "pop", reaction: "Mes couleurs préférées !" },
    { x: 130, y: 250, emoji: "🖌️", size: 35, sound: "click" },
    { x: 280, y: 130, emoji: "🖼️", size: 55, sound: "pop", reaction: "Regarde mon tableau !" },
    { x: 360, y: 240, emoji: "✂️", size: 30, sound: "click" },
    { x: 180, y: 100, emoji: "🌈", size: 40, sound: "star" },
  ],
  jardin: [
    { x: 80, y: 240, emoji: "🌻", size: 45, sound: "pop", reaction: "Elle est si belle !" },
    { x: 150, y: 260, emoji: "🌷", size: 38, sound: "pop" },
    { x: 50, y: 180, emoji: "🐝", size: 25, sound: "woosh", reaction: "Attention au bzzz !" },
    { x: 300, y: 140, emoji: "🌳", size: 60, sound: "woosh" },
    { x: 380, y: 250, emoji: "🥕", size: 35, sound: "pop" },
    { x: 220, y: 200, emoji: "🦋", size: 28, sound: "woosh" },
  ],
  salon: [
    { x: 70, y: 250, emoji: "🛋️", size: 70, sound: "pop", reaction: "Si confortable..." },
    { x: 160, y: 200, emoji: "☕", size: 30, sound: "click", reaction: "Un chocolat chaud ?" },
    { x: 350, y: 240, emoji: "🕯️", size: 30, sound: "pop" },
    { x: 300, y: 120, emoji: "🖼️", size: 40, sound: "click" },
    { x: 60, y: 140, emoji: "🧸", size: 40, sound: "pop" },
  ],
  cour: [
    { x: 60, y: 250, emoji: "⚽", size: 40, sound: "pop", reaction: "On joue au ballon ?" },
    { x: 140, y: 270, emoji: "🏀", size: 38, sound: "pop" },
    { x: 300, y: 180, emoji: "🪁", size: 45, sound: "woosh", reaction: "Wouhou dans le vent !" },
    { x: 380, y: 260, emoji: "🛹", size: 40, sound: "woosh" },
    { x: 220, y: 150, emoji: "🎈", size: 30, sound: "pop" },
  ],
  grenier: [
    { x: 70, y: 240, emoji: "📦", size: 50, sound: "click", reaction: "Qu'y a-t-il dedans ?" },
    { x: 140, y: 260, emoji: "🗝️", size: 25, sound: "click", reaction: "Une clé mystérieuse !" },
    { x: 300, y: 150, emoji: "🕰️", size: 45, sound: "click" },
    { x: 380, y: 240, emoji: "📜", size: 35, sound: "pop" },
    { x: 220, y: 100, emoji: "🔮", size: 35, sound: "star", reaction: "Je vois... l'avenir !" },
    { x: 60, y: 120, emoji: "🦇", size: 25, sound: "woosh" },
  ],
  classe: [
    { x: 60, y: 230, emoji: "📖", size: 40, sound: "pop", reaction: "Ma leçon préférée !" },
    { x: 140, y: 250, emoji: "📝", size: 35, sound: "click" },
    { x: 300, y: 140, emoji: "🗺️", size: 55, sound: "pop" },
    { x: 380, y: 240, emoji: "🎒", size: 45, sound: "click" },
    { x: 220, y: 130, emoji: "🔔", size: 30, sound: "star", reaction: "Dring dring !" },
  ],
  labo: [
    { x: 70, y: 240, emoji: "🧪", size: 40, sound: "pop", reaction: "Ça bouillonne !" },
    { x: 140, y: 260, emoji: "🧫", size: 35, sound: "click" },
    { x: 290, y: 140, emoji: "🔬", size: 55, sound: "click", reaction: "Regarde de plus près !" },
    { x: 370, y: 240, emoji: "⚗️", size: 40, sound: "pop" },
    { x: 220, y: 100, emoji: "💡", size: 30, sound: "star", reaction: "Eurêka !" },
  ],
};

export default function RoomScene({ roomId, childName, onPlay, onBack }: RoomSceneProps) {
  const config = ROOM_CONFIGS[roomId];
  const objects = ROOM_OBJECTS[roomId] || [];
  const { play } = useSoundEffects();
  const uid = useId().replace(/:/g, "");
  const [reaction, setReaction] = useState<string | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [lumoMsg, setLumoMsg] = useState<string>(`Bienvenue dans ${config.name.toLowerCase()} !`);

  useEffect(() => {
    const t = setTimeout(() => {
      setLumoMsg(`Viens jouer avec moi ${childName.split(" ")[0]} ! 🎮`);
    }, 3000);
    return () => clearTimeout(t);
  }, [childName]);

  const handleObjectClick = (idx: number, obj: InteractiveObject) => {
    play(obj.sound);
    setClicked(idx);
    if (obj.reaction) {
      setReaction(obj.reaction);
      setLumoMsg(obj.reaction);
    }
    setTimeout(() => setClicked(null), 400);
    setTimeout(() => setReaction(null), 2500);
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: "450 / 400" }}>
      <svg viewBox="0 0 450 400" className="w-full h-full" style={{ imageRendering: "auto" }}>
        <defs>
          <linearGradient id={`bg${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.bgFrom} />
            <stop offset="100%" stopColor={config.bgTo} />
          </linearGradient>
          <linearGradient id={`floor${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.floor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={config.floor} stopOpacity="0.9" />
          </linearGradient>
          <filter id={`glow${uid}`}>
            <feGaussianBlur stdDeviation="3" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Room background */}
        <rect x="0" y="0" width="450" height="400" fill={`url(#bg${uid})`} />

        {/* Walls decoration - polka dots */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = (i * 73 + 20) % 450;
          const y = (i * 47 + 15) % 280;
          return <circle key={`d${i}`} cx={x} cy={y} r="2" fill="white" opacity="0.25" />;
        })}

        {/* Floor */}
        <rect x="0" y="300" width="450" height="100" fill={`url(#floor${uid})`} />
        <line x1="0" y1="300" x2="450" y2="300" stroke="#1f2937" strokeWidth="2" opacity="0.3" />
        {/* Floor planks */}
        {[100, 200, 300].map((x) => (
          <line key={`pl${x}`} x1={x} y1="300" x2={x - 30} y2="400" stroke="#1f2937" strokeWidth="0.8" opacity="0.2" />
        ))}

        {/* Interactive objects */}
        {objects.map((obj, i) => (
          <g
            key={i}
            style={{ cursor: "pointer", transformOrigin: `${obj.x + obj.size / 2}px ${obj.y + obj.size / 2}px` }}
            onClick={() => handleObjectClick(i, obj)}
          >
            <text
              x={obj.x}
              y={obj.y + obj.size * 0.7}
              fontSize={obj.size}
              style={{
                userSelect: "none",
                transform: clicked === i ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transformOrigin: `${obj.x + obj.size / 2}px ${obj.y + obj.size / 2}px`,
                transformBox: "fill-box",
              }}
            >
              {obj.emoji}
            </text>
          </g>
        ))}

        {/* LUMO in the center of the room */}
        <g transform="translate(225, 280)">
          {/* Shadow */}
          <ellipse cx="0" cy="38" rx="22" ry="5" fill="#000" opacity="0.2" />
          {/* Body bouncing */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="2s" repeatCount="indefinite" />
            {/* Body */}
            <ellipse cx="0" cy="15" rx="22" ry="18" fill="#c084fc" />
            <ellipse cx="0" cy="18" rx="14" ry="11" fill="#faf5ff" opacity="0.3" />
            {/* Arms */}
            <ellipse cx="-24" cy="10" rx="7" ry="4" fill="#a855f7" transform="rotate(-20,-24,10)" />
            <ellipse cx="24" cy="10" rx="7" ry="4" fill="#a855f7" transform="rotate(20,24,10)" />
            {/* Feet */}
            <ellipse cx="-9" cy="32" rx="8" ry="5" fill="#7c3aed" />
            <ellipse cx="9" cy="32" rx="8" ry="5" fill="#7c3aed" />
            {/* Head */}
            <circle cx="0" cy="-12" r="28" fill="#d8b4fe" />
            <circle cx="0" cy="-12" r="28" fill="white" opacity="0.2" />
            {/* Ears */}
            <ellipse cx="-22" cy="-28" rx="10" ry="14" fill="#c084fc" transform="rotate(-20,-22,-28)" />
            <ellipse cx="-22" cy="-28" rx="6" ry="10" fill="#e9d5ff" transform="rotate(-20,-22,-28)" />
            <ellipse cx="22" cy="-28" rx="10" ry="14" fill="#c084fc" transform="rotate(20,22,-28)" />
            <ellipse cx="22" cy="-28" rx="6" ry="10" fill="#e9d5ff" transform="rotate(20,22,-28)" />
            {/* Eyes */}
            <ellipse cx="-9" cy="-15" rx="6" ry="7" fill="white" />
            <ellipse cx="9" cy="-15" rx="6" ry="7" fill="white" />
            <circle cx="-9" cy="-14" r="4" fill="#4c1d95" />
            <circle cx="9" cy="-14" r="4" fill="#4c1d95" />
            <circle cx="-9" cy="-15" r="2" fill="#0f0a2e" />
            <circle cx="9" cy="-15" r="2" fill="#0f0a2e" />
            <circle cx="-7" cy="-17" r="1.5" fill="white" />
            <circle cx="11" cy="-17" r="1.5" fill="white" />
            {/* Nose */}
            <ellipse cx="0" cy="-6" rx="2" ry="1.5" fill="#9333ea" opacity="0.6" />
            {/* Smile */}
            <path d="M -8 -1 Q 0 6 8 -1" stroke="#4c1d95" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="-17" cy="-7" r="4" fill="#fda4af" opacity="0.5" />
            <circle cx="17" cy="-7" r="4" fill="#fda4af" opacity="0.5" />
            {/* Star */}
            <polygon points="0,-38 2,-32 8,-32 3,-28 5,-22 0,-26 -5,-22 -3,-28 -8,-32 -2,-32" fill="#fbbf24" filter={`url(#glow${uid})`} />
          </g>

          {/* Speech bubble */}
          {lumoMsg && (
            <g transform="translate(-40, -75)">
              <rect x="0" y="0" width="160" height="30" rx="15" fill="white" stroke="#c084fc" strokeWidth="2.5" />
              <path d="M 70 30 L 65 40 L 85 30 Z" fill="white" stroke="#c084fc" strokeWidth="2.5" />
              <text x="80" y="20" fontSize="11" fill="#4c1d95" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                {lumoMsg.slice(0, 28)}{lumoMsg.length > 28 ? "..." : ""}
              </text>
            </g>
          )}
        </g>

        {/* Reaction popup */}
        {reaction && (
          <g transform="translate(225, 180)">
            <rect x="-80" y="-20" width="160" height="30" rx="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
              <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" repeatCount="1" />
            </rect>
            <text x="0" y="0" fontSize="12" fill="#78350f" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
              <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" repeatCount="1" />
              ✨ {reaction}
            </text>
          </g>
        )}

        {/* Room name banner */}
        <g transform="translate(225, 30)">
          <rect x="-130" y="-18" width="260" height="36" rx="18" fill="white" stroke={config.floor} strokeWidth="3" opacity="0.95" />
          <text x="0" y="5" fontSize="15" fill="#1e1b4b" textAnchor="middle" fontWeight="900" fontFamily="sans-serif">
            {config.icon} {config.name}
          </text>
        </g>
      </svg>

      {/* Overlay UI buttons */}
      <button
        onClick={() => { play("click"); onBack(); }}
        className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl font-bold text-slate-700 active:scale-90 transition-transform hover:bg-white"
        aria-label="Retour"
      >
        ←
      </button>

      <button
        onClick={() => { play("woosh"); onPlay(); }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-base shadow-2xl active:scale-95 transition-transform hover:scale-105 flex items-center gap-2"
      >
        Jouer avec Lumo 🎮
      </button>
    </div>
  );
}
