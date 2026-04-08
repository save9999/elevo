"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/parent");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/25 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-rose-200/20 blur-[90px]" />

      <div className="w-full max-w-[420px] relative">
        {/* Logo + Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              E
            </div>
            <span className="font-bold text-xl text-stone-800 tracking-tight">Elevo</span>
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Bon retour</h1>
          <p className="text-stone-500 text-[15px]">Connectez-vous pour accéder au tableau de bord.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-8 shadow-xl shadow-stone-900/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                placeholder="parent@famille.fr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                placeholder="••••••••"
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
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-7">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
