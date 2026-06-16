import { describe, expect, it } from 'vitest';
import { evaluateAnswer } from '../src/attempts/answer-evaluator';

describe('evaluateAnswer', () => {
  const question = {
    correctAlternative: 'C',
    alternatives: {
      A: '12',
      B: '18',
      C: '24',
      D: '30',
      E: '36',
    },
  };

  it('marks the selected correct alternative as correct', () => {
    expect(evaluateAnswer(question, { answerMode: 'ALTERNATIVE', selectedAlternative: 'c' })).toEqual({
      isCorrect: true,
      normalizedAnswer: 'C',
    });
  });

  it('marks a wrong alternative as incorrect', () => {
    expect(evaluateAnswer(question, { answerMode: 'ALTERNATIVE', selectedAlternative: 'A' })).toEqual({
      isCorrect: false,
      normalizedAnswer: 'A',
    });
  });

  it('accepts a written final answer matching the correct alternative text', () => {
    expect(evaluateAnswer(question, { answerMode: 'WRITTEN', writtenAnswer: ' 24 ' })).toEqual({
      isCorrect: true,
      normalizedAnswer: '24',
    });
  });
});
