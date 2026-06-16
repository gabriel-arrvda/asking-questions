import { describe, expect, it } from 'vitest';
import { parseAnswerKeyRows } from '../src/importer/fatec-answer-key.parser';

describe('parseAnswerKeyRows', () => {
  it('extracts question number, alternative and discipline from gabarito text', () => {
    const rows = parseAnswerKeyRows(`
      Questao Alternativa Disciplina
      1 C Matematica
      2 A Portugues
      10 E Raciocinio Logico
    `);

    expect(rows).toEqual([
      { questionNumber: 1, correctAlternative: 'C', category: 'Matematica' },
      { questionNumber: 2, correctAlternative: 'A', category: 'Portugues' },
      { questionNumber: 10, correctAlternative: 'E', category: 'Raciocinio Logico' },
    ]);
  });
});
