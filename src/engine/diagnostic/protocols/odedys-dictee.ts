import type { Protocol } from './types';

/**
 * Protocole dictée simplifié (inspiré ODEDYS).
 *
 * L'enfant entend un mot (via Web Speech API côté client, prompt est le mot
 * attendu en texte pour fallback), et doit l'écrire correctement.
 * Mesure : précision orthographique sur 10 mots de difficulté progressive.
 */
export const odedysDicteeProtocol: Protocol = {
  id: 'odedys-dictee-lite',
  version: '1.0.0',
  publishedAt: '2026-04-10',
  name: 'Dictée de mots (inspiré ODEDYS)',
  targetTrouble: 'dysorthographie',
  ageRange: { min: 7, max: 11 },
  durationMin: 4,
  durationMax: 6,
  source: 'Inspiré d\'ODEDYS / Cogni-Sciences Grenoble, items simplifiés MVP',
  intro:
    "Je vais te dire des mots un par un. Écris-les comme tu penses que ça s'écrit. Si tu n'es pas sûr·e, c'est pas grave, fais de ton mieux.",
  outro: "C'est fini, bravo ! Tu as travaillé très fort.",
  items: [
    { id: 'dic-1', type: 'typed', prompt: 'ÉCOLE', correct: 'école' },
    { id: 'dic-2', type: 'typed', prompt: 'MAMAN', correct: 'maman' },
    { id: 'dic-3', type: 'typed', prompt: 'CHAT', correct: 'chat' },
    { id: 'dic-4', type: 'typed', prompt: 'POMME', correct: 'pomme' },
    { id: 'dic-5', type: 'typed', prompt: 'BATEAU', correct: 'bateau' },
    { id: 'dic-6', type: 'typed', prompt: 'OISEAU', correct: 'oiseau' },
    { id: 'dic-7', type: 'typed', prompt: 'CHEMIN', correct: 'chemin' },
    { id: 'dic-8', type: 'typed', prompt: 'MONTAGNE', correct: 'montagne' },
    { id: 'dic-9', type: 'typed', prompt: 'HIBOU', correct: 'hibou' },
    { id: 'dic-10', type: 'typed', prompt: 'AUTOMNE', correct: 'automne' },
  ],
};
