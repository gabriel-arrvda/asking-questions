import { BadRequestException, Injectable } from '@nestjs/common';
import { AnswerMode } from '@prisma/client';
import { evaluateAnswer } from './answer-evaluator';
import { ExplanationsService } from '../explanations/explanations.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly explanations: ExplanationsService,
  ) {}

  async create(input: { questionId: string; answerMode: 'ALTERNATIVE' | 'WRITTEN'; selectedAlternative?: string; writtenAnswer?: string }) {
    const question = await this.prisma.question.findUniqueOrThrow({ where: { id: input.questionId } });
    const alternatives = question.alternatives as Record<string, string>;
    const evaluation = evaluateAnswer(
      { correctAlternative: question.correctAlternative, alternatives },
      input,
    );

    if (!evaluation.normalizedAnswer) {
      throw new BadRequestException('Answer is required');
    }

    await this.prisma.attempt.create({
      data: {
        questionId: input.questionId,
        answerMode: input.answerMode as AnswerMode,
        selectedAlternative: input.selectedAlternative,
        writtenAnswer: input.writtenAnswer,
        normalizedAnswer: evaluation.normalizedAnswer,
        isCorrect: evaluation.isCorrect,
      },
    });

    const explanation = await this.explanations.ensureForQuestion(input.questionId);
    const notes = explanation.wrongAlternativeNotes as Record<string, string>;
    const probableError = evaluation.isCorrect ? null : notes[evaluation.normalizedAnswer] ?? 'Compare sua resposta com o passo a passo e revise o conceito principal da questao.';

    return {
      isCorrect: evaluation.isCorrect,
      correctAlternative: question.correctAlternative,
      explanation: {
        correctAnswer: explanation.correctAnswer,
        steps: explanation.steps,
        wrongAlternativeNotes: explanation.wrongAlternativeNotes,
      },
      probableError,
    };
  }
}
