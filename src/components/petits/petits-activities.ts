import type { PlanetActivity } from '../explorateurs/planets/PlanetPage';

/**
 * Activités du parcours Petits (4-6 ans) — sélection réduite.
 *
 * Seules les activités qui ne demandent pas de savoir lire sont proposées :
 *   - Alphabos : Attrape la lettre (association visuelle maj/min)
 *   - Numeris : Compte éclair (subitisation)
 *   - Memoria : Simon avec LUMO (séquence de couleurs)
 *
 * Les 3 autres planètes (Scripta, Verbalia, Geometra) ne sont pas exposées
 * aux Petits dans ce MVP parce que leurs activités nécessitent la lecture
 * ou une discrimination phonologique plus fine.
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
      slug: 'subitize',
      name: 'Compte éclair',
      emoji: '⚡',
      description: 'Combien tu vois d\'étoiles ?',
    },
  ],
  memoria: [
    {
      slug: 'simon-lumo',
      name: 'Suis LUMO',
      emoji: '🌈',
      description: 'Répète la suite des couleurs de LUMO.',
    },
  ],
};
