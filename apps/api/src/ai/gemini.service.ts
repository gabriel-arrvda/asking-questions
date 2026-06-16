import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

const ExplanationSchema = z.object({
  correctAnswer: z.string(),
  steps: z.array(z.string()).min(1),
  wrongAlternativeNotes: z.record(z.string(), z.string()),
});

const DEFAULT_GEMINI_TIMEOUT_MS = 15_000;
const MAX_STATEMENT_CHARS = 4_000;
const MAX_ALTERNATIVE_CHARS = 900;

export type GeneratedExplanation = z.infer<typeof ExplanationSchema>;

export type GeminiQuestion = {
  statement: string;
  alternatives: Record<string, string>;
  correctAlternative: string;
  category: string;
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  private readonly timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_GEMINI_TIMEOUT_MS);
  private readonly promptVersion = 'fatec-study-v1';

  getPromptVersion() {
    return this.promptVersion;
  }

  getModel() {
    return this.model;
  }

  async generateExplanation(question: GeminiQuestion): Promise<GeneratedExplanation> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.fallbackExplanation(question);
    }

    const compactQuestion = this.compactQuestion(question);

    const prompt = [
      'Voce e um professor preparando resolucoes para vestibular Fatec.',
      'A resposta correta segundo o gabarito oficial e a alternativa ' + compactQuestion.correctAlternative,
      'Responda apenas em JSON valido, sem markdown.',
      'Schema: {"correctAnswer":"string","steps":["string"],"wrongAlternativeNotes":{"A":"string","B":"string","C":"string","D":"string","E":"string"}}',
      'Explique o passo a passo de forma curta, clara e didatica em portugues do Brasil.',
      'Mas na conclusão diga qual a alternativa correta, exemplo: (A) texto da alternativa A.',
      'Para alternativas erradas, diga o erro provavel ou por que a alternativa nao serve.',
      JSON.stringify(compactQuestion),
    ].join('\n');

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        },
      );
    } catch (error) {
      this.logger.warn(`Gemini request failed or timed out; using fallback explanation. ${error instanceof Error ? error.message : String(error)}`);
      return this.fallbackExplanation(question);
    }

    if (!response.ok) {
      this.logger.warn(`Gemini returned ${response.status}; using fallback explanation.`);
      return this.fallbackExplanation(question);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    let parsed: ReturnType<typeof ExplanationSchema.safeParse>;

    try {
      parsed = ExplanationSchema.safeParse(JSON.parse(text ?? '{}'));
    } catch {
      this.logger.warn('Gemini response was not valid JSON; using fallback explanation.');
      return this.fallbackExplanation(question);
    }

    if (!parsed.success) {
      this.logger.warn('Gemini response did not match schema; using fallback explanation.');
      return this.fallbackExplanation(question);
    }

    return parsed.data;
  }

  fallbackExplanation(question: GeminiQuestion): GeneratedExplanation {
    const correctText = question.alternatives[question.correctAlternative] ?? question.correctAlternative;
    const wrongAlternativeNotes = Object.fromEntries(
      ['A', 'B', 'C', 'D', 'E'].map((letter) => [
        letter,
        letter === question.correctAlternative
          ? 'Esta e a alternativa correta segundo o gabarito.'
          : `A alternativa ${letter} nao corresponde ao gabarito oficial. Revise o enunciado e compare com a alternativa ${question.correctAlternative}.`,
      ]),
    );

    return {
      correctAnswer: `${question.correctAlternative}) ${correctText}`,
      steps: [
        'Leia o enunciado identificando exatamente o que a questao pede.',
        `Use o conteudo de ${question.category} para eliminar alternativas incompatíveis.`,
        `Compare as alternativas restantes com o gabarito oficial: a resposta correta e ${question.correctAlternative}.`,
      ],
      wrongAlternativeNotes,
    };
  }

  private compactQuestion(question: GeminiQuestion): GeminiQuestion {
    return {
      ...question,
      statement: this.truncate(question.statement, MAX_STATEMENT_CHARS),
      alternatives: Object.fromEntries(
        Object.entries(question.alternatives).map(([letter, text]) => [letter, this.truncate(text, MAX_ALTERNATIVE_CHARS)]),
      ),
    };
  }

  private truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  }
}
