/**
 * Helpers pour détecter le parcours depuis l'URL courante et construire
 * les bonnes URLs de retour (Station / Planète).
 *
 * Corrige le bug : les jeux utilisés dans plusieurs parcours (petits,
 * explorateurs, aventuriers, lyceens) construisaient tous leurs liens avec
 * /explorateurs/... en dur, ce qui renvoyait vers /onboarding quand on
 * jouait depuis un autre parcours.
 */

export type ParcoursKind = 'explorateurs' | 'petits' | 'aventuriers' | 'lyceens';

export interface ParcoursContext {
  parcours: ParcoursKind;
  childId: string;
  stationUrl: string;
  planetUrl: string;
}

/**
 * Extrait le contexte parcours depuis un pathname Next.js.
 *
 * Exemples :
 *   /explorateurs/abc/planet/alphabos/activity/letter-match
 *   → { parcours: 'explorateurs', childId: 'abc',
 *       stationUrl: '/explorateurs/abc',
 *       planetUrl: '/explorateurs/abc/planet/alphabos' }
 *
 *   /petits/abc/planet/alphabos/activity/letter-match
 *   → { parcours: 'petits', childId: 'abc',
 *       stationUrl: '/petits/abc',
 *       planetUrl: '/petits/abc/planet/alphabos' }
 *
 *   /aventuriers/abc/chapitre/alphabos/mission/letter-match
 *   → { parcours: 'aventuriers', childId: 'abc',
 *       stationUrl: '/aventuriers/abc',
 *       planetUrl: '/aventuriers/abc/chapitre/alphabos' }
 *
 *   /lyceens/abc/module/alphabos/exercice/letter-match
 *   → { parcours: 'lyceens', childId: 'abc',
 *       stationUrl: '/lyceens/abc',
 *       planetUrl: '/lyceens/abc/module/alphabos' }
 */
export function parcoursFromPath(pathname: string): ParcoursContext {
  const segments = pathname.split('/').filter(Boolean);
  const parcours = (segments[0] ?? 'explorateurs') as ParcoursKind;
  const childId = segments[1] ?? '';
  const stationUrl = `/${parcours}/${childId}`;

  // Planet URL = /parcours/childId/{container}/{slug} si au moins 4 segments
  if (segments.length >= 4) {
    const container = segments[2]; // 'planet' | 'chapitre' | 'module'
    const slug = segments[3];
    return {
      parcours,
      childId,
      stationUrl,
      planetUrl: `/${parcours}/${childId}/${container}/${slug}`,
    };
  }

  return {
    parcours,
    childId,
    stationUrl,
    planetUrl: stationUrl,
  };
}
