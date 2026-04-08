"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LumoCharacter from "@/components/LumoCharacter";
import StarRating from "@/components/StarRating";

interface Chapter {
  id: string;
  title: string;
  description: string;
  theme: string;
  bossData: { name: string; description: string } | null;
  steps: {
    id: string;
    order: number;
    title: string;
    narrativeContext: string;
    exerciseType: string;
    status: string;
    starsEarned?: number;
  }[];
  status: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  ageGroup: string;
  level: number;
}

const TYPE_EMOJIS: Record<string, string> = {
  reading: "📖", math: "🔢", emotional: "💜", memory: "🧠",
  social: "🤝", creativity: "🎨", physical: "🏃",
};

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/progress?childId=${childId}`).then((r) => r.json()),
      fetch(`/api/children/${childId}`).then((r) => r.json()),
    ]).then(([progressData, childData]) => {
      const ch = progressData.chapters?.find((c: Chapter) => c.id === chapterId);
      if (ch) setChapter(ch);
      if (childData) setChild(childData);
      setLoading(false);
    });
  }, [childId, chapterId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-bounce text-4xl">⚔️</div>
    </div>
  );

  if (!chapter || !child) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Chapitre introuvable</p>
      <Link href={`/child/${childId}`} className="text-elevo-purple font-bold">← Retour à la carte</Link>
    </div>
  );

  const completedSteps = chapter.steps.filter((s) => s.status === "completed").length;
  const allStepsCompleted = completedSteps === chapter.steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <div className="bg-gradient-to-r from-elevo-purple to-elevo-violet text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">{chapter.title}</h1>
        <p className="text-white/80 text-sm mt-1">{chapter.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 bg-white/20 rounded-full">
            <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${(completedSteps / chapter.steps.length) * 100}%` }} />
          </div>
          <span className="text-sm font-bold">{completedSteps}/{chapter.steps.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 mt-4">
        <div className="w-12 h-12">
          <LumoCharacter ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"} mood="happy" size={48} />
        </div>
        <div className="bg-white rounded-2xl rounded-bl-none p-3 shadow-sm flex-1">
          <p className="text-sm text-gray-700">
            {completedSteps === 0
              ? `Bienvenue dans ${chapter.title}, ${child.name} ! L'aventure commence ici.`
              : allStepsCompleted
                ? `Incroyable ${child.name} ! Tu as terminé toutes les étapes. Prêt pour le boss ? 💪`
                : `Continue ton aventure, ${child.name} ! Plus que ${chapter.steps.length - completedSteps} étape(s).`}
          </p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-3">
        {chapter.steps.map((step, idx) => {
          const isAvailable = step.status === "completed" || idx === 0 || chapter.steps[idx - 1]?.status === "completed";
          const isLocked = !isAvailable && step.status !== "completed";

          return (
            <button
              key={step.id}
              onClick={() => isAvailable && router.push(`/child/${childId}/chapter/${chapterId}/step/${step.id}`)}
              disabled={isLocked}
              className={`w-full text-left rounded-2xl p-4 transition-all flex items-center gap-4 ${
                step.status === "completed"
                  ? "bg-green-50 border-2 border-green-200"
                  : isAvailable
                    ? "bg-white border-2 border-elevo-purple/30 shadow-md hover:shadow-lg active:scale-[0.98]"
                    : "bg-gray-50 border border-gray-200 opacity-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                step.status === "completed" ? "bg-green-400 text-white" : isAvailable ? "bg-elevo-purple text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {step.status === "completed" ? "✓" : step.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span>{TYPE_EMOJIS[step.exerciseType] || "📜"}</span>
                  <h3 className="font-bold text-sm text-gray-800 truncate">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.narrativeContext}</p>
                {step.status === "completed" && step.starsEarned && (
                  <div className="mt-1"><StarRating stars={step.starsEarned} size="sm" /></div>
                )}
              </div>
              {isLocked && <span className="text-xl">🔒</span>}
              {isAvailable && step.status !== "completed" && <span className="text-xl">⚔️</span>}
            </button>
          );
        })}

        {chapter.bossData && (
          <button
            onClick={() => allStepsCompleted && router.push(`/child/${childId}/chapter/${chapterId}/step/boss`)}
            disabled={!allStepsCompleted}
            className={`w-full text-left rounded-2xl p-4 transition-all flex items-center gap-4 ${
              allStepsCompleted
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl active:scale-[0.98] animate-pulse-glow"
                : "bg-gray-100 border border-gray-200 opacity-50"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${allStepsCompleted ? "bg-white/20" : "bg-gray-200"}`}>
              👹
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm">{(chapter.bossData as { name: string }).name}</h3>
              <p className="text-xs opacity-80">{(chapter.bossData as { description: string }).description}</p>
            </div>
            {!allStepsCompleted && <span className="text-xl">🔒</span>}
          </button>
        )}
      </div>
    </div>
  );
}
