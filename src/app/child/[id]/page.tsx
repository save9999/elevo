"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LumoHouse from "@/components/LumoHouse";
import LumoStats, { computeLumoStats, type LumoStatsData } from "@/components/LumoStats";
import { getLumoMood } from "@/components/LumoCompanion";
import { useRoomMusic } from "@/hooks/useRoomMusic";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface Child {
  id: string; name: string; avatar: string; avatarConfig: string; ageGroup: string;
  level: number; xp: number; streak: number; lastActivity: string | null;
  profile: {
    scoreReading: number; scoreWriting: number; scoreMath: number;
    scoreMemory: number; scoreAttention: number; personalPlan: string;
    troubles: string;
  } | null;
  achievements: { id: string; title: string; emoji: string }[];
  sessions?: { module: string; createdAt: string }[];
}

export default function ChildHomePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [currency, setCurrency] = useState({ stars: 0, crystals: 0 });
  const [stats, setStats] = useState<LumoStatsData>({ faim: 80, joie: 85, energie: 90 });
  const [musicEnabled, setMusicEnabled] = useState(false);
  const { startMusic, stopMusic, isPlaying } = useRoomMusic("maison", musicEnabled);
  const { play } = useSoundEffects();

  useEffect(() => {
    const timer = setTimeout(() => setLoadTimeout(true), 8000);
    fetch(`/api/children/${id}`)
      .then((r) => {
        if (!r.ok) { clearTimeout(timer); router.push("/parent"); return null; }
        return r.json();
      })
      .then((data) => {
        clearTimeout(timer);
        if (!data) { setLoading(false); return; }
        setChild(data);
        setLoading(false);
        // Compute Lumo stats from localStorage
        setStats(computeLumoStats(id));
      })
      .catch(() => { clearTimeout(timer); router.push("/parent"); });
    return () => clearTimeout(timer);
  }, [id, router]);

  useEffect(() => {
    if (child) {
      fetch(`/api/progress?childId=${child.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.currency) setCurrency(d.currency);
        })
        .catch(() => {});
    }
  }, [child]);

  const handleRoomSelect = (roomId: string) => {
    play("woosh");
    router.push(`/child/${id}/room/${roomId}`);
  };

  const toggleMusic = () => {
    if (musicEnabled) {
      setMusicEnabled(false);
      stopMusic();
    } else {
      setMusicEnabled(true);
      startMusic();
    }
  };

  if (loading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-500">
        <div className="text-center text-white">
          <div className="text-6xl animate-bounce mb-4">🏠</div>
          <p className="font-bold text-xl">La maison de Lumo se prépare…</p>
          {loadTimeout && (
            <div className="mt-6">
              <button onClick={() => router.push("/parent")} className="bg-white text-purple-700 font-black px-6 py-3 rounded-2xl">
                ← Retour
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const xpInLevel = child.xp % 500;
  const lumoMood = getLumoMood(child);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 pb-20">
      {/* Top bar — ultra compact */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/parent" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-600 font-bold active:scale-90 transition-transform">
          ←
        </Link>
        <div className="flex items-center gap-2">
          {/* Currency */}
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-black text-slate-700">{currency.stars}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-sm">💎</span>
            <span className="text-xs font-black text-slate-700">{currency.crystals}</span>
          </div>
          {child.streak > 0 && (
            <div className="bg-orange-400/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-black text-white">{child.streak}</span>
            </div>
          )}
          {/* Music toggle */}
          <button
            onClick={toggleMusic}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-lg active:scale-90 transition-transform"
            aria-label={isPlaying ? "Couper la musique" : "Activer la musique"}
          >
            {isPlaying ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Main LumoHouse */}
      <main className="px-3 max-w-2xl mx-auto">
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-2 shadow-xl">
          <LumoHouse
            onRoomSelect={handleRoomSelect}
            childName={child.name}
            level={child.level}
          />
        </div>

        {/* Welcome message */}
        <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-2 border-violet-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👋</span>
            <span className="font-black text-slate-800 text-sm">
              Bienvenue {child.name.split(" ")[0]} !
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Clique sur une pièce de la maison pour jouer avec moi !
          </p>
        </div>

        {/* XP bar */}
        <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-slate-700">Niveau {child.level}</span>
            <span className="text-xs font-bold text-slate-500">{xpInLevel}/500 XP</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
              style={{ width: `${(xpInLevel / 500) * 100}%` }}
            />
          </div>
        </div>

        {/* Lumo stats */}
        <div className="mt-3">
          <LumoStats stats={stats} />
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-2 z-50 shadow-[0_-2px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around max-w-md mx-auto">
          <Link href={`/child/${child.id}`} className="flex flex-col items-center gap-0.5 text-violet-600">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold">Maison</span>
          </Link>
          <Link href={`/child/${child.id}/quests`} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xl">⚔️</span>
            <span className="text-[10px] font-bold">Quêtes</span>
          </Link>
          <Link href={`/child/${child.id}/shop`} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xl">🛍️</span>
            <span className="text-[10px] font-bold">Boutique</span>
          </Link>
          <Link href={`/child/${child.id}/inventory`} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xl">🎒</span>
            <span className="text-[10px] font-bold">Sac</span>
          </Link>
          <Link href={`/child/${child.id}/lumo`} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xl">💬</span>
            <span className="text-[10px] font-bold">Lumo</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
