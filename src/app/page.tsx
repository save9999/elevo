"use client";
import Link from "next/link";
import { useEffect } from "react";

/* ─── Data ────────────────────────────────────────────────────────── */

const features = [
  {
    icon: "🧠",
    title: "Détection des troubles dys",
    desc: "Dyslexie, TDAH, HPI, dyscalculie… détectés automatiquement via des jeux adaptatifs. Résultats dès la première session.",
    accent: "#7C3AED",
    span: 2,
  },
  {
    icon: "🎯",
    title: "Plan personnalisé IA",
    desc: "Un programme unique généré pour chaque enfant selon son profil cognitif.",
    accent: "#3B82F6",
    span: 1,
  },
  {
    icon: "💪",
    title: "Confiance & émotions",
    desc: "Estime de soi, gestion du stress, harcèlement — on accompagne l'enfant entier.",
    accent: "#EC4899",
    span: 1,
  },
  {
    icon: "📚",
    title: "Soutien scolaire complet",
    desc: "Lacunes rattrapées, préparation brevet et bac, mémorisation et concentration. Un tuteur IA disponible 24h/24.",
    accent: "#10B981",
    span: 2,
  },
  {
    icon: "🌱",
    title: "Bien-être & santé",
    desc: "Sommeil, alimentation, activité physique — un enfant sain apprend mieux.",
    accent: "#F59E0B",
    span: 2,
  },
  {
    icon: "🚀",
    title: "Préparation vie adulte",
    desc: "Finances, orientation, compétences pratiques que l'école n'enseigne pas.",
    accent: "#6366F1",
    span: 1,
  },
];

const steps = [
  {
    num: "01",
    title: "Évaluation intelligente",
    desc: "10 minutes de jeux adaptatifs suffisent. L'IA analyse le profil cognitif, émotionnel et scolaire de votre enfant.",
  },
  {
    num: "02",
    title: "Plan sur mesure",
    desc: "Claude génère un parcours d'apprentissage unique, adapté aux forces, défis et centres d'intérêt de votre enfant.",
  },
  {
    num: "03",
    title: "Progression en temps réel",
    desc: "Les exercices s'adaptent. Lumo accompagne. Vous suivez les progrès depuis votre tableau de bord.",
  },
];

const ageGroups = [
  {
    range: "3 – 6 ans",
    title: "Maternelle",
    emoji: "🐣",
    desc: "Éveil, langage, motricité fine, découverte du monde par le jeu et l'émerveillement.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "text-amber-600",
    dot: "bg-amber-400",
  },
  {
    range: "6 – 11 ans",
    title: "Primaire",
    emoji: "🌟",
    desc: "Fondations solides en lecture, calcul, méthodologie d'apprentissage et confiance en soi.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    accent: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  {
    range: "11 – 18 ans",
    title: "Collège & Lycée",
    emoji: "🎓",
    desc: "Performance scolaire, autonomie, projet de vie et préparation aux examens.",
    bg: "bg-violet-50",
    border: "border-violet-200",
    accent: "text-violet-600",
    dot: "bg-violet-400",
  },
];

const testimonials = [
  {
    quote: "On a découvert que Lucas était dyslexique grâce à Elevo. Son orthophoniste a confirmé le diagnostic. Je n'en reviens toujours pas.",
    author: "Sophia M.",
    role: "Maman de Lucas, 7 ans",
    stars: 5,
  },
  {
    quote: "Léa a gagné 3 points de moyenne en maths en 2 mois. L'IA s'adapte vraiment à son niveau, c'est bluffant.",
    author: "Marc T.",
    role: "Papa de Léa, 12 ans",
    stars: 5,
  },
  {
    quote: "Yassine adore Lumo ! Il fait ses exercices sans qu'on lui demande. Première fois qu'il est aussi motivé pour apprendre.",
    author: "Amina K.",
    role: "Maman de Yassine, 5 ans",
    stars: 5,
  },
];

const stats = [
  { value: "98%", label: "parents satisfaits" },
  { value: "3M+", label: "exercices disponibles" },
  { value: "47", label: "troubles détectables" },
  { value: "3–18", label: "ans couverts" },
];

