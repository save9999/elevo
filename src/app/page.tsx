"use client";
import Link from "next/link";

const features = [
  {
    emoji: "🧠",
    title: "Détection des troubles dys",
    desc: "Dyslexie, TDAH, HPI, dyscalculie… détectés automatiquement via des jeux adaptatifs.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    emoji: "🎯",
    title: "Plan personnalisé IA",
    desc: "Un programme unique généré pour chaque enfant selon son profil, ses forces et ses défis.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
  },
  {
    emoji: "💪",
    title: "Confiance & émotions",
    desc: "Gestion du stress, estime de soi, harcèlement scolaire, anxiété : on accompagne l'enfant entier.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
  {
    emoji: "📚",
    title: "Soutien scolaire complet",
    desc: "Lacunes rattrapées, préparation brevet/bac, mémorisation et concentration.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    emoji: "🌱",
    title: "Bien-être & santé",
    desc: "Sommeil, alimentation, activité physique, puberté : un enfant sain apprend mieux.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
  },
  {
    emoji: "🚀",
    title: "Préparation vie adulte",
    desc: "Finances, entrepreneuriat, orientation, compétences pratiques que l'école n'enseigne pas.",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
  },
];

const ageGroups = [
  {
    range: "3–6 ans",
    title: "Maternelle",
    emoji: "🐣",
    desc: "Éveil, langage, motricité fine, découverte du monde par le jeu.",
    color: "bg-yellow-100 border-yellow-300",
    badge: "bg-yellow-400",
  },
  {
    range: "6–11 ans",
    title: "Primaire",
    emoji: "🌟",
    desc: "Fondations solides en lecture, calcul, méthodo d'apprentissage et confiance.",
    color: "bg-green-100 border-green-300",
    badge: "bg-green-400",
  },
  {
    range: "11–18 ans",
    title: "Collège & Lycée",
    emoji: "🎓",
    desc: "Performance scolaire, autonomie, projet de vie et préparation aux examens.",
    color: "bg-purple-100 border-purple-300",
    badge: "bg-purple-400",
  },
];

const stats = [
  { value: "98%", label: "de parents satisfaits" },
  { value: "3M+", label: "exercices disponibles" },
  { value: "47", label: "troubles détectables" },
  { value: "3–18", label: "ans couverts" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">E</div>
            <span className="font-black text-xl text-slate-800">Elevo</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-violet-600 transition-colors">Fonctionnalités</a>
            <a href="#ages" className="hover:text-violet-600 transition-colors">Tranches d&apos;âge</a>
            <a href="#pricing" className="hover:text-violet-600 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2.5 text-sm"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pt-20 pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white border border-violet-200 rounded-full px-4 py-2 text-sm font-semibold text-violet-700 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Propulsé par l&apos;IA Claude · Anthropic
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
            L&apos;IA qui accompagne{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">
              chaque enfant
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Elevo détecte les troubles d&apos;apprentissage, crée un plan personnalisé et accompagne votre enfant
            de 3 à 18 ans dans tous les domaines de sa vie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 text-lg inline-flex items-center gap-2 justify-center"
            >
              🚀 Démarrer l&apos;évaluation gratuite
            </Link>
            <Link
              href="/login"
              className="btn-fun bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 text-lg inline-flex items-center gap-2 justify-center"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Gratuit · Sans carte bancaire · Résultats en 10 min</p>
        </div>

        {/* Floating cards */}
        <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card-bubble bg-white p-6 text-center">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                {s.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Tout ce dont votre enfant a besoin
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Une seule plateforme pour détecter, accompagner et faire progresser votre enfant dans tous les domaines.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`card-bubble ${f.bg} p-8`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
                  {f.emoji}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section id="ages" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Adapté à chaque âge
            </h2>
            <p className="text-lg text-slate-500">
              Des parcours différenciés pour respecter les stades de développement.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ageGroups.map((g) => (
              <div key={g.range} className={`card-bubble border-2 ${g.color} p-8`}>
                <div className="text-5xl mb-4">{g.emoji}</div>
                <div className={`inline-block ${g.badge} text-white text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                  {g.range}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">{g.title}</h3>
                <p className="text-slate-600">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Donnez à votre enfant la meilleure chance de réussir
          </h2>
          <p className="text-violet-200 text-lg mb-10">
            Rejoignez des milliers de familles qui font confiance à Elevo pour l&apos;avenir de leurs enfants.
          </p>
          <Link
            href="/register"
            className="btn-fun bg-white text-violet-700 px-10 py-5 text-xl inline-flex items-center gap-2"
          >
            ✨ Commencer maintenant — c&apos;est gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">E</div>
            <span className="font-bold text-white">Elevo</span>
          </div>
          <p className="text-sm">© 2026 Elevo · Propulsé par Claude AI</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
