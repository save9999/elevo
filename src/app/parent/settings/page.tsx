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
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-4xl animate-spin">⚙️</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <Link href="/parent" className="text-slate-500 hover:text-violet-600 font-bold">← Tableau de bord</Link>
        <h1 className="text-xl font-black text-slate-800">Paramètres du compte</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10 space-y-8">
        {message && (
          <div className={`rounded-2xl px-5 py-4 font-semibold text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? "✓ " : "✗ "}{message.text}
          </div>
        )}

        {/* Profile section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6">👤 Mon profil</h2>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-400 bg-slate-50 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">L&apos;email ne peut pas être modifié.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Prénom / Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-violet-400"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 font-bold disabled:opacity-60"
            >
              {saving ? "Sauvegarde…" : "Sauvegarder le profil"}
            </button>
          </form>
        </div>

        {/* Password section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6">🔐 Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-violet-400"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-fun w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 font-bold disabled:opacity-60"
            >
              {saving ? "Modification…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
