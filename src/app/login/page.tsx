"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/parent");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-neutral-50">
      {/* Ambient background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-200/30 blur-[120px] drift" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent-200/20 blur-[100px] drift-slow" />
      <div className="grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative"
      >
        {/* Logo + Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
              E
            </div>
            <span className="font-display font-semibold text-xl text-neutral-900 tracking-tight">Elevo</span>
          </Link>
          <h1 className="text-3xl font-display font-semibold text-neutral-900 tracking-tight mb-2">
            Bon retour
          </h1>
          <p className="text-neutral-500 text-sm">
            Connectez-vous pour accéder au tableau de bord.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-md"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="parent@famille.fr"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
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
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-neutral-400 font-medium">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-500">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Créer un compte
            </Link>
          </p>
        </motion.div>

        {/* Bottom note */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Sécurisé · RGPD · Gratuit pour tester
        </p>
      </motion.div>
    </div>
  );
}
