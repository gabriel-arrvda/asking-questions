export type AnswerMode = 'ALTERNATIVE' | 'WRITTEN';

export type QuestionForEvaluation = {
  correctAlternative: string;
  alternatives: Record<string, string>;
};

export type AnswerInput = {
  answerMode: AnswerMode;
  selectedAlternative?: string | null;
  writtenAnswer?: string | null;
};

export type AnswerEvaluation = {
  isCorrect: boolean;
  normalizedAnswer: string;
};

const LETTERS = new Set(['A', 'B', 'C', 'D', 'E']);

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function evaluateAnswer(question: QuestionForEvaluation, input: AnswerInput): AnswerEvaluation {
  const correctAlternative = normalizeText(question.correctAlternative);
  const alternatives = Object.fromEntries(
    Object.entries(question.alternatives ?? {}).map(([key, value]) => [normalizeText(key), normalizeText(String(value))]),
  );

  if (input.answerMode === 'ALTERNATIVE') {
    const normalizedAnswer = normalizeText(input.selectedAlternative ?? '');
    return {
      normalizedAnswer,
      isCorrect: normalizedAnswer === correctAlternative,
    };
  }

  const normalizedAnswer = normalizeText(input.writtenAnswer ?? '');
  const correctText = alternatives[correctAlternative] ?? '';
  const isLetterAnswer = LETTERS.has(normalizedAnswer);

  return {
    normalizedAnswer,
    isCorrect: isLetterAnswer ? normalizedAnswer === correctAlternative : normalizedAnswer === correctText,
  };
}
