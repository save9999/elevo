"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Achievement { id: string; title: string; emoji: string; desc: string }
interface ChildProfile {
  scoreReading: number; scoreWriting: number; scoreMath: number;
  scoreMemory: number; scoreAttention: number; troubles: string; strengths: string;
}
interface Child {
  id: string; name: string; avatar: string; ageGroup: string; level: number;
  xp: number; streak: number; lastActivity: string | null;
  profile: ChildProfile | null; achievements: Achievement[];
}

const ageGroupLabels: Record<string, string> = {
  maternelle: "Maternelle (3-6 ans)",
  primaire: "Primaire (6-11 ans)",
  "college-lycee": "Collège/Lycée (11-18 ans)",
};

const ageGroupColors: Record<string, string> = {
  maternelle: "from-yellow-400 to-orange-400",
  primaire: "from-green-400 to-emerald-500",
  "college-lycee": "from-violet-500 to-purple-600",
};

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpPerLevel = 500;
  const currentXp = xp % xpPerLevel;
  const pct = Math.min((currentXp / xpPerLevel) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
        <span>Niveau {level}</span>
        <span>{currentXp}/{xpPerLevel} XP</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="xp-bar h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8 text-right">{value}</span>
    </div>
  );
}

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", birthDate: "", avatar: "🦊" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/children")
        .then((r) => r.ok ? r.json() : [])
        .then((data) => { setChildren(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    }
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      const child = await res.json();
      setChildren((prev) => [...prev, child]);
      setShowAddChild(false);
      setAddForm({ name: "", birthDate: "", avatar: "🦊" });
      // Redirect to avatar creation wizard
      router.push(`/child/${child.id}/avatar`);
    }
    setAdding(false);
  }

  const avatarOptions = ["🦊", "🐼", "🦁", "🐬", "🦋", "🐙", "🦄", "🐧", "🦖", "🐸"];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="text-center">
          <div className="text-5xl animate-bounce-slow mb-4">🌟</div>
          <p className="text-slate-500 font-medium">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black">
              E
            </div>
            <div>
              <span className="font-black text-slate-800">Elevo</span>
              <span className="ml-2 text-xs bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                Espace Parent
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:block">
              Bonjour {session?.user?.name || "Parent"} 👋
            </span>
            <Link
              href="/parent/settings"
              className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors"
            >
              ⚙️ Paramètres
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">
            Tableau de bord famille 🏠
          </h1>
          <p className="text-slate-500 mt-1">
            Suivez les progrès de vos enfants et gérez leurs parcours d&apos;apprentissage.
          </p>
        </div>

        {/* Children grid */}
        {children.length === 0 ? (
          <div className="card-bubble bg-white p-16 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              Ajoutez votre premier enfant
            </h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Créez un profil pour votre enfant et commencez l&apos;évaluation personnalisée.
            </p>
            <button
              onClick={() => setShowAddChild(true)}
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 text-lg"
            >
              ➕ Ajouter un enfant
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {children.map((child) => {
                const troubles = (() => {
                  try { return JSON.parse(child.profile?.troubles || "[]"); } catch { return []; }
                })();
                const strengths = (() => {
                  try { return JSON.parse(child.profile?.strengths || "[]"); } catch { return []; }
                })();
                return (
                  <div key={child.id} className="card-bubble bg-white overflow-hidden">
                    {/* Top gradient */}
                    <div className={`h-2 bg-gradient-to-r ${ageGroupColors[child.ageGroup] || "from-violet-400 to-purple-500"}`} />
                    <div className="p-6">
                      {/* Avatar & Name */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ageGroupColors[child.ageGroup] || "from-violet-400 to-purple-500"} flex items-center justify-center text-3xl shadow-lg`}>
                            {child.avatar}
                          </div>
                          <div>
                            <h3 className="font-black text-xl text-slate-800">{child.name}</h3>
                            <p className="text-xs text-slate-500">{ageGroupLabels[child.ageGroup]}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-violet-600">Niv.{child.level}</div>
                          {child.streak > 0 && (
                            <div className="text-xs font-bold text-orange-500">🔥 {child.streak}j</div>
                          )}
                        </div>
                      </div>

                      {/* XP Bar */}
                      <div className="mb-4">
                        <XPBar xp={child.xp} level={child.level} />
                      </div>

                      {/* Scores */}
                      {child.profile && (
                        <div className="space-y-1.5 mb-4">
                          <ScoreBar label="Lecture" value={child.profile.scoreReading} color="bg-blue-400" />
                          <ScoreBar label="Écriture" value={child.profile.scoreWriting} color="bg-purple-400" />
                          <ScoreBar label="Maths" value={child.profile.scoreMath} color="bg-green-400" />
                          <ScoreBar label="Mémoire" value={child.profile.scoreMemory} color="bg-yellow-400" />
                          <ScoreBar label="Attention" value={child.profile.scoreAttention} color="bg-pink-400" />
                        </div>
                      )}

                      {/* Troubles/Forces */}
                      {troubles.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-red-500 mb-1">⚠️ Points à travailler</p>
                          <div className="flex flex-wrap gap-1">
                            {troubles.slice(0, 2).map((t: string) => (
                              <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {strengths.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-green-600 mb-1">✨ Points forts</p>
                          <div className="flex flex-wrap gap-1">
                            {strengths.slice(0, 2).map((s: string) => (
                              <span key={s} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent achievements */}
                      {child.achievements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-500 mb-1">Derniers succès</p>
                          <div className="flex gap-1">
                            {child.achievements.map((a) => (
                              <span key={a.id} title={a.title} className="text-xl">{a.emoji}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Last activity */}
                      {child.lastActivity && (
                        <p className="text-xs text-slate-400 mb-4">
                          Dernière activité: {new Date(child.lastActivity).toLocaleDateString("fr-FR")}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/child/${child.id}`}
                          className="btn-fun flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-2.5 text-sm text-center"
                        >
                          🎮 Espace enfant
                        </Link>
                        <Link
                          href={`/parent/child/${child.id}`}
                          className="btn-fun flex-1 bg-slate-100 text-slate-700 py-2.5 text-sm text-center"
                        >
                          📊 Détails
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add child card */}
              <button
                onClick={() => setShowAddChild(true)}
                className="card-bubble border-2 border-dashed border-slate-200 bg-white p-6 flex flex-col items-center justify-center gap-3 hover:border-violet-300 hover:bg-violet-50 transition-colors min-h-[200px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  ➕
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">Ajouter un enfant</p>
                  <p className="text-xs text-slate-400">Créer un nouveau profil</p>
                </div>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modal Add Child */}
      {showAddChild && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="card-bubble bg-white w-full max-w-md p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Nouveau profil enfant 👶</h2>
            <form onSubmit={addChild} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 text-slate-800"
                  placeholder="Léa"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date de naissance</label>
                <input
                  type="date"
                  required
                  value={addForm.birthDate}
                  onChange={(e) => setAddForm({ ...addForm, birthDate: e.target.value })}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAddForm({ ...addForm, avatar: a })}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all ${addForm.avatar === a ? "bg-violet-100 ring-2 ring-violet-500 scale-110" : "bg-slate-100 hover:bg-slate-200"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="btn-fun flex-1 bg-slate-100 text-slate-700 py-3"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-fun flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 disabled:opacity-70"
                >
                  {adding ? "Création…" : "Créer ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
