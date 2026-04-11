import type { PlanetActivity } from '../explorateurs/planets/PlanetPage';

/**
 * Activités du parcours Petits (4-6 ans) — seulement les jeux qui marchent
 * sans savoir lire.
 */
export const PETITS_ACTIVITIES: Record<string, PlanetActivity[]> = {
  alphabos: [
    {
      slug: 'letter-match',
      name: 'Attrape la lettre',
      emoji: '🔠',
      description: 'Trouve la petite lettre qui va avec la grande.',
    },
  ],
  numeris: [
    {
      slug: 'rocket-math',
      name: 'Décolle la fusée',
      emoji: '🚀',
      description: 'Réponds aux calculs pour faire monter la fusée vers la lune.',
    },
    {
      slug: 'subitize',
      name: 'Compte éclair',
      emoji: '⚡',
      description: "Combien tu vois d'étoiles en un coup d'œil ?",
    },
  ],
  memoria: [
    {
      slug: 'memory-pairs',
      name: 'Les paires mystérieuses',
      emoji: '🃏',
      description: 'Retourne les cartes pour trouver toutes les paires.',
    },
    {
      slug: 'simon-lumo',
      name: 'Suis LUMO',
      emoji: '🌈',
      description: 'Répète la suite de couleurs que LUMO te montre.',
    },
  ],
};
