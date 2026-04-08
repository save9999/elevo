"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SmartDateInput from "@/components/SmartDateInput";

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
  maternelle: "Maternelle · 3-6 ans",
  primaire: "Primaire · 6-11 ans",
  "college-lycee": "Collège/Lycée · 11-18 ans",
};

const ageGroupAccent: Record<string, { dot: string; bar: string; bg: string }> = {
  maternelle: { dot: "bg-amber-400", bar: "bg-gradient-to-r from-amber-400 to-orange-400", bg: "bg-amber-50" },
  primaire: { dot: "bg-emerald-400", bar: "bg-gradient-to-r from-emerald-400 to-teal-500", bg: "bg-emerald-50" },
  "college-lycee": { dot: "bg-violet-500", bar: "bg-gradient-to-r from-violet-500 to-purple-600", bg: "bg-violet-50" },
};

function XPBar({ xp, level, ageGroup }: { xp: number; level: number; ageGroup: string }) {
  const xpPerLevel = 500;
  const currentXp = xp % xpPerLevel;
  const pct = Math.min((currentXp / xpPerLevel) * 100, 100);
  const accent = ageGroupAccent[ageGroup] || ageGroupAccent.primaire;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-stone-400 mb-1.5">
        <span>Niveau {level}</span>
        <span>{currentXp}/{xpPerLevel} XP</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-stone-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-stone-500 w-7 text-right">{value}</span>
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
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setAddError("");
    if (!addForm.birthDate || addForm.birthDate.length < 10) {
      setAddError("Veuillez entrer une date de naissance complète (JJ/MM/AAAA).");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setChildren((prev) => [...prev, data]);
        setShowAddChild(false);
        setAddForm({ name: "", birthDate: "", avatar: "🦊" });
        router.push(`/child/${data.id}/avatar`);
      } else {
        setAddError(data.error || "Une erreur s'est produite. Réessayez.");
      }
    } catch {
      setAddError("Impossible de créer le profil. Vérifiez votre connexion.");
    }
    setAdding(false);
  }

  const avatarOptions = ["🦊", "🐼", "🦁", "🐬", "🦋", "🐙", "🦄", "🐧", "🦖", "🐸"];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FEFCF9" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-stone-400 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FAFAF8" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl border-b border-stone-200/50" style={{ background: "rgba(250,250,248,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">
                E
              </div>
              <span className="font-bold text-stone-800 tracking-tight">Elevo</span>
            </Link>
            <span className="text-[11px] bg-violet-100 text-violet-700 font-semibold px-2.5 py-1 rounded-full">
              Espace Parent
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-stone-500 hidden md:block">
              {session?.user?.name || "Parent"}
            </span>
            <Link
              href="/parent/settings"
              className="text-[13px] font-medium text-stone-400 hover:text-stone-700 transition-colors"
            >
              Paramètres
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[13px] font-medium text-stone-400 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Bonjour {session?.user?.name || ""}
          </h1>
          <p className="text-stone-500 mt-1 text-[15px]">
            Suivez les progrès de vos enfants et gérez leurs parcours.
          </p>
        </div>

        {/* Children grid */}
        {children.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center text-3xl mx-auto mb-5">
              👶
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">
              Ajoutez votre premier enfant
            </h2>
            <p className="text-stone-500 mb-8 max-w-sm mx-auto text-[15px]">
              Créez un profil pour votre enfant et commencez l&apos;évaluation personnalisée.
            </p>
            <button
              onClick={() => setShowAddChild(true)}
              className="bg-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              Ajouter un enfant
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {children.map((child) => {
              const troubles = (() => {
                try { return JSON.parse(child.profile?.troubles || "[]"); } catch { return []; }
              })();
              const strengths = (() => {
                try { return JSON.parse(child.profile?.strengths || "[]"); } catch { return []; }
              })();
              const accent = ageGroupAccent[child.ageGroup] || ageGroupAccent.primaire;
              return (
                <div key={child.id} className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                  {/* Top accent bar */}
                  <div className={`h-1 ${accent.bar}`} />
                  <div className="p-6">
                    {/* Avatar & Name */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center text-2xl`}>
                          {child.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-stone-900">{child.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                            <p className="text-[11px] text-stone-400 font-medium">{ageGroupLabels[child.ageGroup]}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-violet-600">Niv.{child.level}</div>
                        {child.streak > 0 && (
                          <div className="text-[11px] font-semibold text-amber-500 mt-0.5">{child.streak}j de suite</div>
                        )}
                      </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mb-5">
                      <XPBar xp={child.xp} level={child.level} ageGroup={child.ageGroup} />
                    </div>

                    {/* Scores */}
                    {child.profile && (
                      <div className="space-y-2 mb-5">
                        <ScoreBar label="Lecture" value={child.profile.scoreReading} color="bg-blue-400" />
                        <ScoreBar label="Écriture" value={child.profile.scoreWriting} color="bg-purple-400" />
                        <ScoreBar label="Maths" value={child.profile.scoreMath} color="bg-emerald-400" />
                        <ScoreBar label="Mémoire" value={child.profile.scoreMemory} color="bg-amber-400" />
                        <ScoreBar label="Attention" value={child.profile.scoreAttention} color="bg-rose-400" />
                      </div>
                    )}

                    {/* Troubles/Forces */}
                    {(troubles.length > 0 || strengths.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {troubles.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[11px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                            {t}
                          </span>
                        ))}
                        {strengths.slice(0, 2).map((s: string) => (
                          <span key={s} className="text-[11px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Recent achievements */}
                    {child.achievements.length > 0 && (
                      <div className="flex gap-1 mb-4">
                        {child.achievements.map((a) => (
                          <span key={a.id} title={a.title} className="text-lg">{a.emoji}</span>
                        ))}
                      </div>
                    )}

                    {/* Last activity */}
                    {child.lastActivity && (
                      <p className="text-[11px] text-stone-400 mb-5">
                        Dernière activité : {new Date(child.lastActivity).toLocaleDateString("fr-FR")}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/child/${child.id}`}
                        className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl text-[13px] font-semibold text-center hover:bg-violet-700 transition-all"
                      >
                        Espace enfant
                      </Link>
                      <Link
                        href={`/parent/child/${child.id}`}
                        className="flex-1 bg-stone-100 text-stone-700 py-2.5 rounded-xl text-[13px] font-semibold text-center hover:bg-stone-200 transition-all"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add child card */}
            <button
              onClick={() => setShowAddChild(true)}
              className="border-2 border-dashed border-stone-200 bg-white/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-violet-300 hover:bg-violet-50/50 transition-all min-h-[200px] group"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-stone-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-stone-600 text-sm">Ajouter un enfant</p>
                <p className="text-[11px] text-stone-400">Créer un nouveau profil</p>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Modal Add Child */}
      {showAddChild && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => { setShowAddChild(false); setAddError(""); }}>
          <div className="bg-white border border-stone-200/80 rounded-2xl w-full max-w-md p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-stone-900 mb-6">Nouveau profil enfant</h2>
            <form onSubmit={addChild} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                  placeholder="Léa"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-2">Date de naissance</label>
                <SmartDateInput
                  value={addForm.birthDate}
                  onChange={(v) => setAddForm({ ...addForm, birthDate: v })}
                />
                <p className="text-[11px] text-stone-400 mt-1.5">Jour → Mois → Année s&apos;enchaînent automatiquement</p>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-2">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAddForm({ ...addForm, avatar: a })}
                      className={`w-11 h-11 rounded-xl text-xl transition-all ${addForm.avatar === a ? "bg-violet-100 ring-2 ring-violet-500 scale-110" : "bg-stone-100 hover:bg-stone-200"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {addError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                  {addError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAddChild(false); setAddError(""); }}
                  className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-full font-semibold hover:bg-stone-200 transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-violet-600 text-white py-3 rounded-full font-semibold hover:bg-violet-700 transition-all disabled:opacity-60 text-sm"
                >
                  {adding ? "Création..." : "Créer le profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
