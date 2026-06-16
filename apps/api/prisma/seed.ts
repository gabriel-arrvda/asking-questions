import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const exam = await prisma.exam.upsert({
    where: { code: 'demo-2026-1' },
    update: {},
    create: {
      code: 'demo-2026-1',
      year: 2026,
      semester: '1',
      title: 'Demo Fatec 2026',
      detailUrl: 'https://vestibular.fatec.sp.gov.br/provas-gabaritos/',
    },
  });

  await prisma.question.upsert({
    where: { examId_number: { examId: exam.id, number: 1 } },
    update: {},
    create: {
      examId: exam.id,
      number: 1,
      category: 'Matematica',
      statement: 'Uma turma tinha 18 estudantes e recebeu mais 6. Quantos estudantes ha agora?',
      alternatives: {
        A: '20',
        B: '22',
        C: '24',
        D: '26',
        E: '28',
      },
      correctAlternative: 'C',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
