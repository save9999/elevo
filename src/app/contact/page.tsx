"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simule l'envoi - à connecter avec un vrai service email plus tard
    setSent(true);
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-stone-200/50" style={{ background: "rgba(254,252,249,0.82)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">E</div>
            <span className="font-bold text-lg text-stone-800 tracking-tight">Elevo</span>
          </Link>
          <Link href="/" className="text-[13px] font-semibold text-stone-500 hover:text-stone-900 transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">Contactez-nous</h1>
          <p className="text-stone-500 text-[15px] leading-relaxed mb-12">
            Une question, un retour, un signalement ? Notre équipe vous répond sous 48h.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Formulaire */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h2 className="text-xl font-bold text-emerald-800 mb-2">Message envoyé</h2>
                <p className="text-emerald-600">Merci ! Nous vous répondrons dans les meilleurs délais.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-stone-600 mb-2">Nom</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-stone-600 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                      placeholder="parent@famille.fr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-stone-600 mb-2">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50"
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="question">Question générale</option>
                    <option value="technique">Problème technique</option>
                    <option value="abonnement">Abonnement et facturation</option>
                    <option value="donnees">Protection des données</option>
                    <option value="partenariat">Partenariat / Professionnel</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-stone-600 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all bg-stone-50/50 resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/25"
                >
                  Envoyer le message
                </button>
              </form>
            )}
          </div>

          {/* Infos de contact */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-900">Email</p>
                  <p className="text-sm text-stone-500">contact@elevo.app</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-900">Délai de réponse</p>
                  <p className="text-sm text-stone-500">Sous 48h ouvrées</p>
                </div>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
              <p className="text-[13px] font-semibold text-violet-800 mb-2">Protection des données</p>
              <p className="text-sm text-violet-600 leading-relaxed">
                Pour exercer vos droits RGPD (accès, rectification, suppression), précisez-le dans le sujet de votre message.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
