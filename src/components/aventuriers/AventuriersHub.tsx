'use client';

import Link from 'next/link';
import clsx from 'clsx';

/**
 * Hub Aventuriers (10-14 ans) — esthétique « carnet de bord ».
 *
 * Différences vs Explorateurs :
 *  - Pas d'orbite cartoon, pas de sphère LUMO qui pulse
 *  - Style papier / parchment, typographie serif (display font)
 *  - Vocabulaire : « chapitres » au lieu de « planètes », « missions » au lieu d'activités
 *  - Ton plus mature, pas d'emojis géants
 *  - Même catalogue de mini-jeux que Explorateurs (réutilisés)
 */

const CHAPITRES = [
  { slug: 'alphabos', title: 'I. Lecture & décodage', emoji: '📖', desc: 'Fluence, pseudo-mots, lecture rapide.', accent: 'from-amber-700/50 to-amber-900/60' },
  { slug: 'scripta', title: 'II. Orthographe', emoji: '✒️', desc: 'Copie, dictée, règles grammaticales.', accent: 'from-emerald-700/50 to-emerald-900/60' },
  { slug: 'numeris', title: 'III. Mathématiques', emoji: '🧮', desc: 'Calcul mental, droite numérique, faits numériques.', accent: 'from-orange-700/50 to-orange-900/60' },
  { slug: 'verbalia', title: 'IV. Langage & vocabulaire', emoji: '💬', desc: 'Mots précis, discrimination fine, lexique.', accent: 'from-rose-700/50 to-rose-900/60' },
  { slug: 'memoria', title: 'V. Attention & mémoire', emoji: '🧠', desc: 'Mémoire de travail, séquences, attention soutenue.', accent: 'from-violet-700/50 to-violet-900/60' },
  { slug: 'geometra', title: 'VI. Espace & géométrie', emoji: '📐', desc: 'Repérage, reproduction de figures, orientation.', accent: 'from-cyan-700/50 to-cyan-900/60' },
];

export function AventuriersHub({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-900 text-stone-100">
      {/* Texture papier */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">
              Carnet de bord
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold italic text-amber-100">
              Les Aventuriers
            </h1>
            <p className="mt-2 text-stone-400">Bonjour {firstName}. Choisis ton prochain chapitre.</p>
          </div>
          <Link
            href="/parent"
            className="rounded-full border border-stone-700 bg-stone-900/50 px-4 py-2 text-xs text-stone-300 hover:border-stone-500"
          >
            Centre de contrôle
          </Link>
        </header>

        <section className="mb-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="font-serif text-lg italic text-amber-100">
            « Chaque mission du carnet est une occasion de muscler ton cerveau,
            de repousser tes limites et de mieux comprendre comment tu apprends. »
          </p>
          <p className="mt-2 text-right text-xs text-amber-300/70">— LUMO, gardienne du carnet</p>
        </section>

        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-stone-400">
            Chapitres ouverts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHAPITRES.map((c) => (
              <Link
                key={c.slug}
                href={`/aventuriers/${childId}/chapitre/${c.slug}`}
                className={clsx(
                  'group relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br p-5 transition hover:border-amber-500/50',
                  c.accent,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-stone-400">{c.title}</p>
                    <p className="mt-2 font-serif text-xl italic">
                      {c.desc}
                    </p>
                  </div>
                  <div className="text-3xl opacity-80">{c.emoji}</div>
                </div>
                <p className="mt-4 text-xs text-amber-200 opacity-0 transition group-hover:opacity-100">
                  → Ouvrir ce chapitre
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Accès Cabinet = bilan autoévalué, plus sérieux */}
        <section className="mt-10 rounded-2xl border border-stone-700 bg-stone-900/40 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                Cabinet du bilan
              </h3>
              <p className="mt-1 text-sm text-stone-400">
                Pour t&apos;autoévaluer et suivre ta progression sur les
                troubles dys, tu peux passer un bilan ici (à froid, sans pression).
              </p>
            </div>
            <Link
              href={`/aventuriers/${childId}/cabinet`}
              className="rounded-full bg-amber-500 px-5 py-2 text-xs font-medium text-stone-950 hover:bg-amber-400"
            >
              Accéder
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
