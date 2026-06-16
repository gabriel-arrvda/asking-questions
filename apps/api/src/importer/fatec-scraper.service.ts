import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';
import { parseAnswerKeyRows } from './fatec-answer-key.parser';
import { parseQuestionsFromText } from './fatec-question.parser';
import { PrismaService } from '../prisma/prisma.service';

const BASE_URL = 'https://vestibular.fatec.sp.gov.br';
const INDEX_URL = `${BASE_URL}/provas-gabaritos/`;

type DiscoveredExam = {
  code: string;
  title: string;
  year: number;
  semester: string;
  detailUrl: string;
  examPdfUrl?: string;
  answerPdfUrl?: string;
};

@Injectable()
export class FatecScraperService {
  private readonly logger = new Logger(FatecScraperService.name);

  constructor(private readonly prisma: PrismaService) {}

  async importAll() {
    const discovered = await this.discoverExams();
    let exams = 0;
    let questions = 0;

    for (const item of discovered) {
      const result = await this.importExam(item);
      exams += result.examImported ? 1 : 0;
      questions += result.questionsImported;
    }

    return { examsDiscovered: discovered.length, examsImported: exams, questionsImported: questions };
  }

  async discoverExams(): Promise<DiscoveredExam[]> {
    const { data } = await axios.get(INDEX_URL);
    const $ = cheerio.load(data);
    const detailUrls = new Set<string>();

    $('a[href*="detalhe"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) detailUrls.add(new URL(href, INDEX_URL).toString());
    });

    const exams: DiscoveredExam[] = [];
    for (const detailUrl of detailUrls) {
      const detail = await axios.get(detailUrl);
      const detailPage = cheerio.load(detail.data);
      const pdfLinks: string[] = [];
      detailPage('a[href$=".pdf"], a[href*=".pdf"]').each((_, element) => {
        const href = detailPage(element).attr('href');
        if (href) pdfLinks.push(new URL(href, detailUrl).toString());
      });

      const code = new URL(detailUrl).searchParams.get('q') ?? detailUrl.split('=').pop() ?? detailUrl;
      const year = Number(code.slice(0, 4)) || new Date().getFullYear();
      const semester = code.includes('2') ? '2' : '1';
      const title = detailPage('h1,h2,h3').first().text().trim() || `Fatec ${code}`;
      const answerPdfUrl = pdfLinks.find((url) => /gabarito/i.test(url));
      const examPdfUrl = pdfLinks.find((url) => !/gabarito/i.test(url));

      exams.push({ code, year, semester, title, detailUrl, examPdfUrl, answerPdfUrl });
    }

    return exams;
  }

  async importExam(item: DiscoveredExam) {
    const exam = await this.prisma.exam.upsert({
      where: { code: item.code },
      update: {
        title: item.title,
        detailUrl: item.detailUrl,
        examPdfUrl: item.examPdfUrl,
        answerPdfUrl: item.answerPdfUrl,
      },
      create: item,
    });

    if (!item.answerPdfUrl || !item.examPdfUrl) {
      this.logger.warn(`Skipping ${item.code}: missing prova or gabarito PDF.`);
      return { examImported: true, questionsImported: 0 };
    }

    const [answerPdf, examPdf] = await Promise.all([
      this.downloadPdfText(item.answerPdfUrl),
      this.downloadPdfText(item.examPdfUrl),
    ]);
    const answerRows = parseAnswerKeyRows(answerPdf);
    const parsedQuestions = parseQuestionsFromText(examPdf);
    let questionsImported = 0;

    for (const answer of answerRows) {
      await this.prisma.answerKey.upsert({
        where: { examId_questionNumber: { examId: exam.id, questionNumber: answer.questionNumber } },
        update: {
          correctAlternative: answer.correctAlternative,
          category: answer.category,
        },
        create: {
          examId: exam.id,
          questionNumber: answer.questionNumber,
          correctAlternative: answer.correctAlternative,
          category: answer.category,
        },
      });

      const parsed = parsedQuestions.find((question) => question.number === answer.questionNumber);
      await this.prisma.question.upsert({
        where: { examId_number: { examId: exam.id, number: answer.questionNumber } },
        update: {
          category: answer.category,
          correctAlternative: answer.correctAlternative,
          statement: parsed?.statement ?? `Questao ${answer.questionNumber} da prova ${exam.title}. Consulte o PDF original para o enunciado completo.`,
          alternatives: (parsed?.alternatives ?? {}) as Prisma.InputJsonValue,
          sourcePage: parsed?.page,
          sourcePdfUrl: item.examPdfUrl,
        },
        create: {
          examId: exam.id,
          number: answer.questionNumber,
          category: answer.category,
          correctAlternative: answer.correctAlternative,
          statement: parsed?.statement ?? `Questao ${answer.questionNumber} da prova ${exam.title}. Consulte o PDF original para o enunciado completo.`,
          alternatives: (parsed?.alternatives ?? {}) as Prisma.InputJsonValue,
          sourcePage: parsed?.page,
          sourcePdfUrl: item.examPdfUrl,
        },
      });
      questionsImported += 1;
    }

    return { examImported: true, questionsImported };
  }

  private async downloadPdfText(url: string) {
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
    const parsed = await pdfParse(Buffer.from(response.data));
    return parsed.text;
  }
}
