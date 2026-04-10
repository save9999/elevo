// Collecteur d'observations ambiantes. Implémentation réelle dans le Plan 3.

export type ObservationDomain =
  | 'READING_SPEED'
  | 'READING_ACCURACY'
  | 'PHONOLOGY'
  | 'WRITING'
  | 'NUMERIC'
  | 'ATTENTION'
  | 'MEMORY'
  | 'VISUO_SPATIAL'
  | 'MOTOR';

export interface ObservationInput {
  childId: string;
  sessionId?: string;
  domain: ObservationDomain;
  signal: string;
  weight: number;
  context?: Record<string, unknown>;
}

export interface ObservationCollector {
  record(input: ObservationInput): Promise<void>;
}
