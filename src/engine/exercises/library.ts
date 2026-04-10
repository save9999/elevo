// Index de la bibliothèque d'exercices d'orthophonie. Contenu dans le Plan 8.

export interface ExerciseMeta {
  id: string;
  targetTrouble: 'dyslexie' | 'dysorthographie' | 'dyscalculie' | 'articulation';
  competency: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
}

export const exerciseLibrary: ExerciseMeta[] = [];
