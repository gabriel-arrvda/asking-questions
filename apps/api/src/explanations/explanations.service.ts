import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GeminiService } from '../ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExplanationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async ensureForQuestion(questionId: string) {
    const existing = await this.prisma.explanation.findUnique({ where: { questionId } });
    if (existing) return existing;

    const question = await this.prisma.question.findUniqueOrThrow({ where: { id: questionId } });
    const alternatives = question.alternatives as Record<string, string>;
    const generated = await this.gemini.generateExplanation({
      statement: question.statement,
      alternatives,
      correctAlternative: question.correctAlternative,
      category: question.category,
    });

    return this.prisma.explanation.create({
      data: {
        questionId,
        model: this.gemini.getModel(),
        promptVersion: this.gemini.getPromptVersion(),
        correctAnswer: generated.correctAnswer,
        steps: generated.steps as Prisma.InputJsonValue,
        wrongAlternativeNotes: generated.wrongAlternativeNotes as Prisma.InputJsonValue,
      },
    });
  }

  async regenerate(questionId: string) {
    await this.prisma.explanation.deleteMany({ where: { questionId } });
    return this.ensureForQuestion(questionId);
  }
}