const pricing = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    desc: "Pour découvrir Elevo",
    features: ["1 enfant", "Évaluation initiale", "5 sessions/mois", "Compagnon Lumo", "Modules de base"],
    cta: "Commencer gratuitement",
    style: "bg-white border-stone-200",
    ctaStyle: "bg-stone-100 text-stone-800 hover:bg-stone-200",
    check: "text-stone-400",
  },
  {
    name: "Famille",
    price: "9,90€",
    period: "/mois",
    desc: "Pour un suivi complet",
    badge: "Le plus populaire",
    features: ["Jusqu'à 3 enfants", "Sessions illimitées", "Plan IA personnalisé", "Tous les modules", "Tableau de bord parent", "Rapports hebdomadaires"],
    cta: "Démarrer l'essai gratuit",
    style: "bg-gradient-to-b from-violet-50 to-white border-violet-300 shadow-[0_0_60px_-12px_rgba(124,58,237,0.25)]",
    ctaStyle: "bg-violet-600 text-white hover:bg-violet-700",
    check: "text-violet-500",
    popular: true,
  },
  {
    name: "Premium",
    price: "19€",
    period: "/mois",
    desc: "Pour les familles exigeantes",
    features: ["Enfants illimités", "Tout le plan Famille", "Analyse approfondie dys", "Alertes comportementales", "Export PDF des rapports", "Support prioritaire"],
    cta: "Choisir Premium",
    style: "bg-white border-stone-200",
    ctaStyle: "bg-stone-900 text-white hover:bg-stone-800",
    check: "text-emerald-500",
  },
];

