export type ParsedQuestion = {
  number: number;
  statement: string;
  alternatives: Record<string, string>;
  page?: number;
};

const QUESTION_SPLIT = /(?:^|\n)\s*(?:Quest[aã]o|QUEST[AÃ]O)\s*0?(\d{1,2})\b/g;
const ALT_PATTERN = /(?:^|\n)\s*([A-E])[).]\s+([\s\S]*?)(?=(?:\n\s*[A-E][).]\s+)|$)/g;

export function parseQuestionsFromText(text: string): ParsedQuestion[] {
  const matches = [...text.matchAll(QUESTION_SPLIT)];
  const questions: ParsedQuestion[] = [];

  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    const body = text.slice(start, end).trim();
    const number = Number(match[1]);
    const alternatives: Record<string, string> = {};

    for (const alt of body.matchAll(ALT_PATTERN)) {
      alternatives[alt[1].toUpperCase()] = alt[2].replace(/\s+/g, ' ').trim();
    }

    const firstAltIndex = body.search(/(?:^|\n)\s*A[).]\s+/);
    const statement = (firstAltIndex >= 0 ? body.slice(0, firstAltIndex) : body)
      .replace(/\s+/g, ' ')
      .trim();

    if (number > 0 && statement) {
      questions.push({
        number,
        statement,
        alternatives,
        page: Math.max(1, Math.ceil(number / 4)),
      });
    }
  });

  return questions;
}
