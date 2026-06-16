import { describe, expect, it } from 'vitest';
import { parseAnswerKeyRows } from '../src/importer/fatec-answer-key.parser';
import { parseQuestionsFromText } from '../src/importer/fatec-question.parser';

describe('parseAnswerKeyRows', () => {
  it('extracts question number, alternative and discipline from gabarito text', () => {
    const rows = parseAnswerKeyRows(`
      Questao Alternativa Disciplina
      1 C Matematica
      2 A Portugues
      3 B MULTIDISCIPLINAR R
      10 E Raciocinio Logico
    `);

    expect(rows).toEqual([
      { questionNumber: 1, correctAlternative: 'C', category: 'Matemática' },
      { questionNumber: 2, correctAlternative: 'A', category: 'Português' },
      { questionNumber: 3, correctAlternative: 'B', category: 'Multidisciplinar' },
      { questionNumber: 10, correctAlternative: 'E', category: 'Raciocínio Lógico' },
    ]);
  });
});

describe('parseQuestionsFromText', () => {
  it('extracts inline parenthesized alternatives separately from the statement', () => {
    const [question] = parseQuestionsFromText(`
      Questão
      07
      O texto pergunta algo importante.
      (A) primeira alternativa.
      (B) segunda alternativa em duas linhas
      continuando aqui.
      (C) terceira alternativa.
      (D) quarta alternativa.
      (E) quinta alternativa.
      Questão
      08
      Proxima questao.
    `);

    expect(question.statement).toBe('O texto pergunta algo importante.');
    expect(question.alternatives).toEqual({
      A: 'primeira alternativa.',
      B: 'segunda alternativa em duas linhas continuando aqui.',
      C: 'terceira alternativa.',
      D: 'quarta alternativa.',
      E: 'quinta alternativa.',
    });
  });
});
