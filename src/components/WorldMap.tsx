"use client";
import { useRouter } from "next/navigation";

interface Chapter {
  id: string;
  title: string;
  description: string;
  theme: string;
  order: number;
  mapPosition: { x: number; y: number };
  mapRegion: string;
  status: "locked" | "available" | "completed";
  steps: { id: string; status: string }[];
}

interface WorldMapProps {
  childId: string;
  chapters: Chapter[];
  ageGroup: string;
}

const REGION_COLORS: Record<string, { bg: string; icon: string }> = {
  forest: { bg: "from-green-400 to-emerald-600", icon: "🌲" },
  garden: { bg: "from-pink-400 to-rose-500", icon: "🌸" },
  village: { bg: "from-amber-400 to-orange-500", icon: "🏘️" },
  mountains: { bg: "from-gray-400 to-slate-600", icon: "⛰️" },
  castle: { bg: "from-purple-400 to-indigo-600", icon: "🏰" },
  ruins: { bg: "from-stone-400 to-stone-600", icon: "🏛️" },
  tower: { bg: "from-indigo-400 to-blue-600", icon: "🗼" },
  city: { bg: "from-slate-400 to-gray-600", icon: "🌆" },
};

const STATUS_STYLES = {
  locked: "opacity-40 grayscale cursor-not-allowed",
  available: "opacity-100 animate-pulse-glow cursor-pointer ring-2 ring-yellow-400",
  completed: "opacity-100 cursor-pointer ring-2 ring-green-400",
};

export default function WorldMap({ childId, chapters, ageGroup }: WorldMapProps) {
  const router = useRouter();

  const mapBg: Record<string, string> = {
    maternelle: "bg-gradient-to-b from-sky-200 via-green-100 to-amber-100",
    primaire: "bg-gradient-to-b from-indigo-200 via-emerald-100 to-amber-100",
    "college-lycee": "bg-gradient-to-b from-slate-800 via-indigo-900 to-purple-900",
  };

  return (
    <div className={`relative w-full min-h-[70vh] rounded-3xl overflow-hidden ${mapBg[ageGroup] || mapBg.primaire}`}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h2 className={`text-xl font-black ${ageGroup === "college-lycee" ? "text-white" : "text-gray-800"}`}>
          🗺️ Monde d&apos;Elevo
        </h2>
      </div>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {chapters.slice(0, -1).map((ch, i) => {
          const next = chapters[i + 1];
          return (
            <line
              key={ch.id}
              x1={`${ch.mapPosition.x}`}
              y1={`${ch.mapPosition.y}`}
              x2={`${next.mapPosition.x}`}
              y2={`${next.mapPosition.y}`}
              stroke={ch.status === "completed" ? "#10B981" : "#9CA3AF"}
              strokeWidth="0.5"
              strokeDasharray={ch.status === "completed" ? "0" : "2,2"}
              opacity={ch.status === "locked" ? 0.3 : 0.6}
            />
          );
        })}
      </svg>
      {chapters.map((chapter) => {
        const region = REGION_COLORS[chapter.mapRegion] || REGION_COLORS.forest;
        const completedSteps = chapter.steps.filter((s) => s.status === "completed").length;
        const totalSteps = chapter.steps.length;
        return (
          <button
            key={chapter.id}
            onClick={() => chapter.status !== "locked" && router.push(`/child/${childId}/chapter/${chapter.id}`)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${STATUS_STYLES[chapter.status]}`}
            style={{ left: `${chapter.mapPosition.x}%`, top: `${chapter.mapPosition.y}%` }}
            disabled={chapter.status === "locked"}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${region.bg} flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-2xl">{region.icon}</span>
              {chapter.status === "completed" && <span className="text-xs">✅</span>}
              {chapter.status === "available" && <span className="text-xs">⚔️</span>}
              {chapter.status === "locked" && <span className="text-xs">🔒</span>}
            </div>
            <div className={`text-center mt-1 max-w-[100px] ${ageGroup === "college-lycee" ? "text-white" : "text-gray-800"}`}>
              <p className="text-xs font-bold leading-tight truncate">{chapter.title}</p>
              {chapter.status !== "locked" && (
                <p className="text-[10px] opacity-70">{completedSteps}/{totalSteps}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
