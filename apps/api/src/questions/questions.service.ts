import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { categoryKey, normalizeCategoryName } from '../importer/category-normalizer';
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

    const merged = new Map<string, { name: string; count: number }>();
    for (const group of groups) {
      const name = normalizeCategoryName(group.category);
      const key = categoryKey(name);
      const current = merged.get(key) ?? { name, count: 0 };
      current.count += group._count._all;
      merged.set(key, current);
    }

    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  async exams() {
    return this.prisma.exam.findMany({
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
      select: { id: true, code: true, year: true, semester: true, title: true },
    });
  }

  async next(filters: { category?: string; examId?: string }) {
    const categoryFilter = filters.category ? await this.categoryVariants(filters.category) : undefined;
    const where: Prisma.QuestionWhereInput = {
      ...(categoryFilter ? { category: { in: categoryFilter } } : {}),
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

  private async categoryVariants(category: string) {
    const key = categoryKey(category);
    const existing = await this.prisma.question.findMany({
      distinct: ['category'],
      select: { category: true },
    });
    const variants = existing
      .map((item) => item.category)
      .filter((candidate) => categoryKey(candidate) === key);

    return variants.length > 0 ? variants : [normalizeCategoryName(category)];
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
