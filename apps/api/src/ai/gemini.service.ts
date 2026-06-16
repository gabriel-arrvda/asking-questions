import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

const ExplanationSchema = z.object({
  correctAnswer: z.string(),
  steps: z.array(z.string()).min(1),
  wrongAlternativeNotes: z.record(z.string(), z.string()),
});

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

    const prompt = [
      'Voce e um professor preparando resolucoes para vestibular Fatec.',
      'Responda apenas em JSON valido, sem markdown.',
      'Schema: {"correctAnswer":"string","steps":["string"],"wrongAlternativeNotes":{"A":"string","B":"string","C":"string","D":"string","E":"string"}}',
      'Explique o passo a passo de forma curta, clara e didatica em portugues do Brasil.',
      'Para alternativas erradas, diga o erro provavel ou por que a alternativa nao serve.',
      JSON.stringify(question),
    ].join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      this.logger.warn(`Gemini returned ${response.status}; using fallback explanation.`);
      return this.fallbackExplanation(question);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = ExplanationSchema.safeParse(JSON.parse(text));

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
}
