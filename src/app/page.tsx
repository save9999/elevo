import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      {/* Ciel étoilé */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1.5px_1.5px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_50%,white_,transparent_50%),radial-gradient(1px_1px_at_40%_70%,white_,transparent_50%),radial-gradient(2px_2px_at_90%_80%,white_,transparent_50%),radial-gradient(1px_1px_at_15%_85%,white_,transparent_50%),radial-gradient(1.5px_1.5px_at_75%_35%,white_,transparent_50%),radial-gradient(1px_1px_at_30%_15%,white_,transparent_50%)] opacity-70" />
      </div>

      {/* Aura LUMO en fond */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-500/40 via-blue-500/30 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-indigo-300 backdrop-blur">
          La Station Elevo · 4–18 ans
        </span>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight sm:text-6xl">
          Une station spatiale éducative
          <span className="block bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
            guidée par LUMO, ton IA holographique
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-slate-300">
          6 planètes à explorer. Des mini-jeux adaptatifs. Un repérage bienveillant des
          signes de troubles dys (dyslexie, dyscalculie, dysorthographie) et des exercices
          d&apos;orthophonie intégrés. Gratuit pour les parents, disponible en version pro
          pour les orthophonistes.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-indigo-500 px-8 py-3.5 font-medium text-white shadow-[0_0_32px_-8px_rgba(99,102,241,0.8)] transition hover:bg-indigo-400"
          >
            Rejoindre la station
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-700 px-8 py-3.5 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
          <Feature
            emoji="🛸"
            title="Explorer librement"
            text="Pas de progression forcée. L'enfant choisit ses planètes et révèle ses forces et ses difficultés naturellement."
          />
          <Feature
            emoji="🩺"
            title="Repérage bienveillant"
            text="Observation discrète pendant le jeu, bilans standardisés au Cabinet quand tu les demandes."
          />
          <Feature
            emoji="🤖"
            title="LUMO, guidée par l'IA"
            text="Voix off chaleureuse, ton adapté à l'enfant, encouragements pilotés par Claude."
          />
        </div>

        <p className="mt-8 text-xs text-slate-600">
          Elevo n&apos;établit aucun diagnostic médical. Nous encourageons toujours à
          consulter un orthophoniste pour un bilan officiel.
        </p>
      </div>
    </main>
  );
}

function Feature({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur">
      <div className="mb-2 text-2xl">{emoji}</div>
      <div className="mb-1 text-sm font-semibold text-slate-100">{title}</div>
      <p className="text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}
