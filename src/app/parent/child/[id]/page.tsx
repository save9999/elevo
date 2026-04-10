"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface LearningSession {
  id: string; module: string; activity: string;
  score: number; duration: number; xpEarned: number; createdAt: string;
}
interface Achievement { id: string; title: string; emoji: string; desc: string; unlockedAt: string }
interface Assessment { id: string; type: string; result: string; risk: string; createdAt: string }
interface ChildData {
  id: string; name: string; avatar: string; ageGroup: string;
  level: number; xp: number; streak: number; lastActivity: string | null;
  profile: {
    scoreReading: number; scoreWriting: number; scoreMath: number;
    scoreMemory: number; scoreAttention: number; scoreMotor: number;
    emotionalScore: number; socialScore: number; physicalScore: number;
    troubles: string; strengths: string; personalPlan: string;
  } | null;
  achievements: Achievement[];
  sessions: LearningSession[];
  assessments: Assessment[];
}

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};
const riskLabels: Record<string, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
};

const moduleLabels: Record<string, string> = {
  reading: "Lecture",
  writing: "Écriture",
  math: "Maths",
  memory: "Mémoire",
  attention: "Attention",
  emotional: "Émotions",
  social: "Social",
  physical: "Physique",
  creativity: "Créativité",
  orientation: "Orientation",
};

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { status } = useSession();
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/children/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setChild(data);
          if (data.profile?.personalPlan) {
            try { setPlan(JSON.parse(data.profile.personalPlan)); } catch { /* ignore */ }
          }
          setLoading(false);
        });
    }
  }, [status, id]);

  async function generatePlan() {
    setGeneratingPlan(true);
    const res = await fetch("/api/ai/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setPlan(data);
    }
    setGeneratingPlan(false);
  }

  if (loading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-5xl animate-bounce-slow">📊</div>
      </div>
    );
  }

  const radarData = child.profile
    ? [
        { subject: "Lecture", A: child.profile.scoreReading },
        { subject: "Écriture", A: child.profile.scoreWriting },
        { subject: "Maths", A: child.profile.scoreMath },
        { subject: "Mémoire", A: child.profile.scoreMemory },
        { subject: "Attention", A: child.profile.scoreAttention },
        { subject: "Moteur", A: child.profile.scoreMotor },
        { subject: "Émotions", A: child.profile.emotionalScore },
        { subject: "Social", A: child.profile.socialScore },
      ]
    : [];

  const sessionsByModule = child.sessions.reduce<Record<string, { total: number; count: number }>>(
    (acc, s) => {
      if (!acc[s.module]) acc[s.module] = { total: 0, count: 0 };
      acc[s.module].total += s.score;
      acc[s.module].count += 1;
      return acc;
    },
    {}
  );
  const barData = Object.entries(sessionsByModule).map(([mod, v]) => ({
    name: moduleLabels[mod] || mod,
    score: Math.round(v.total / v.count),
  }));

  const troubles = (() => { try { return JSON.parse(child.profile?.troubles || "[]"); } catch { return []; } })();
  const strengths = (() => { try { return JSON.parse(child.profile?.strengths || "[]"); } catch { return []; } })();
  const typedPlan = plan as {
    weeklyGoal?: string;
    dailyMinutes?: number;
    motivationalMessage?: string;
    parentTips?: string[];
    priorityModules?: { id: string; name: string; emoji: string; reason: string; sessions: number }[];
    dailySchedule?: { day: string; activities: { name: string; module: string; duration: number; emoji: string }[] }[];
  } | null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/parent" className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Retour
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{child.avatar}</span>
            <div>
              <h1 className="font-black text-slate-800">{child.name}</h1>
              <p className="text-xs text-slate-500">Niveau {child.level} · {child.xp} XP total</p>
            </div>
          </div>
          <div className="ml-auto">
            <Link
              href={`/child/${child.id}`}
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 text-sm"
            >
              🎮 Voir l&apos;espace enfant
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Niveau", value: child.level, emoji: "⭐", color: "from-yellow-400 to-orange-400" },
            { label: "XP Total", value: child.xp, emoji: "✨", color: "from-violet-400 to-purple-500" },
            { label: "Série 🔥", value: `${child.streak}j`, emoji: "🔥", color: "from-orange-400 to-red-400" },
            { label: "Succès", value: child.achievements.length, emoji: "🏆", color: "from-green-400 to-teal-400" },
          ].map((s) => (
            <div key={s.label} className="card-bubble bg-white p-5 text-center">
              <div className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dys assessment banner */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔍</div>
              <div>
                <h3 className="text-xl font-black">Bilan d&apos;apprentissage</h3>
                <p className="text-sm text-white/90 mt-1">
                  4 tests scientifiques pour détecter d&apos;éventuelles difficultés dys
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  Lecture · Phonologie · Nombre · Orthographe — ~10 min
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/parent/child/${child.id}/dys-report`}
                className="btn-fun bg-white/20 backdrop-blur text-white border border-white/30 px-4 py-2.5 text-sm hover:bg-white/30 transition-colors"
              >
                📊 Voir le rapport
              </Link>
              <Link
                href={`/child/${child.id}/dys-assessment`}
                className="btn-fun bg-white text-indigo-700 px-4 py-2.5 text-sm font-black hover:scale-105 transition-transform"
              >
                ▶ Lancer le bilan
              </Link>
            </div>
          </div>
        </div>

        {/* Radar + Troubles/Forces */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Profil de compétences</h2>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400">
                Pas encore de données. Faites passer l&apos;évaluation à votre enfant.
              </div>
            )}
          </div>

          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Forces & Défis</h2>
            {strengths.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-bold text-green-600 mb-2">✨ Points forts</p>
                <div className="space-y-1">
                  {strengths.map((s: string) => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-slate-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {troubles.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-600 mb-2">⚠️ Points à travailler</p>
                <div className="space-y-1">
                  {troubles.map((t: string) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500">→</span>
                      <span className="text-slate-700">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {strengths.length === 0 && troubles.length === 0 && (
              <p className="text-slate-400 text-sm">Aucune évaluation effectuée pour le moment.</p>
            )}
          </div>
        </div>

        {/* Session scores */}
        {barData.length > 0 && (
          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Scores moyens par module</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Plan personnalisé */}
        <div className="card-bubble bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800">Plan personnalisé IA</h2>
            <button
              onClick={generatePlan}
              disabled={generatingPlan}
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 text-sm disabled:opacity-70"
            >
              {generatingPlan ? "Génération…" : typedPlan ? "🔄 Regénérer" : "✨ Générer le plan"}
            </button>
          </div>
          {typedPlan ? (
            <div className="space-y-4">
              {typedPlan.weeklyGoal && (
                <div className="bg-violet-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-violet-500 mb-1">🎯 Objectif de la semaine</p>
                  <p className="font-semibold text-slate-700">{typedPlan.weeklyGoal}</p>
                </div>
              )}
              {typedPlan.motivationalMessage && (
                <div className="bg-yellow-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-yellow-600 mb-1">💬 Message pour {child.name}</p>
                  <p className="text-slate-700 italic">{typedPlan.motivationalMessage}</p>
                </div>
              )}
              {typedPlan.priorityModules && (
                <div>
                  <p className="text-sm font-bold text-slate-600 mb-2">Modules prioritaires</p>
                  <div className="grid grid-cols-2 gap-3">
                    {typedPlan.priorityModules.map((m) => (
                      <div key={m.id} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-xl">{m.emoji}</span>
                        <div>
                          <p className="font-bold text-sm text-slate-700">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {typedPlan.parentTips && typedPlan.parentTips.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-green-600 mb-2">💡 Conseils pour vous</p>
                  <ul className="space-y-1">
                    {typedPlan.parentTips.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Générez un plan d&apos;apprentissage personnalisé basé sur le profil de {child.name}.
            </p>
          )}
        </div>

        {/* Assessments */}
        {child.assessments.length > 0 && (
          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Historique des évaluations</h2>
            <div className="space-y-3">
              {child.assessments.map((a) => {
                let result: { summary?: string } = {};
                try { result = JSON.parse(a.result); } catch { /* ignore */ }
                return (
                  <div key={a.id} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors[a.risk] || "bg-slate-100 text-slate-600"}`}>
                      {riskLabels[a.risk] || a.risk}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{a.type}</p>
                      {result.summary && <p className="text-xs text-slate-500">{result.summary}</p>}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent sessions */}
        {child.sessions.length > 0 && (
          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Sessions récentes</h2>
            <div className="space-y-2">
              {child.sessions.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400 text-xs w-20 shrink-0">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="font-medium text-slate-700 flex-1">
                    {moduleLabels[s.module] || s.module} — {s.activity}
                  </span>
                  <span className={`font-bold ${s.score >= 70 ? "text-green-500" : s.score >= 40 ? "text-yellow-500" : "text-red-500"}`}>
                    {s.score}%
                  </span>
                  <span className="text-violet-500 font-bold text-xs">+{s.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {child.achievements.length > 0 && (
          <div className="card-bubble bg-white p-6">
            <h2 className="font-black text-slate-800 mb-4">Succès débloqués 🏆</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {child.achievements.map((a) => (
                <div key={a.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-3xl">{a.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
