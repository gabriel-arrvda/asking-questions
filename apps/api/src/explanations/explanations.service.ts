import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GeminiService } from '../ai/gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExplanationEventsService } from './explanation-events.service';

type WaitingAttempt = {
  attemptId: string;
  normalizedAnswer: string;
  isCorrect: boolean;
};

@Injectable()
export class ExplanationsService {
  private readonly logger = new Logger(ExplanationsService.name);
  private readonly pendingByQuestion = new Map<string, Promise<unknown>>();
  private readonly waitingAttemptsByQuestion = new Map<string, WaitingAttempt[]>();

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

    const pending = this.pendingByQuestion.get(questionId);
    if (pending) {
      await pending;
      return this.prisma.explanation.findUniqueOrThrow({ where: { questionId } });
    }

    const generation = this.createExplanation(questionId);
    this.pendingByQuestion.set(questionId, generation);

    try {
      return await generation;
    } finally {
      this.pendingByQuestion.delete(questionId);
    }
  }

  private async createExplanation(questionId: string) {
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
    const existing = await this.findForQuestion(input.questionId);
    const currentAttempt = {
      attemptId: input.attemptId,
      normalizedAnswer: input.normalizedAnswer,
      isCorrect: input.isCorrect,
    };

    if (existing) {
      this.emitExplanationReady(input.questionId, existing, currentAttempt);
      return;
    }

    this.waitingAttemptsByQuestion.set(input.questionId, [
      ...(this.waitingAttemptsByQuestion.get(input.questionId) ?? []),
      currentAttempt,
    ]);

    if (this.pendingByQuestion.has(input.questionId)) return;

    try {
      const explanation = await this.ensureForQuestion(input.questionId);
      const waitingAttempts = this.waitingAttemptsByQuestion.get(input.questionId) ?? [currentAttempt];
      this.waitingAttemptsByQuestion.delete(input.questionId);

      for (const attempt of waitingAttempts) {
        this.emitExplanationReady(input.questionId, explanation, attempt);
      }
    } catch (error) {
      this.waitingAttemptsByQuestion.delete(input.questionId);
      this.logger.error(`Failed to generate explanation for attempt ${input.attemptId}`, error);
    }
  }

  async regenerate(questionId: string) {
    await this.prisma.explanation.deleteMany({ where: { questionId } });
    return this.ensureForQuestion(questionId);
  }

  private emitExplanationReady(
    questionId: string,
    explanation: Awaited<ReturnType<ExplanationsService['findForQuestion']>>,
    attempt: WaitingAttempt,
  ) {
    if (!explanation) return;

    const notes = explanation.wrongAlternativeNotes as Record<string, string>;
    const probableError = attempt.isCorrect ? null : notes[attempt.normalizedAnswer] ?? 'Compare sua resposta com o passo a passo e revise o conceito principal da questao.';

    this.events.emitReady({
      attemptId: attempt.attemptId,
      questionId,
      explanation: {
        correctAnswer: explanation.correctAnswer,
        steps: explanation.steps,
        wrongAlternativeNotes: explanation.wrongAlternativeNotes,
      },
      probableError,
    });
  }
}
