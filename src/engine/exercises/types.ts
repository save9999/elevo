export type Trouble =
  | 'dyslexie'
  | 'dysorthographie'
  | 'dyscalculie'
  | 'articulation'
  | 'memoire';

export type ExerciseDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Exercise {
  id: string;
  name: string;
  description: string;
  trouble: Trouble;
  competency: string;
  difficulty: ExerciseDifficulty;
  /** IDs d'exercices que l'enfant doit avoir maîtrisés avant celui-ci. */
  prerequisites: string[];
  /** Slug de mini-jeu associé pour le rendu (optionnel). */
  gameSlug?: string;
  /** Durée estimée en minutes. */
  estimatedMinutes: number;
}
