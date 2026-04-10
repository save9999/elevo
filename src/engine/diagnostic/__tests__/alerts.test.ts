import { describe, it, expect } from 'vitest';
import { evaluateAlerts, type ObservationInput } from '../alerts';

describe('evaluateAlerts', () => {
  const now = new Date('2026-04-15T12:00:00Z');
  const recent = (offsetDays: number) =>
    new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);

  it('ne génère aucune alerte si aucune observation', () => {
    expect(evaluateAlerts([], now)).toEqual([]);
  });

  it('ne génère aucune alerte si seules des observations anciennes existent', () => {
    const obs: ObservationInput[] = [
      { domain: 'PHONOLOGY', signal: 's1', weight: 1, createdAt: recent(45) },
      { domain: 'PHONOLOGY', signal: 's2', weight: 1, createdAt: recent(60) },
    ];
    expect(evaluateAlerts(obs, now)).toEqual([]);
  });

  it('déclenche une alerte ATTENTION quand le seuil attention est franchi', () => {
    const obs: ObservationInput[] = Array.from({ length: 5 }).map((_, i) => ({
      domain: 'PHONOLOGY' as const,
      signal: `conf_b_d_${i}`,
      weight: 0.7, // 5 × 0.7 = 3.5 → franchit attention (3) mais pas important (6)
      createdAt: recent(i),
    }));
    const alerts = evaluateAlerts(obs, now);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('ATTENTION');
    expect(alerts[0].domain).toBe('PHONOLOGY');
    expect(alerts[0].action).toBe('bilan_suggere');
  });

  it('déclenche une alerte IMPORTANT quand le seuil important est franchi', () => {
    const obs: ObservationInput[] = Array.from({ length: 10 }).map((_, i) => ({
      domain: 'PHONOLOGY' as const,
      signal: `conf_b_d_${i}`,
      weight: 0.7, // 10 × 0.7 = 7 → franchit important (6)
      createdAt: recent(i),
    }));
    const alerts = evaluateAlerts(obs, now);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('IMPORTANT');
    expect(alerts[0].action).toBe('consulter_pro');
  });

  it('ne compte pas les signaux positifs (weight < 0.5)', () => {
    const obs: ObservationInput[] = Array.from({ length: 20 }).map((_, i) => ({
      domain: 'PHONOLOGY' as const,
      signal: `correct_${i}`,
      weight: 0.3,
      createdAt: recent(i),
    }));
    expect(evaluateAlerts(obs, now)).toEqual([]);
  });

  it('trie les alertes par sévérité (IMPORTANT avant ATTENTION)', () => {
    const obs: ObservationInput[] = [
      // 4 observations fortes sur PHONOLOGY → attention
      ...Array.from({ length: 5 }).map((_, i) => ({
        domain: 'PHONOLOGY' as const,
        signal: `p_${i}`,
        weight: 0.7,
        createdAt: recent(i),
      })),
      // 10 observations fortes sur NUMERIC → important
      ...Array.from({ length: 10 }).map((_, i) => ({
        domain: 'NUMERIC' as const,
        signal: `n_${i}`,
        weight: 0.8,
        createdAt: recent(i),
      })),
    ];
    const alerts = evaluateAlerts(obs, now);
    expect(alerts[0].severity).toBe('IMPORTANT');
    expect(alerts[0].domain).toBe('NUMERIC');
    expect(alerts[1].severity).toBe('ATTENTION');
    expect(alerts[1].domain).toBe('PHONOLOGY');
  });

  it('ignore les domaines sans threshold configuré', () => {
    const obs: ObservationInput[] = Array.from({ length: 10 }).map((_, i) => ({
      domain: 'MOTOR' as const,
      signal: `m_${i}`,
      weight: 0.9,
      createdAt: recent(i),
    }));
    // MOTOR n'a pas de threshold → aucune alerte
    expect(evaluateAlerts(obs, now)).toEqual([]);
  });
});