/* ─── Component ───────────────────────────────────────────────────── */

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen text-stone-900 overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* ─── Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-stone-200/50" style={{ background: "rgba(254,252,249,0.82)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              E
            </div>
            <span className="font-bold text-lg text-stone-800 tracking-tight">Elevo</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-stone-500">
            <a href="#features" className="hover:text-stone-900 transition-colors">Fonctionnalités</a>
            <a href="#method" className="hover:text-stone-900 transition-colors">Méthode</a>
            <a href="#ages" className="hover:text-stone-900 transition-colors">Tranches d&apos;âge</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-semibold text-stone-500 hover:text-stone-900 transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-semibold bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-stone-800 transition-all hover:shadow-lg"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 -right-32 w-[500px] h-[500px] rounded-full bg-violet-300/20 blur-[100px] drift" />
        <div className="absolute -bottom-20 -left-32 w-[420px] h-[420px] rounded-full bg-rose-300/15 blur-[90px] drift-slow" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-200/15 blur-[80px] drift-fast" />

        <div className="max-w-5xl mx-auto px-6 text-center relative">
          {/* Badge */}
          <div data-reveal className="inline-flex items-center gap-2.5 bg-white border border-stone-200 rounded-full px-5 py-2 text-[13px] font-medium text-stone-600 mb-12 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Propulsé par Claude · Anthropic
          </div>

          {/* Headline */}
          <h1 data-reveal className="text-[clamp(2.8rem,7.5vw,5.5rem)] font-bold tracking-[-0.03em] leading-[0.95] mb-8 text-stone-900">
            L&apos;IA qui{" "}
            <em
              className="not-italic text-violet-600"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}
            >
              comprend
            </em>
            <br />
            chaque enfant
          </h1>

          {/* Subtitle */}
          <p data-reveal className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed" style={{ transitionDelay: "100ms" }}>
            Elevo détecte les troubles d&apos;apprentissage, crée un plan personnalisé et accompagne votre enfant
            de 3 à 18 ans — scolaire, émotionnel, cognitif.
          </p>

          {/* CTAs */}
          <div data-reveal className="flex flex-col sm:flex-row gap-4 justify-center mb-6" style={{ transitionDelay: "200ms" }}>
            <Link
              href="/register"
              className="bg-violet-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-violet-700 transition-all hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              Démarrer l&apos;évaluation gratuite
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="bg-white text-stone-700 border border-stone-200 px-8 py-4 rounded-full text-base font-semibold hover:border-stone-300 hover:shadow-lg transition-all inline-flex items-center justify-center"
            >
              Se connecter
            </Link>
          </div>
          <p data-reveal className="text-sm text-stone-400" style={{ transitionDelay: "300ms" }}>
            Gratuit · Sans carte bancaire · Résultats en 10 min
          </p>
        </div>

        {/* Stats row */}
        <div className="max-w-4xl mx-auto px-6 mt-20 grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className="bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-6 text-center"
              style={{ transitionDelay: `${400 + i * 80}ms` }}
            >
              <div className="text-3xl font-bold tracking-tight text-stone-900 stat-number">{s.value}</div>
              <div className="text-[13px] text-stone-400 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features — Bento Grid ────────────────────────────────── */}
      <section id="features" className="py-28" style={{ background: "#F7F5F0" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">
              Fonctionnalités
            </p>
            <h2 data-reveal className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900" style={{ transitionDelay: "80ms" }}>
              Tout ce dont votre enfant a besoin
            </h2>
          </div>

          <div className="bento-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                className="relative bg-white rounded-2xl p-8 pl-10 border border-stone-200/80 hover:border-stone-300 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                style={{
                  gridColumn: `span ${f.span}`,
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {/* Accent bar */}
                <div className="accent-bar" style={{ background: f.accent }} />

                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-stone-500 text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section id="method" className="py-28" style={{ background: "#FEFCF9" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">
              Méthode
            </p>
            <h2 data-reveal className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900" style={{ transitionDelay: "80ms" }}>
              3 étapes, zéro complexité
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} data-reveal className="relative" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="text-6xl font-bold text-stone-200/80 mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                <p className="text-stone-500 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-stone-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Age Groups ───────────────────────────────────────────── */}
      <section id="ages" className="py-28" style={{ background: "#F7F5F0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">
              Parcours
            </p>
            <h2 data-reveal className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900" style={{ transitionDelay: "80ms" }}>
              Adapté à chaque âge
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ageGroups.map((g, i) => (
              <div
                key={g.range}
                data-reveal
                className={`${g.bg} border ${g.border} rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-5xl mb-5">{g.emoji}</div>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${g.dot}`} />
                  <span className={`text-sm font-semibold ${g.accent}`}>{g.range}</span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">{g.title}</h3>
                <p className="text-stone-600 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────── */}
      <section className="py-28" style={{ background: "#FEFCF9" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">
              Témoignages
            </p>
            <h2 data-reveal className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900" style={{ transitionDelay: "80ms" }}>
              Ce que disent les parents
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.author}
                data-reveal
                className="bg-white border border-stone-200/80 rounded-2xl p-8 hover:shadow-lg transition-all"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-stone-600 leading-relaxed mb-6" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "17px" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{t.author}</div>
                  <div className="text-stone-400 text-[13px]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-28" style={{ background: "#F7F5F0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">
              Tarifs
            </p>
            <h2 data-reveal className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900 mb-4" style={{ transitionDelay: "80ms" }}>
              Simples et transparents
            </h2>
            <p data-reveal className="text-stone-500 text-lg" style={{ transitionDelay: "160ms" }}>
              Commencez gratuitement, évoluez à votre rythme.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricing.map((plan, i) => (
              <div
                key={plan.name}
                data-reveal
                className={`relative border-2 rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-lg ${plan.style}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/25">
                    {plan.badge}
                  </div>
                )}
                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold tracking-tight text-stone-900">{plan.price}</span>
                  <span className="text-stone-400 mb-2 text-sm">{plan.period}</span>
                </div>
                <p className="text-stone-400 text-sm mb-7">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-stone-700">
                      <svg className={`w-4 h-4 flex-shrink-0 ${plan.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3.5 rounded-full text-sm font-semibold transition-all ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p data-reveal className="text-center text-stone-400 text-sm mt-10">
            Sans engagement · Résiliable à tout moment · Paiement sécurisé
          </p>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #8B5CF6 100%)" }}>
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)"
        }} />

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 data-reveal className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Donnez à votre enfant la meilleure chance de{" "}
            <em className="not-italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>
              réussir
            </em>
          </h2>
          <p data-reveal className="text-violet-200 text-lg mb-10 leading-relaxed" style={{ transitionDelay: "100ms" }}>
            Rejoignez des milliers de familles qui font confiance à Elevo pour l&apos;avenir de leurs enfants.
          </p>
          <Link
            href="/register"
            data-reveal
            className="inline-flex items-center gap-2 bg-white text-violet-700 px-10 py-5 rounded-full text-lg font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all"
            style={{ transitionDelay: "200ms" }}
          >
            Commencer maintenant — c&apos;est gratuit
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="py-16" style={{ background: "#1C1917" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Elevo</span>
            </div>
            <div className="flex flex-wrap gap-6 text-[13px] text-stone-500">
              <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#method" className="hover:text-white transition-colors">Méthode</a>
              <a href="#ages" className="hover:text-white transition-colors">Tranches d&apos;âge</a>
              <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-600">© 2026 Elevo · Propulsé par Claude AI</p>
            <div className="flex gap-6 text-sm text-stone-600">
              <a href="#" className="hover:text-stone-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-stone-400 transition-colors">CGU</a>
              <a href="#" className="hover:text-stone-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
