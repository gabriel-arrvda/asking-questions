export type StudyStats = {
  total: number;
  correct: number;
  recentQuestionIds: string[];
  byCategory: Record<string, { total: number; correct: number }>;
};

export type StudyAttempt = {
  questionId: string;
  category: string;
  isCorrect: boolean;
};

export const EMPTY_STATS: StudyStats = {
  total: 0,
  correct: 0,
  recentQuestionIds: [],
  byCategory: {},
};

export function updateStats(current: StudyStats | undefined, attempt: StudyAttempt): StudyStats {
  const stats = current ?? EMPTY_STATS;
  const categoryStats = stats.byCategory[attempt.category] ?? { total: 0, correct: 0 };

  return {
    total: stats.total + 1,
    correct: stats.correct + (attempt.isCorrect ? 1 : 0),
    recentQuestionIds: [attempt.questionId, ...stats.recentQuestionIds.filter((id) => id !== attempt.questionId)].slice(0, 20),
    byCategory: {
      ...stats.byCategory,
      [attempt.category]: {
        total: categoryStats.total + 1,
        correct: categoryStats.correct + (attempt.isCorrect ? 1 : 0),
      },
    },
  };
}

export function calculateAccuracy(stats: StudyStats): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.correct / stats.total) * 100);
}
