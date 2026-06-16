import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async categories() {
    const groups = await this.prisma.question.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { category: 'asc' },
    });

    return groups.map((group) => ({ name: group.category, count: group._count._all }));
  }

  async exams() {
    return this.prisma.exam.findMany({
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
      select: { id: true, code: true, year: true, semester: true, title: true },
    });
  }

  async next(filters: { category?: string; examId?: string }) {
    const where: Prisma.QuestionWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.examId ? { examId: filters.examId } : {}),
    };
    const count = await this.prisma.question.count({ where });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    const [question] = await this.prisma.question.findMany({
      where,
      skip,
      take: 1,
      include: { exam: true, assets: true },
      orderBy: { id: 'asc' },
    });

    return question;
  }

  async get(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { exam: true, assets: true, explanation: true },
    });

    if (!question) throw new NotFoundException('Question not found');
    return question;
  }
}
