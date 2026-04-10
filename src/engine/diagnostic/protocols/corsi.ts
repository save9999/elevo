import type { Protocol } from './types';

/**
 * Corsi Block Tapping simplifié pour enfant.
 * Mesure la mémoire de travail visuo-spatiale (dyspraxie, TDAH).
 *
 * Version MVP : l'enfant voit une séquence de positions, puis doit les
 * reproduire dans l'ordre. On utilise un item de type "recall-sequence" qui
 * sera interprété par le ProtocolRunner comme un mini-Simon.
 */
export const corsiProtocol: Protocol = {
  id: 'corsi-lite',
  version: '1.0.0',
  publishedAt: '2026-04-10',
  name: 'Suite des lumières',
  targetTrouble: 'memoire',
  ageRange: { min: 6, max: 11 },
  durationMin: 3,
  durationMax: 5,
  source: 'Corsi Block Tapping Task (domaine public)',
  intro:
    "LUMO va faire briller des cases dans un certain ordre. Regarde bien, puis clique dessus dans le même ordre.",
  outro: 'Bravo ! Tu as une belle mémoire.',
  items: [
    {
      id: 'corsi-1',
      type: 'recall-sequence',
      prompt: 'Séquence de 3 cases',
      correct: '0,2,1', // indices de cases dans une grille 3×3 (0..8)
    },
    {
      id: 'corsi-2',
      type: 'recall-sequence',
      prompt: 'Séquence de 4 cases',
      correct: '1,3,5,7',
    },
    {
      id: 'corsi-3',
      type: 'recall-sequence',
      prompt: 'Séquence de 4 cases',
      correct: '2,4,6,0',
    },
    {
      id: 'corsi-4',
      type: 'recall-sequence',
      prompt: 'Séquence de 5 cases',
      correct: '0,3,6,4,2',
    },
    {
      id: 'corsi-5',
      type: 'recall-sequence',
      prompt: 'Séquence de 5 cases',
      correct: '1,5,8,4,2',
    },
    {
      id: 'corsi-6',
      type: 'recall-sequence',
      prompt: 'Séquence de 6 cases',
      correct: '0,4,8,3,5,1',
    },
  ],
};
