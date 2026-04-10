"use client";
import { useEffect, useState } from "react";

export interface LumoStatsData {
  faim: number;      // 0-100 (100 = rassasié)
  joie: number;      // 0-100
  energie: number;   // 0-100
}

interface LumoStatsProps {
  stats: LumoStatsData;
  compact?: boolean;
}

const STAT_CONFIG = [
  { key: "faim" as const, label: "Faim", emoji: "🍎", color: "from-orange-400 to-red-400", bgColor: "bg-orange-100", textColor: "text-orange-700" },
  { key: "joie" as const, label: "Joie", emoji: "😊", color: "from-yellow-400 to-amber-400", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  { key: "energie" as const, label: "Énergie", emoji: "⚡", color: "from-cyan-400 to-blue-500", bgColor: "bg-cyan-100", textColor: "text-cyan-700" },
];

// Compute stats from localStorage / time-based decay
export function computeLumoStats(childId: string): LumoStatsData {
  if (typeof window === "undefined") return { faim: 70, joie: 80, energie: 90 };

  const raw = localStorage.getItem(`lumo_stats_${childId}`);
  const lastVisit = localStorage.getItem(`lumo_last_visit_${childId}`);
  const now = Date.now();

  let stats: LumoStatsData = { faim: 80, joie: 85, energie: 90 };
  if (raw) {
    try { stats = JSON.parse(raw); } catch {}
  }

  // Decay based on time since last visit
  if (lastVisit) {
    const hoursSince = (now - parseInt(lastVisit, 10)) / (1000 * 60 * 60);
    // Hunger decays 5 per hour, joy 3 per hour, energy 2 per hour
    stats.faim = Math.max(0, stats.faim - hoursSince * 5);
    stats.joie = Math.max(0, stats.joie - hoursSince * 3);
    stats.energie = Math.max(0, stats.energie - hoursSince * 2);
  }

  localStorage.setItem(`lumo_last_visit_${childId}`, String(now));
  localStorage.setItem(`lumo_stats_${childId}`, JSON.stringify(stats));

  return stats;
}

// Apply reward to stats after a successful game
export function rewardLumoStats(childId: string, reward: { faim?: number; joie?: number; energie?: number }) {
  if (typeof window === "undefined") return;
  const current = computeLumoStats(childId);
  const updated: LumoStatsData = {
    faim: Math.min(100, current.faim + (reward.faim || 0)),
    joie: Math.min(100, current.joie + (reward.joie || 0)),
    energie: Math.min(100, current.energie + (reward.energie || 0)),
  };
  localStorage.setItem(`lumo_stats_${childId}`, JSON.stringify(updated));
}

export default function LumoStats({ stats, compact = false }: LumoStatsProps) {
  const [animated, setAnimated] = useState<LumoStatsData>({ faim: 0, joie: 0, energie: 0 });

  useEffect(() => {
    // Animate bars filling
    const t = setTimeout(() => setAnimated(stats), 200);
    return () => clearTimeout(t);
  }, [stats]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {STAT_CONFIG.map(({ key, emoji, color }) => (
          <div key={key} className="flex items-center gap-1 px-2 py-1 bg-white/80 rounded-full shadow-sm">
            <span className="text-sm">{emoji}</span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${animated[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-violet-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-slate-700 text-sm">État de Lumo</h4>
        <div className="text-xs text-slate-400 font-semibold">
          {avgStats(stats) > 70 ? "😄 En forme !" : avgStats(stats) > 40 ? "🙂 Ça va" : "😔 Besoin d'amour"}
        </div>
      </div>
      <div className="space-y-2">
        {STAT_CONFIG.map(({ key, label, emoji, color, bgColor, textColor }) => {
          const value = animated[key];
          const pct = Math.round(value);
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center text-base shrink-0`}>
                {emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-xs font-bold ${textColor}`}>{label}</span>
                  <span className="text-xs font-black text-slate-500">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1500 ease-out`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function avgStats(stats: LumoStatsData): number {
  return (stats.faim + stats.joie + stats.energie) / 3;
}
