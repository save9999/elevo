"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erreur lors de la création du compte.");
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black">
              E
            </div>
            <span className="font-black text-2xl text-slate-800">Elevo</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Rejoignez Elevo ! 🎉</h1>
          <p className="text-slate-500 mt-2">Créez votre compte parent pour commencer.</p>
        </div>

        <div className="card-bubble bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Votre prénom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 transition-colors text-slate-800"
                placeholder="Marie"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 transition-colors text-slate-800"
                placeholder="parent@famille.fr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 transition-colors text-slate-800"
                placeholder="Min. 6 caractères"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg disabled:opacity-70"
            >
              {loading ? "Création…" : "Créer mon compte ✨"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-bold text-violet-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
