"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  const benefits = [
    "Bilan dys en 10 minutes",
    "Accès à tous les mini-jeux",
    "Rapports détaillés pour parents",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-neutral-50">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-200/30 blur-[120px] drift" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-200/20 blur-[100px] drift-slow" />
      <div className="grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
              E
            </div>
            <span className="font-display font-semibold text-xl text-neutral-900 tracking-tight">Elevo</span>
          </Link>
          <h1 className="text-3xl font-display font-semibold text-neutral-900 tracking-tight mb-2">
            Créez votre compte
          </h1>
          <p className="text-neutral-500 text-sm">
            Commencez l&apos;aventure Elevo avec votre enfant.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Votre prénom"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Marie"
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="parent@famille.fr"
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              placeholder="Min. 6 caractères"
              leftIcon={<Lock className="w-4 h-4" />}
              hint="Au moins 6 caractères"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3.5 py-2.5 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              {loading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-neutral-100 space-y-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-neutral-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Gratuit · Sans carte bancaire · Résultats en 10 min
        </p>
      </motion.div>
    </div>
  );
}
