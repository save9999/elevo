'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { LumoSpeaker } from '../explorateurs/lumo/LumoSpeaker';
import { StarField } from '../explorateurs/station/StarField';

/**
 * Hub Station pour le parcours Petits (4-6 ans).
 *
 * Spécificités vs Explorateurs :
 *  - Seulement 3 planètes (au lieu de 6) pour réduire la charge cognitive
 *  - Boutons 2x plus grands
 *  - Voix off automatique au chargement (une fois l'enfant a cliqué n'importe où)
 *  - Zéro texte de lecture long — tout passe par la voix et les icônes
 *  - Pas d'accès Cabinet (4-6 ans trop jeune pour les bilans formels)
 */

const PETITS_PLANETS = [
  {
    slug: 'alphabos',
    name: 'Les Lettres',
    emoji: '🔤',
    color: 'from-sky-300 to-indigo-600',
    glow: 'shadow-[0_0_80px_20px_rgba(99,102,241,0.55)]',
  },
  {
    slug: 'numeris',
    name: 'Les Nombres',
    emoji: '🔢',
    color: 'from-amber-300 to-orange-600',
    glow: 'shadow-[0_0_80px_20px_rgba(251,146,60,0.55)]',
  },
  {
    slug: 'memoria',
    name: 'La Mémoire',
    emoji: '🧠',
    color: 'from-violet-300 to-purple-700',
    glow: 'shadow-[0_0_80px_20px_rgba(167,139,250,0.55)]',
  },
];

export function PetitsStation({
  childId,
  firstName,
}: {
  childId: string;
  firstName: string;
}) {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <StarField />

      {/* Header simple, gros bouton retour */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5">
        <Link
          href="/parent"
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-500"
          aria-label="Retour au dashboard parent"
        >
          <span aria-hidden>🏠</span>
          <span>Parents</span>
        </Link>
        <p className="rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-200">
          Bonjour {firstName} 👋
        </p>
      </header>

      <section className="relative z-10 mx-auto mt-6 flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Choisis une planète
        </h1>
        <p className="text-base text-slate-400">
          Clique sur celle que tu veux explorer.
        </p>
      </section>

      {/* 3 planètes en grand, grille responsive, boutons GÉANTS */}
      <section className="relative z-10 mx-auto mt-10 max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {PETITS_PLANETS.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => router.push(`/petits/${childId}/planet/${p.slug}`)}
              className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-800 bg-slate-900/40 p-6 backdrop-blur transition hover:scale-105 hover:border-indigo-400 hover:bg-slate-900/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
              aria-label={`Planète ${p.name}`}
            >
              <div
                className={clsx(
                  'flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br text-7xl transition-all group-hover:scale-110',
                  p.color,
                  p.glow,
                )}
              >
                <div className="absolute inset-[25%] rounded-full bg-white/20 blur-md" />
                <span className="relative drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                  {p.emoji}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{p.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* LUMO fixe, grand format pour le parcours Petits */}
      <div className="fixed bottom-8 right-8 z-30">
        <LumoSpeaker
          text={`Bonjour ${firstName} ! Choisis une planète pour jouer avec moi.`}
          size="lg"
        />
      </div>
    </main>
  );
}
