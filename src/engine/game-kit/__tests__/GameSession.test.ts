import { describe, it, expect } from 'vitest';
import { createGameSession } from '../GameSession';

describe('createGameSession', () => {
  const config = {
    activitySlug: 'letter-match',
    planetSlug: 'alphabos',
    defaultDomain: 'PHONOLOGY' as const,
  };

  it('commence avec un state vide', () => {
    const s = createGameSession(config);
    expect(s.state.correct).toBe(0);
    expect(s.state.wrong).toBe(0);
    expect(s.state.events).toHaveLength(0);
  });

  it('compte les bonnes et les mauvaises réponses', () => {
    const s = createGameSession(config);
    s.recordEvent({ kind: 'answer_correct' });
    s.recordEvent({ kind: 'answer_correct' });
    s.recordEvent({ kind: 'answer_wrong' });
    expect(s.state.correct).toBe(2);
    expect(s.state.wrong).toBe(1);
  });

  it('finish() calcule un score par défaut basé sur la précision', () => {
    const s = createGameSession(config);
    s.recordEvent({ kind: 'answer_correct' });
    s.recordEvent({ kind: 'answer_correct' });
    s.recordEvent({ kind: 'answer_correct' });
    s.recordEvent({ kind: 'answer_wrong' });
    const finished = s.finish();
    expect(finished.score).toBe(75);
    expect(finished.endedAt).toBeInstanceOf(Date);
  });

  it('finish() accepte un score custom', () => {
    const s = createGameSession(config);
    const finished = s.finish(42);
    expect(finished.score).toBe(42);
  });

  it('toObservations ne convertit que les events avec un signal', () => {
    const s = createGameSession(config);
    s.recordEvent({ kind: 'answer_correct', signal: 'letter_B_recognized', weight: 0.7 });
    s.recordEvent({ kind: 'answer_wrong' }); // pas de signal → ignoré
    s.recordEvent({
      kind: 'answer_wrong',
      signal: 'confusion_b_d',
      weight: 0.8,
      context: { shown: 'b', chosen: 'd' },
    });

    const obs = s.toObservations('child-1', 'session-1');
    expect(obs).toHaveLength(2);
    expect(obs[0]).toMatchObject({
      childId: 'child-1',
      sessionId: 'session-1',
      domain: 'PHONOLOGY',
      signal: 'letter_B_recognized',
      weight: 0.7,
    });
    expect(obs[1].context).toEqual({ shown: 'b', chosen: 'd' });
  });

  it('un event peut overrider le domaine par défaut', () => {
    const s = createGameSession(config);
    s.recordEvent({
      kind: 'answer_wrong',
      signal: 'reaction_slow',
      domain: 'ATTENTION',
      weight: 0.6,
    });
    const obs = s.toObservations('child-1');
    expect(obs[0].domain).toBe('ATTENTION');
  });
});
