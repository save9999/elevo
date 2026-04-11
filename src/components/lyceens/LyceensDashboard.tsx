'use client';

import Link from 'next/link';
import { PLANET_ACTIVITIES } from '../explorateurs/planets/planet-activities';

/**
 * Dashboard Lycéens (14-18 ans).
 *
 * Différences vs Explorateurs/Aventuriers :
 *  - Pas de LUMO cartoon, pas de hub-monde
 *  - Interface style "productivity app" : sidebar + grid d'exercices
 *  - Ton direct : "Entraînement", "Rééducation", "Bilan"
 *  - Vocabulaire : « exercice », « module », « bilan » — pas de « mission »
 *  - Typographie sans serif moderne
 *  - Focus sur le suivi longitudinal et la compensation des troubles dys déjà diagnostiqués
 */

const MODULES = [
  {
    slug: 'alphabos',
    name: 'Lecture rapide',
    tag: 'Fluence',
    description: 'Fluence de lecture, décodage, reconnaissance de pseudo-mots.',
    dysCompensation: 'Dyslexie',
  },
  {
    slug: 'scripta',
    name: 'Orthographe & expression',
    tag: 'Écrit',
    description: 'Orthographe lexicale, homophones grammaticaux, copie rapide.',
    dysCompensation: 'Dysorthographie',
  },
  {
    slug: 'numeris',
    name: 'Calcul & sens du nombre',
    tag: 'Maths',
    description: 'Calcul mental, transcodage, faits numériques, droite numérique.',
    dysCompensation: 'Dyscalculie',
  },
  {
    slug: 'verbalia',
    name: 'Lexique & discrimination',
    tag: 'Langage',
    description: 'Vocabulaire précis, discrimination phonologique fine.',
    dysCompensation: 'Compensation dyslexie',
  },
  {
    slug: 'memoria',
    name: 'Mémoire & attention',
    tag: 'Cognition',
    description: 'Mémoire de travail, empan mnésique, attention soutenue.',
    dysCompensation: 'TDAH, comorbidités',
  },
  {
    slug: 'geometra',
    name: 'Visuo-spatial',
    tag: 'Espace',
    description: 'Reproduction de figures, repérage, rotation mentale.',
    dysCompensation: 'Dyspraxie',
  },
];

export function LyceensDashboard({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-10 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64">
          <div className="sticky top-10">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Elevo Lycée</p>
            <h1 className="mt-3 text-2xl font-semibold">{firstName}</h1>
            <p className="mt-1 text-sm text-slate-400">Accompagnement dys — parcours individuel</p>

            <nav className="mt-8 flex flex-col gap-1 text-sm">
              <Link
                href={`/lyceens/${childId}`}
                className="rounded-lg bg-slate-800 px-3 py-2 font-medium text-slate-100"
              >
                Tableau de bord
              </Link>
              <Link
                href={`/lyceens/${childId}/cabinet`}
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              >
                Bilans d&apos;autoévaluation
              </Link>
              <Link
                href="/parent"
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              >
                Retour parent
              </Link>
            </nav>

            <div className="mt-10 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs font-semibold text-indigo-300">À retenir</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Les exercices d&apos;Elevo ne remplacent pas une consultation orthophonique.
                Ils servent à l&apos;entraînement et la compensation entre deux séances.
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1">
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Bonjour {firstName}.</h2>
              <p className="mt-1 text-slate-400">
                Choisis un module pour t&apos;entraîner aujourd&apos;hui.
              </p>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            {MODULES.map((m) => {
              const count = PLANET_ACTIVITIES[m.slug as keyof typeof PLANET_ACTIVITIES]?.length ?? 0;
              return (
                <Link
                  key={m.slug}
                  href={`/lyceens/${childId}/module/${m.slug}`}
                  className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-indigo-300">
                      {m.tag}
                    </span>
                    <span className="text-[0.65rem] text-slate-500">
                      {count} exercice{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">{m.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{m.description}</p>
                  <p className="mt-3 text-xs text-indigo-300/70">
                    Compensation : {m.dysCompensation}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
