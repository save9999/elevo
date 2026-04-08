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
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-200/25 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-amber-200/20 blur-[90px]" />

      <div className="w-full max-w-[420px] relative">
        {/* Logo + Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              E
            </div>
            <span className="font-bold text-xl text-stone-800 tracking-tight">Elevo</span>
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Créez votre compte</h1>
          <p className="text-stone-500 text-[15px]">Commencez l&apos;aventure Elevo avec votre enfant.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-8 shadow-xl shadow-stone-900/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Votre prénom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                placeholder="Marie"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                placeholder="parent@famille.fr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                placeholder="Min. 6 caractères"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-60 disabled:hover:shadow-none"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-7">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center text-[13px] text-stone-400 mt-6">
          Gratuit · Sans carte bancaire · Résultats en 10 min
        </p>
      </div>
    </div>
  );
}
