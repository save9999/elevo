"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QuestCard from "@/components/QuestCard";

interface Quest {
  id: string;
  title: string;
  description: string;
  exerciseType: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  reward: { stars?: number; xp?: number };
}

export default function QuestsPage() {
  const params = useParams();
  const childId = params.id as string;
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quests?childId=${childId}`)
      .then((r) => r.json())
      .then((d) => { setQuests(d.quests || []); setLoading(false); });
  }, [childId]);

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🔔 Quêtes du Jour</h1>
        <p className="text-white/80 text-sm mt-1">{completedCount}/{quests.length} complétées</p>
        <div className="mt-3 h-2 bg-white/20 rounded-full">
          <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: quests.length ? `${(completedCount / quests.length) * 100}%` : "0%" }} />
        </div>
      </div>
      <div className="px-4 mt-6 space-y-3 max-w-md mx-auto">
        {loading ? (
          <div className="text-center py-10"><p className="text-gray-400 animate-pulse">Chargement des quêtes...</p></div>
        ) : quests.length === 0 ? (
          <div className="text-center py-10"><p className="text-4xl mb-2">🌙</p><p className="text-gray-500">Pas de quêtes pour le moment. Reviens demain !</p></div>
        ) : (
          quests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
        )}
        {completedCount === quests.length && quests.length > 0 && (
          <div className="text-center py-6 bg-green-50 rounded-2xl border-2 border-green-200">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-black text-green-700">Toutes les quêtes du jour sont complétées !</p>
            <p className="text-sm text-green-600 mt-1">Reviens demain pour de nouvelles aventures</p>
          </div>
        )}
      </div>
    </div>
  );
}
