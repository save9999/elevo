"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.name) setName(session.user.name);
  }, [session, status, router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      } else {
        setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès !" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Erreur lors du changement de mot de passe." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    }
    setSaving(false);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
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
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/parent" className="text-[13px] font-medium text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Tableau de bord
            </Link>
          </div>
          <span className="text-[11px] bg-stone-100 text-stone-500 font-semibold px-2.5 py-1 rounded-full">
            Paramètres
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Paramètres du compte</h1>
          <p className="text-stone-500 mt-1 text-[15px]">Gérez votre profil et votre sécurité.</p>
        </div>

        {message && (
          <div className={`rounded-2xl px-5 py-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile section */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Mon profil</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-400 bg-stone-50 text-sm"
              />
              <p className="text-[11px] text-stone-400 mt-1.5">L&apos;email ne peut pas être modifié.</p>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Prénom / Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-60 text-sm"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
            </button>
          </form>
        </div>

        {/* Password section */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Changer le mot de passe</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-stone-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-stone-800 transition-all hover:shadow-lg disabled:opacity-60 text-sm"
            >
              {saving ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200/60 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Zone sensible</h2>
          </div>
          <p className="text-stone-500 text-sm mb-4">
            Pour supprimer votre compte et toutes les données associées, veuillez nous <Link href="/contact" className="text-violet-600 hover:text-violet-700 font-medium">contacter</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
