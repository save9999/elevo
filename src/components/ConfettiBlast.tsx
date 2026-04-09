"use client";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  shape: "circle" | "star" | "rect" | "ring";
  delay: number;
  duration: number;
}

const COLORS = [
  "#8B5CF6", "#7C3AED", "#6366F1", "#3B82F6", "#60A5FA",
  "#F59E0B", "#FBBF24", "#FDE68A",
  "#10B981", "#34D399",
  "#EC4899", "#F472B6",
  "#EF4444",
];

function randomBetween(a: number, b: number) { return a + Math.random() * (b - a); }

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(5, 95),
    y: randomBetween(-10, 30),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 14),
    rotation: randomBetween(0, 360),
    vx: randomBetween(-3, 3),
    vy: randomBetween(2, 6),
    shape: (["circle", "star", "rect", "ring"] as const)[Math.floor(Math.random() * 4)],
    delay: randomBetween(0, 0.6),
    duration: randomBetween(1.5, 3),
  }));
}

function ParticleEl({ p }: { p: Particle }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${p.x}%`,
    top: `${p.y}%`,
    width: p.size,
    height: p.shape === "rect" ? p.size * 0.5 : p.size,
    opacity: 0,
    animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
    transform: `rotate(${p.rotation}deg)`,
    ["--vx" as string]: `${p.vx * 30}px`,
    ["--vy" as string]: `${p.vy * 80}px`,
    ["--rot" as string]: `${p.rotation + randomBetween(180, 720)}deg`,
  };

  if (p.shape === "circle") {
    return <div style={{ ...style, borderRadius: "50%", backgroundColor: p.color }} />;
  }
  if (p.shape === "ring") {
    return <div style={{ ...style, borderRadius: "50%", border: `2px solid ${p.color}`, backgroundColor: "transparent" }} />;
  }
  if (p.shape === "rect") {
    return <div style={{ ...style, borderRadius: 2, backgroundColor: p.color }} />;
  }
  // star
  return (
    <svg style={style} viewBox="0 0 20 20" fill={p.color}>
      <polygon points="10,1 12.5,7.5 19,7.5 13.5,12 15.5,19 10,14.5 4.5,19 6.5,12 1,7.5 7.5,7.5" />
    </svg>
  );
}

export default function ConfettiBlast({ active, count = 50 }: { active: boolean; count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(generateParticles(count));
      const timer = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(timer);
    }
    setParticles([]);
  }, [active, count]);

  if (!particles.length) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translate(0, 0) rotate(var(--rot, 0deg)) scale(0.5); }
          20% { opacity: 1; transform: translate(var(--vx), calc(var(--vy) * 0.3)) rotate(calc(var(--rot) * 0.4)) scale(1.1); }
          100% { opacity: 0; transform: translate(calc(var(--vx) * 1.5), calc(var(--vy) + 200px)) rotate(var(--rot)) scale(0.3); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
        {particles.map((p) => <ParticleEl key={p.id} p={p} />)}
      </div>
    </>
  );
}
