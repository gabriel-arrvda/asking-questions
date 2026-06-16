import { describe, expect, it } from 'vitest';
import { calculateAccuracy, updateStats } from './study-stats';

describe('study stats', () => {
  it('tracks attempts and category accuracy', () => {
    const stats = updateStats(undefined, { questionId: 'q1', category: 'Matematica', isCorrect: true });
    const next = updateStats(stats, { questionId: 'q2', category: 'Matematica', isCorrect: false });

    expect(next.total).toBe(2);
    expect(next.correct).toBe(1);
    expect(next.byCategory.Matematica).toEqual({ total: 2, correct: 1 });
    expect(calculateAccuracy(next)).toBe(50);
  });
});
