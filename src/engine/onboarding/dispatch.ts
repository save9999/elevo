import type { Parcours } from '../types';

/**
 * Calcule le parcours d'un enfant à partir de sa date de naissance.
 *
 * Seuils basés sur §5.1 et §2 du spec refonte :
 *   4-5 ans   → PETITS
 *   6-9 ans   → EXPLORATEURS
 *   10-13 ans → AVENTURIERS
 *   14-18 ans → LYCEENS
 *
 * Les enfants hors de [4, 18] lèvent `age_out_of_range`.
 */
export function computeParcours(birthdate: Date, today: Date = new Date()): Parcours {
  const age = computeAge(birthdate, today);
  if (age < 4 || age > 18) {
    throw new Error('age_out_of_range');
  }
  if (age <= 5) return 'PETITS';
  if (age <= 9) return 'EXPLORATEURS';
  if (age <= 13) return 'AVENTURIERS';
  return 'LYCEENS';
}

/**
 * Âge en années révolues (date-of-birth aware, pas approximation par division).
 */
function computeAge(birthdate: Date, today: Date): number {
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Retourne la route Next.js à utiliser pour un enfant, selon son parcours.
 */
export function routeForChild(child: { id: string; parcours: Parcours }): string {
  switch (child.parcours) {
    case 'PETITS':
      return `/petits/${child.id}`;
    case 'EXPLORATEURS':
      return `/explorateurs/${child.id}`;
    case 'AVENTURIERS':
      return `/aventuriers/${child.id}`;
    case 'LYCEENS':
      return `/lyceens/${child.id}`;
  }
}
