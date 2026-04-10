import type { PlanetSlug } from '../station/planets-data';
import type { PlanetActivity } from './PlanetPage';

export const PLANET_ACTIVITIES: Record<PlanetSlug, PlanetActivity[]> = {
  alphabos: [
    {
      slug: 'letter-match',
      name: 'Attrape la lettre',
      emoji: '🔠',
      description: 'Relie chaque majuscule à sa lettre minuscule. Parfait pour démarrer.',
    },
    {
      slug: 'syllable-fishing',
      name: 'Pêche à la syllabe',
      emoji: '🎣',
      description: 'Trouve la syllabe qui commence chaque mot.',
    },
    {
      slug: 'pseudo-word-read',
      name: 'Mots-martiens',
      emoji: '🛸',
      description: 'Lis des mots inventés et trouve le vrai mot qui a le même nombre de syllabes.',
    },
  ],
  numeris: [
    {
      slug: 'subitize',
      name: 'Compte éclair',
      emoji: '⚡',
      description: 'Combien il y a d\'objets ? Sans les compter un par un !',
    },
    {
      slug: 'number-line',
      name: 'La droite numérique',
      emoji: '📏',
      description: 'Place le nombre au bon endroit sur la droite.',
    },
    {
      slug: 'mental-calc',
      name: 'Calcul mental',
      emoji: '🧮',
      description: 'Résous des additions et soustractions simples.',
    },
  ],
  scripta: [
    {
      slug: 'copy-flash',
      name: 'Copie éclair',
      emoji: '📝',
      description: 'Regarde le mot, retiens-le, écris-le.',
    },
    {
      slug: 'homophone-hunt',
      name: 'Chasse aux homophones',
      emoji: '🕵️',
      description: 'A ou à ? Et ou est ? Choisis le bon mot.',
    },
  ],
  verbalia: [
    {
      slug: 'find-word',
      name: 'Le mot juste',
      emoji: '💬',
      description: 'Quelle image correspond à ce mot ?',
    },
    {
      slug: 'minimal-pairs',
      name: 'Paires minimales',
      emoji: '👂',
      description: 'Entends-tu la différence entre deux mots très proches ?',
    },
  ],
  memoria: [
    {
      slug: 'simon-lumo',
      name: 'Simon avec LUMO',
      emoji: '🌈',
      description: 'Répète la séquence de couleurs.',
    },
    {
      slug: 'image-sequence',
      name: 'Suite d\'images',
      emoji: '🧩',
      description: 'Quelle image vient ensuite dans la séquence ?',
    },
  ],
  geometra: [
    {
      slug: 'shape-reproduce',
      name: 'Reproduis la forme',
      emoji: '🔷',
      description: 'Recompose la forme qui t\'est montrée.',
    },
    {
      slug: 'left-right',
      name: 'Gauche ou droite ?',
      emoji: '🧭',
      description: 'L\'objet est-il à gauche ou à droite du repère ?',
    },
  ],
};
