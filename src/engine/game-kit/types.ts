// Primitives pour les mini-jeux. Implémentation dans le Plan 3.

export interface GameSessionContext {
  childId: string;
  planetSlug: string;
  activitySlug: string;
  startedAt: Date;
}

export interface GameResult {
  score: number;
  durationMs: number;
  metadata?: Record<string, unknown>;
}
