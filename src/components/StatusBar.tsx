"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getStreakTier } from "@/lib/gamification";

interface StatusBarProps {
  childId: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  ageGroup: string;
}

export default function StatusBar({ childId, name, avatar, level, xp, streak, ageGroup }: StatusBarProps) {
  const [currency, setCurrency] = useState({ stars: 0, crystals: 0 });
  const [questCount, setQuestCount] = useState(0);
  const xpInLevel = xp % 500;
  const streakTier = getStreakTier(streak);

  useEffect(() => {
    fetch(`/api/progress?childId=${childId}`).then((r) => r.json()).then((d) => {
      if (d.currency) setCurrency(d.currency);
    });
    fetch(`/api/quests?childId=${childId}`).then((r) => r.json()).then((d) => {
      if (d.quests) setQuestCount(d.quests.filter((q: { completed: boolean }) => !q.completed).length);
    });
  }, [childId]);

  const gradients: Record<string, string> = {
    maternelle: "from-amber-500 to-orange-500",
    primaire: "from-emerald-500 to-teal-500",
    "college-lycee": "from-violet-500 to-purple-600",
  };

  return (
    <div className={`sticky top-0 z-50 bg-gradient-to-r ${gradients[ageGroup] || gradients.primaire} text-white px-4 py-2 shadow-lg`}>
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Link href={`/child/${childId}/profile`} className="flex items-center gap-2">
          <span className="text-2xl">{avatar}</span>
          <div>
            <div className="text-xs font-bold">Niv. {level}</div>
            <div className="w-16 h-1.5 bg-white/30 rounded-full">
              <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 text-sm font-bold" style={streakTier ? { color: streakTier.color === "rainbow" ? "#FFD700" : streakTier.color } : undefined}>
          <span>{streakTier?.emoji || "🔥"}</span>
          <span>{streak}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span>⭐ {currency.stars}</span>
          <span>💎 {currency.crystals}</span>
        </div>
        <Link href={`/child/${childId}/quests`} className="relative">
          <span className="text-xl">🔔</span>
          {questCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {questCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
