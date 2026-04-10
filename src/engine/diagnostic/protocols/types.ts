import type { ErrorTaxonomy } from '../types';

/**
 * Format déclaratif d'un protocole de diagnostic dys.
 *
 * Un protocole est une séquence d'items à présenter à l'enfant, avec une
 * fonction pure de scoring qui transforme les réponses en score brut.
 * Le composant React `<ProtocolRunner>` peut jouer n'importe quel protocole
 * conforme à cette interface.
 */

export type ItemType =
  | 'mcq' // choix multiple
  | 'read-aloud' // lecture à voix haute (enfant parle, pas de mesure automatique du temps ici — proxy via self-report)
  | 'typed' // l'enfant tape un mot
  | 'recall-sequence'; // se souvenir d'une séquence

export interface ProtocolItem {
  id: string;
  type: ItemType;
  prompt: string;
  /** Pour MCQ : liste de réponses possibles. */
  choices?: string[];
  /** Index (MCQ) ou texte (typed) de la bonne réponse. */
  correct: string | number;
  /** Aide affichée si l'enfant hésite (optionnelle). */
  hint?: string;
}

export interface ProtocolAnswer {
  itemId: string;
  value: string | number;
  durationMs: number;
  error?: ErrorTaxonomy;
}

export interface Protocol {
  id: string;
  version: string;
  publishedAt: string; // ISO date
  name: string;
  /** Trouble cible principal. */
  targetTrouble: 'dyslexie' | 'dysorthographie' | 'dyscalculie' | 'dyspraxie' | 'memoire';
  ageRange: { min: number; max: number };
  durationMin: number; // minutes
  durationMax: number;
  source: string;
  /** Intro lue par LUMO au lancement du bilan. */
  intro: string;
  /** Message de fin. */
  outro: string;
  items: ProtocolItem[];
}
