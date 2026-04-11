'use client';

import Link from 'next/link';
import { PLANET_ACTIVITIES } from '../explorateurs/planets/planet-activities';

const MODULE_TITLES: Record<string, { title: string; tag: string; description: string }> = {
  alphabos: { title: 'Lecture rapide', tag: 'Fluence', description: 'Fluence, décodage, lecture de pseudo-mots.' },
  scripta: { title: 'Orthographe & expression', tag: 'Écrit', description: 'Copie, règles grammaticales, homophones.' },
  numeris: { title: 'Calcul & sens du nombre', tag: 'Maths', description: 'Calcul mental, droite numérique, transcodage.' },
  verbalia: { title: 'Lexique & discrimination', tag: 'Langage', description: 'Vocabulaire, discrimination fine.' },
  memoria: { title: 'Mémoire & attention', tag: 'Cognition', description: 'Mémoire de travail, séquences.' },
  geometra: { title: 'Visuo-spatial', tag: 'Espace', description: 'Reproduction de figures, repérage.' },
};

export function LyceensModulePage({
  childId,
  moduleSlug,
}: {
  childId: string;
  moduleSlug: string;
}) {
  const meta = MODULE_TITLES[moduleSlug];
  const activities = PLANET_ACTIVITIES[moduleSlug as keyof typeof PLANET_ACTIVITIES] ?? [];

  if (!meta) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
        <p>Module introuvable.</p>
        <Link href={`/lyceens/${childId}`} className="mt-4 underline">← Retour</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <Link
          href={`/lyceens/${childId}`}
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Tableau de bord
        </Link>

        <header className="mt-6 mb-10 border-b border-slate-800 pb-6">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-indigo-300">
            {meta.tag}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{meta.title}</h1>
          <p className="mt-2 text-slate-400">{meta.description}</p>
        </header>

        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-slate-500">
            Exercices disponibles ({activities.length})
          </h2>
          {activities.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-700 p-6 text-sm text-slate-500">
              Aucun exercice disponible pour ce module. Nouveaux exercices à venir.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activities.map((a) => (
                <Link
                  key={a.slug}
                  href={`/lyceens/${childId}/module/${moduleSlug}/exercice/${a.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 hover:border-indigo-500 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-xl">
                      {a.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-300 opacity-0 transition group-hover:opacity-100">
                    Commencer →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
