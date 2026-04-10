"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RoomScene, { ROOM_CONFIGS, type RoomId } from "@/components/RoomScene";
import LumoStats, { computeLumoStats, type LumoStatsData } from "@/components/LumoStats";
import { useRoomMusic, type RoomId as MusicRoomId } from "@/hooks/useRoomMusic";

interface Child {
  id: string; name: string; ageGroup: string; level: number; xp: number; streak: number;
}

const VALID_ROOMS: RoomId[] = ["chambre", "bureau", "atelier", "jardin", "salon", "cour", "grenier", "classe", "labo"];

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const roomId = params.roomId as RoomId;
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LumoStatsData>({ faim: 80, joie: 85, energie: 90 });
  const [musicEnabled, setMusicEnabled] = useState(true);
  const { startMusic, stopMusic, isPlaying } = useRoomMusic(roomId as MusicRoomId, musicEnabled);

  // Validate room
  useEffect(() => {
    if (!VALID_ROOMS.includes(roomId)) {
      router.push(`/child/${childId}`);
      return;
    }
  }, [roomId, childId, router]);

  useEffect(() => {
    fetch(`/api/children/${childId}`)
      .then((r) => {
        if (!r.ok) { router.push("/parent"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) { setLoading(false); return; }
        setChild(data);
        setStats(computeLumoStats(childId));
        setLoading(false);
      })
      .catch(() => router.push("/parent"));
  }, [childId, router]);

  // Auto-start music
  useEffect(() => {
    if (musicEnabled && !isPlaying) {
      // Delay to let the page load
      const t = setTimeout(() => startMusic(), 300);
      return () => clearTimeout(t);
    }
  }, [musicEnabled, isPlaying, startMusic]);

  const handleBack = () => {
    stopMusic();
    router.push(`/child/${childId}`);
  };

  const handlePlay = () => {
    stopMusic();
    const config = ROOM_CONFIGS[roomId];
    router.push(`/child/${childId}/module/${config.module}`);
  };

  const toggleMusic = () => {
    if (musicEnabled) { setMusicEnabled(false); stopMusic(); }
    else { setMusicEnabled(true); startMusic(); }
  };

  if (loading || !child) {
    const config = VALID_ROOMS.includes(roomId) ? ROOM_CONFIGS[roomId] : null;
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: config ? `linear-gradient(135deg, ${config.bgFrom}, ${config.bgTo})` : "linear-gradient(135deg,#dbeafe,#93c5fd)"
      }}>
        <div className="text-center text-slate-700">
          <div className="text-6xl animate-bounce mb-4">{config?.icon || "🏠"}</div>
          <p className="font-bold text-xl">Ouverture de la pièce…</p>
        </div>
      </div>
    );
  }

  const config = ROOM_CONFIGS[roomId];

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: `linear-gradient(180deg, ${config.bgFrom}, ${config.bgTo})`
    }}>
      {/* Music toggle (top right) */}
      <button
        onClick={toggleMusic}
        className="fixed top-3 right-3 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-xl z-50 active:scale-90 transition-transform"
      >
        {isPlaying ? "🔊" : "🔇"}
      </button>

      {/* Main scene */}
      <main className="flex-1 px-3 pt-3 pb-28 max-w-2xl mx-auto w-full flex flex-col gap-3">
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-2 shadow-xl">
          <RoomScene
            roomId={roomId}
            childName={child.name}
            onPlay={handlePlay}
            onBack={handleBack}
          />
        </div>

        {/* Description */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{config.icon}</span>
            <span className="font-black text-slate-800 text-sm">{config.subtitle}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Clique sur les objets pour explorer, puis lance le jeu avec Lumo !
          </p>
        </div>

        {/* Compact stats */}
        <div>
          <LumoStats stats={stats} compact />
        </div>
      </main>
    </div>
  );
}
