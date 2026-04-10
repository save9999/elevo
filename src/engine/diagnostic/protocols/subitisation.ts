import type { Protocol } from './types';

/**
 * Protocole subitisation + transcodage numérique.
 * Cible la dyscalculie développementale.
 */
export const subitisationProtocol: Protocol = {
  id: 'subitisation-lite',
  version: '1.0.0',
  publishedAt: '2026-04-10',
  name: 'Sens du nombre',
  targetTrouble: 'dyscalculie',
  ageRange: { min: 6, max: 9 },
  durationMin: 3,
  durationMax: 5,
  source: 'Protocoles académiques libres (subitisation, transcodage)',
  intro:
    "On va jouer avec les nombres. Parfois je te montre des points, parfois je te montre un nombre. Trouve la bonne réponse à chaque fois.",
  outro: 'Bravo ! Tu as un très bon sens du nombre.',
  items: [
    {
      id: 'sub-1',
      type: 'mcq',
      prompt: 'Combien y a-t-il d\'étoiles ? ⭐⭐⭐',
      choices: ['2', '3', '4', '5'],
      correct: 1,
    },
    {
      id: 'sub-2',
      type: 'mcq',
      prompt: 'Combien y a-t-il d\'étoiles ? ⭐⭐⭐⭐⭐',
      choices: ['4', '5', '6', '7'],
      correct: 1,
    },
    {
      id: 'sub-3',
      type: 'mcq',
      prompt: 'Quel nombre est plus grand que 17 ?',
      choices: ['12', '15', '19', '9'],
      correct: 2,
    },
    {
      id: 'sub-4',
      type: 'mcq',
      prompt: 'Comment écrit-on "douze" en chiffres ?',
      choices: ['2', '12', '20', '120'],
      correct: 1,
    },
    {
      id: 'sub-5',
      type: 'mcq',
      prompt: 'Comment écrit-on "quatorze" en chiffres ?',
      choices: ['40', '14', '4', '24'],
      correct: 1,
    },
    {
      id: 'sub-6',
      type: 'mcq',
      prompt: 'Combien font 5 + 3 ?',
      choices: ['6', '7', '8', '9'],
      correct: 2,
    },
    {
      id: 'sub-7',
      type: 'mcq',
      prompt: 'Combien font 10 - 4 ?',
      choices: ['4', '5', '6', '7'],
      correct: 2,
    },
    {
      id: 'sub-8',
      type: 'mcq',
      prompt: 'Quel nombre est entre 7 et 9 ?',
      choices: ['6', '7', '8', '10'],
      correct: 2,
    },
  ],
};
