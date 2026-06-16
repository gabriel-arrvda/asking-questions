import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GeminiService } from '../ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExplanationEventsService } from './explanation-events.service';

@Injectable()
export class ExplanationsService {
  private readonly logger = new Logger(ExplanationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly events: ExplanationEventsService,
  ) {}

  findForQuestion(questionId: string) {
    return this.prisma.explanation.findUnique({ where: { questionId } });
  }

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

  async generateForAttempt(input: {
    attemptId: string;
    questionId: string;
    normalizedAnswer: string;
    isCorrect: boolean;
  }) {
    try {
      const explanation = await this.ensureForQuestion(input.questionId);
      const notes = explanation.wrongAlternativeNotes as Record<string, string>;
      const probableError = input.isCorrect ? null : notes[input.normalizedAnswer] ?? 'Compare sua resposta com o passo a passo e revise o conceito principal da questao.';

      this.events.emitReady({
        attemptId: input.attemptId,
        questionId: input.questionId,
        explanation: {
          correctAnswer: explanation.correctAnswer,
          steps: explanation.steps,
          wrongAlternativeNotes: explanation.wrongAlternativeNotes,
        },
        probableError,
      });
    } catch (error) {
      this.logger.error(`Failed to generate explanation for attempt ${input.attemptId}`, error);
    }
  }

  async regenerate(questionId: string) {
    await this.prisma.explanation.deleteMany({ where: { questionId } });
    return this.ensureForQuestion(questionId);
  }
}
