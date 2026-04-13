import type { PlanetSlug } from '../station/planets-data';
import type { PlanetActivity } from './PlanetPage';

export const PLANET_ACTIVITIES: Record<PlanetSlug, PlanetActivity[]> = {
  alphabos: [
    { slug: 'letter-match', name: 'Attrape la lettre', emoji: '🔠', description: 'Relie chaque majuscule à sa lettre minuscule.' },
    { slug: 'word-builder', name: 'Le mot en pièces', emoji: '🧩', description: 'Reconstitue le mot en cliquant les lettres dans le bon ordre.' },
    { slug: 'syllable-fishing', name: 'Pêche à la syllabe', emoji: '🎣', description: 'Trouve la syllabe qui commence chaque mot.' },
    { slug: 'pseudo-word-read', name: 'Mots-martiens', emoji: '🛸', description: 'Lis des mots inventés et trouve le mot qui a le même nombre de syllabes.' },
  ],
  numeris: [
    { slug: 'rocket-math', name: 'Décolle la fusée', emoji: '🚀', description: 'Chaque bonne réponse propulse ta fusée vers la lune !' },
    { slug: 'subitize', name: 'Compte éclair', emoji: '⚡', description: "Combien d'objets ? Sans les compter un par un !" },
    { slug: 'number-line', name: 'La droite numérique', emoji: '📏', description: 'Place le nombre au bon endroit sur la droite.' },
    { slug: 'mental-calc', name: 'Calcul mental', emoji: '🧮', description: 'Résous des additions et soustractions.' },
  ],
  scripta: [
    { slug: 'copy-flash', name: 'Copie éclair', emoji: '📝', description: 'Regarde le mot, retiens-le, écris-le.' },
    { slug: 'homophone-hunt', name: 'Chasse aux homophones', emoji: '🕵️', description: 'A ou à ? Et ou est ? Choisis le bon mot.' },
  ],
  verbalia: [
    { slug: 'find-word', name: 'Le mot juste', emoji: '💬', description: 'Lis la devinette et trouve le bon mot.' },
    { slug: 'minimal-pairs', name: 'Paires minimales', emoji: '👂', description: 'Entends-tu la différence entre deux mots proches ?' },
    { slug: 'color-mixer', name: 'Le mélangeur de couleurs', emoji: '🎨', description: 'Mélange les bonnes couleurs primaires pour obtenir la couleur cible.' },
  ],
  memoria: [
    { slug: 'memory-pairs', name: 'Les paires mystérieuses', emoji: '🃏', description: 'Retourne deux cartes pour trouver toutes les paires.' },
    { slug: 'simon-lumo', name: 'Simon avec LUMO', emoji: '🌈', description: 'Répète la séquence de couleurs.' },
    { slug: 'image-sequence', name: "Suite d'images", emoji: '🧩', description: "Retiens l'ordre des images et clique dans le même ordre." },
  ],
  geometra: [
    { slug: 'constellation-connect', name: 'Dessine la constellation', emoji: '✨', description: 'Relie les étoiles dans le bon ordre.' },
    { slug: 'maze-runner', name: 'Le labyrinthe de LUMO', emoji: '🏁', description: 'Trouve la sortie et collecte les étoiles sur le chemin.' },
    { slug: 'shape-reproduce', name: 'Reproduis la forme', emoji: '🔷', description: 'Recompose la figure sur la grille.' },
    { slug: 'left-right', name: 'Gauche ou droite ?', emoji: '🧭', description: "L'objet est à gauche ou à droite ?" },
  ],
};
