import { normalizeCategoryName } from './category-normalizer';

export type AnswerKeyRow = {
  questionNumber: number;
  correctAlternative: string;
  category: string;
};

const ROW_PATTERN = /(\d{1,2})\s+([A-E]|ANULADA)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s]*?)(?=\s+\d{1,2}\s+(?:[A-E]|ANULADA)\s+|$)/gi;

export function parseAnswerKeyRows(text: string): AnswerKeyRow[] {
  const rows: AnswerKeyRow[] = [];
  const normalized = text
    .replace(/\r/g, ' ')
    .replace(/\b(?:Quest[aã]o|Alternativa|Disciplina)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const match of normalized.matchAll(ROW_PATTERN)) {
    const questionNumber = Number(match[1]);
    const correctAlternative = match[2].toUpperCase();
    const category = match[3].trim();

    if (questionNumber > 0 && category) {
      rows.push({ questionNumber, correctAlternative, category: normalizeCategoryName(category) });
    }
  }

  return rows;
}
