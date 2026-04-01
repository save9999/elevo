"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Achievement {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  unlockedAt: string;
}

interface Session {
  id: string;
  module: string;
  score: number;
  xpEarned: number;
  createdAt: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  ageGroup: string;
  profile: {
    scoreReading: number;
    scoreWriting: number;
    scoreMath: number;
    scoreMemory: number;
    scoreAttention: number;
    scoreMotor: number;
  } | null;
  achievements: Achievement[];
  sessions: Session[];
}

const XP_PER_LEVEL = 500;

const moduleNames: Record<string, string> = {
  assessment: "Évaluation",
  reading: "Lecture",
  math: "Maths",
  memory: "Mémoire",
  emotional: "Émotions",
  social: "Relations",
  physical: "Bien-être",
  creativity: "Créativité",
  orientation: "Avenir",
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => { if (!r.ok) { router.push("/parent"); return null; } return r.json(); })
      .then((data) => { if (data) setChild(data); });
  }, [id, router]);

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-4xl animate-bounce">🏆</div>
      </div>
    );
  }

  const xpInLevel = child.xp % XP_PER_LEVEL;
  const xpProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  const scores = child.profile
    ? [
        { label: "Lecture", value: child.profile.scoreReading, emoji: "📖" },
        { label: "Écriture", value: child.profile.scoreWriting, emoji: "✏️" },
        { label: "Maths", value: child.profile.scoreMath, emoji: "🔢" },
        { label: "Mémoire", value: child.profile.scoreMemory, emoji: "🧠" },
        { label: "Attention", value: child.profile.scoreAttention, emoji: "🎯" },
        { label: "Motricité", value: child.profile.scoreMotor, emoji: "💪" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700">
      {/* Header */}
      <header className="px-4 pt-10 pb-8 flex items-center gap-3">
        <Link href={`/child/${id}`} className="text-white/80 hover:text-white p-2">←</Link>
        <div>
          <h1 className="font-black text-white text-2xl">Mon profil</h1>
          <p className="text-white/70 text-sm">{child.name}</p>
        </div>
      </header>

      <main className="bg-slate-50 rounded-t-[2rem] min-h-[calc(100vh-140px)] px-4 py-8 space-y-8">
        {/* Avatar & Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
          <div className="text-7xl mb-3">{child.avatar}</div>
          <h2 className="text-2xl font-black text-slate-800">{child.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Niveau {child.level} · {child.ageGroup === "maternelle" ? "Maternelle" : child.ageGroup === "primaire" ? "Primaire" : "Collège/Lycée"}</p>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-violet-50 rounded-2xl py-4">
              <p className="text-2xl font-black text-violet-700">{child.xp}</p>
              <p className="text-xs text-slate-500 font-bold">XP Total</p>
            </div>
            <div className="bg-orange-50 rounded-2xl py-4">
              <p className="text-2xl font-black text-orange-600">{child.streak}🔥</p>
              <p className="text-xs text-slate-500 font-bold">Jours consécutifs</p>
            </div>
            <div className="bg-green-50 rounded-2xl py-4">
              <p className="text-2xl font-black text-green-600">{child.achievements.length}</p>
              <p className="text-xs text-slate-500 font-bold">Succès</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Niveau {child.level}</span>
              <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scores */}
        {scores.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-800 mb-5">📊 Mes compétences</h3>
            <div className="space-y-4">
              {scores.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                    <span>{s.emoji} {s.label}</span>
                    <span>{s.value}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.value >= 70 ? "bg-green-400" : s.value >= 50 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-5">🏆 Mes succès ({child.achievements.length})</h3>
          {child.achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-slate-500 text-sm">Complète des modules pour débloquer des succès !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {child.achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl px-4 py-3">
                  <span className="text-3xl">{a.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                    {a.desc && <p className="text-xs text-slate-500">{a.desc}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.unlockedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-5">📚 Dernières sessions</h3>
          {child.sessions.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">Aucune session pour l&apos;instant.</p>
          ) : (
            <div className="space-y-3">
              {child.sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{moduleNames[s.module] || s.module}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-violet-600 text-sm">+{s.xpEarned} XP</p>
                    <p className="text-xs text-slate-500">Score : {s.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pb-6" />
      </main>
    </div>
  );
}
