export type ParsedQuestion = {
  number: number;
  statement: string;
  alternatives: Record<string, string>;
  page?: number;
};

const PAGE_MARKER_PATTERN = /\[\[PAGE:(\d+)]]/g;
const QUESTION_SPLIT = /(?:^|\n)\s*(?:Quest[aã]o|QUEST[AÃ]O)\s*0?(\d{1,2})\b/g;
const ALT_START_PATTERN = /(?:^|\s)(?:\(([A-E])\)|([A-E])[).])\s+/;
const ALT_PATTERN = /(?:^|\s)(?:\(([A-E])\)|([A-E])[).])\s+([\s\S]*?)(?=(?:^|\s)(?:\([A-E]\)|[A-E][).])\s+|\[\[PAGE:\d+]]|$)/g;

function pageForOffset(text: string, offset: number): number | undefined {
  let page: number | undefined;

  for (const match of text.matchAll(PAGE_MARKER_PATTERN)) {
    if ((match.index ?? 0) > offset) break;
    page = Number(match[1]);
  }

  return page;
}

function cleanText(text: string): string {
  return text
    .replace(PAGE_MARKER_PATTERN, ' ')
    .split('')
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : character;
    })
    .join('')
    .replace(/([a-zà-ÿ])-+\s+([a-zà-ÿ])/gi, '$1$2')
    .replace(/\bVESTIBULAR\s+\d+\s*o?\s*SEM\/\d{4}\s*[•-]?\s*FATEC\s*\d*\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAlternative(text: string): string {
  return cleanText(text)
    .replace(/\s+<https?:\/\/[^>]+>.*$/i, '')
    .replace(/\s+https?:\/\/\S+.*$/i, '')
    .replace(/\s+Analise\s+.+?VESTIBULAR.+$/i, '')
    .replace(/\s+VESTIBULAR\s+.+$/i, '')
    .replace(/\s+o\s+\d+\s*$/i, '')
    .trim();
}

export function parseQuestionsFromText(text: string): ParsedQuestion[] {
  const matches = [...text.matchAll(QUESTION_SPLIT)];
  const questions: ParsedQuestion[] = [];

  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    const body = text.slice(start, end).trim();
    const number = Number(match[1]);
    const alternatives: Record<string, string> = {};
    const firstAlt = body.search(ALT_START_PATTERN);
    const statementSource = firstAlt >= 0 ? body.slice(0, firstAlt) : body;
    const alternativesSource = firstAlt >= 0 ? body.slice(firstAlt) : '';

    for (const alt of alternativesSource.matchAll(ALT_PATTERN)) {
      const letter = (alt[1] ?? alt[2]).toUpperCase();
      alternatives[letter] = cleanAlternative(alt[3]);
    }

    const statement = cleanText(statementSource);

    if (number > 0 && statement) {
      questions.push({
        number,
        statement,
        alternatives,
        page: pageForOffset(text, match.index ?? 0) ?? Math.max(1, Math.ceil(number / 4)),
      });
    }
  });

  return questions;
}
