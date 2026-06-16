export type AnswerKeyRow = {
  questionNumber: number;
  correctAlternative: string;
  category: string;
};

const ROW_PATTERN = /(?:^|\n)\s*(\d{1,2})\s+([A-E])\s+([^\n\r]+)/gi;

export function parseAnswerKeyRows(text: string): AnswerKeyRow[] {
  const rows: AnswerKeyRow[] = [];
  const normalized = text.replace(/\r/g, '\n');

  for (const match of normalized.matchAll(ROW_PATTERN)) {
    const questionNumber = Number(match[1]);
    const correctAlternative = match[2].toUpperCase();
    const category = match[3]
      .replace(/\s{2,}.*/, '')
      .replace(/Quest[aã]o|Alternativa|Disciplina/gi, '')
      .trim();

    if (questionNumber > 0 && category) {
      rows.push({ questionNumber, correctAlternative, category });
    }
  }

  return rows;
}
