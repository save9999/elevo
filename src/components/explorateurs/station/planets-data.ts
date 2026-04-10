export type PlanetSlug =
  | 'alphabos'
  | 'numeris'
  | 'scripta'
  | 'verbalia'
  | 'memoria'
  | 'geometra';

export interface Planet {
  slug: PlanetSlug;
  name: string;
  emoji: string;
  tagline: string;
  /** Domaine pédagogique principal, pour LUMO et le parent. */
  domain: string;
  /** Couleur de surface (Tailwind gradient from-). */
  gradientFrom: string;
  /** Couleur de surface (Tailwind gradient to-). */
  gradientTo: string;
  /** Couleur du halo autour de la planète. */
  halo: string;
  /** Troubles dys ciblés (infos internes pour le moteur). */
  dysTargeted: string[];
}

export const PLANETS: Planet[] = [
  {
    slug: 'alphabos',
    name: 'Alphabos',
    emoji: '🔤',
    tagline: 'La planète des lettres',
    domain: 'Lecture, phonologie',
    gradientFrom: 'from-sky-300',
    gradientTo: 'to-indigo-600',
    halo: 'shadow-[0_0_48px_10px_rgba(99,102,241,0.45)]',
    dysTargeted: ['dyslexie'],
  },
  {
    slug: 'numeris',
    name: 'Numeris',
    emoji: '🔢',
    tagline: 'La planète des nombres',
    domain: 'Maths, calcul',
    gradientFrom: 'from-amber-300',
    gradientTo: 'to-orange-600',
    halo: 'shadow-[0_0_48px_10px_rgba(251,146,60,0.45)]',
    dysTargeted: ['dyscalculie'],
  },
  {
    slug: 'scripta',
    name: 'Scripta',
    emoji: '✍️',
    tagline: 'La planète de l\'écriture',
    domain: 'Écriture, orthographe',
    gradientFrom: 'from-emerald-300',
    gradientTo: 'to-teal-700',
    halo: 'shadow-[0_0_48px_10px_rgba(16,185,129,0.45)]',
    dysTargeted: ['dysorthographie', 'dysgraphie'],
  },
  {
    slug: 'verbalia',
    name: 'Verbalia',
    emoji: '🗣️',
    tagline: 'La planète du langage',
    domain: 'Oral, vocabulaire',
    gradientFrom: 'from-pink-300',
    gradientTo: 'to-rose-600',
    halo: 'shadow-[0_0_48px_10px_rgba(244,114,182,0.45)]',
    dysTargeted: ['articulation', 'dysphasie'],
  },
  {
    slug: 'memoria',
    name: 'Memoria',
    emoji: '🧠',
    tagline: 'La planète de la mémoire',
    domain: 'Attention, mémoire',
    gradientFrom: 'from-violet-300',
    gradientTo: 'to-purple-700',
    halo: 'shadow-[0_0_48px_10px_rgba(167,139,250,0.45)]',
    dysTargeted: ['tdah', 'memoire_travail'],
  },
  {
    slug: 'geometra',
    name: 'Geometra',
    emoji: '📐',
    tagline: 'La planète de l\'espace',
    domain: 'Géométrie, visuo-spatial',
    gradientFrom: 'from-cyan-300',
    gradientTo: 'to-blue-700',
    halo: 'shadow-[0_0_48px_10px_rgba(34,211,238,0.45)]',
    dysTargeted: ['dyspraxie'],
  },
];
