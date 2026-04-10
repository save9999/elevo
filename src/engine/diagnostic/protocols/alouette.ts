import type { Protocol } from './types';

/**
 * Protocole dérivé du principe de l'Alouette-R — version simplifiée MVP.
 *
 * ⚠️ Ce n'est PAS l'Alouette officielle de Lefavrais : on ne peut pas reproduire
 * le texte original sans vérif juridique. On utilise des pseudo-mots et des
 * mots réguliers / irréguliers tirés de la littérature publique, dans l'esprit
 * du protocole (mesurer vitesse et précision de décodage isolé).
 *
 * Mesure principale : précision de lecture de mots / pseudo-mots.
 * Limitation MVP : on ne chronomètre pas la lecture à voix haute automatiquement
 * (pas de reco vocale dans ce plan). Le score se base sur une MCQ de
 * reconnaissance visuelle après présentation.
 */
export const alouetteProtocol: Protocol = {
  id: 'alouette-lite',
  version: '1.0.0',
  publishedAt: '2026-04-10',
  name: 'Lecture rapide (inspiré Alouette)',
  targetTrouble: 'dyslexie',
  ageRange: { min: 6, max: 11 },
  durationMin: 3,
  durationMax: 5,
  source: 'Protocole inspiré d\'Alouette-R (Lefavrais), items simplifiés pour MVP Elevo',
  intro:
    "Je vais te montrer des mots et des petits mots inventés. Tu dois retrouver celui qui était affiché. Va à ton rythme, prends ton temps.",
  outro: "Merci ! J'ai bien tout noté. Tu peux retourner à la Station.",
  items: [
    // Mots réguliers simples
    {
      id: 'alouette-1',
      type: 'mcq',
      prompt: 'Quel mot étais-tu en train de lire ?',
      choices: ['LAPIN', 'LAVOIR', 'LACET', 'LAURIER'],
      correct: 0,
      hint: 'Un petit animal avec de grandes oreilles.',
    },
    {
      id: 'alouette-2',
      type: 'mcq',
      prompt: 'Retrouve le mot :',
      choices: ['CHANT', 'CHAT', 'CHAUD', 'CHAMP'],
      correct: 1,
      hint: 'Un animal qui fait miaou.',
    },
    // Mots irréguliers (pièges orthographiques fréquents)
    {
      id: 'alouette-3',
      type: 'mcq',
      prompt: 'Lis ce mot puis retrouve-le :',
      choices: ['OIGNON', 'OGNION', 'OIGNION', 'OIGNAN'],
      correct: 0,
    },
    {
      id: 'alouette-4',
      type: 'mcq',
      prompt: 'Retrouve le mot correct :',
      choices: ['AUTOMNE', 'AUTONE', 'AUTOMME', 'AUTUMNE'],
      correct: 0,
    },
    // Pseudo-mots (mesure décodage pur, sans recours au lexique mental)
    {
      id: 'alouette-5',
      type: 'mcq',
      prompt: 'Quel mot inventé as-tu lu ?',
      choices: ['TOLIPA', 'TOLIPE', 'TOLIPI', 'TOLIPO'],
      correct: 0,
    },
    {
      id: 'alouette-6',
      type: 'mcq',
      prompt: 'Retrouve le bon mot inventé :',
      choices: ['BRANVI', 'BRONVI', 'BRINVI', 'BRENVI'],
      correct: 0,
    },
    {
      id: 'alouette-7',
      type: 'mcq',
      prompt: 'Lequel de ces mots inventés as-tu vu ?',
      choices: ['FLOUCHA', 'FLUCHA', 'FLOOCHA', 'FLICHA'],
      correct: 0,
    },
    // Mots avec confusions visuelles classiques (b/d, p/q)
    {
      id: 'alouette-8',
      type: 'mcq',
      prompt: 'Choisis le bon mot :',
      choices: ['DRAP', 'BRAP', 'DRAB', 'PRAB'],
      correct: 0,
    },
    {
      id: 'alouette-9',
      type: 'mcq',
      prompt: 'Retrouve le mot :',
      choices: ['PORTE', 'BORTE', 'BOTRE', 'POTRE'],
      correct: 0,
    },
    {
      id: 'alouette-10',
      type: 'mcq',
      prompt: 'Lequel est correct ?',
      choices: ['TROMPETTE', 'TORMPETTE', 'TROMPÉTTE', 'TRAMPETTE'],
      correct: 0,
    },
  ],
};
