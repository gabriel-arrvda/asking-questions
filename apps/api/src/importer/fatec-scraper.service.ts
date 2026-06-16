import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import { basename, extname, join, resolve } from 'node:path';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';
import { parseAnswerKeyRows } from './fatec-answer-key.parser';
import { parseQuestionsFromText } from './fatec-question.parser';
import { PrismaService } from '../prisma/prisma.service';

const BASE_URL = 'https://vestibular.fatec.sp.gov.br';
const INDEX_URL = `${BASE_URL}/provas-gabaritos/`;
const REQUEST_TIMEOUT_MS = 30_000;
const execFileAsync = promisify(execFile);
const LINE_Y_TOLERANCE = 3;
const WORD_GAP = 3.2;
const BROWSER_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Referer: `${BASE_URL}/`,
  'Upgrade-Insecure-Requests': '1',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
};

type DiscoveredExam = {
  code: string;
  title: string;
  year: number;
  semester: string;
  detailUrl: string;
  examPdfUrl?: string;
  answerPdfUrl?: string;
};

type LocalExamPair = {
  answerPath: string;
  examPath: string;
  suffix: string;
};

type PdfTextItem = {
  str?: string;
  width?: number;
  transform?: number[];
};

@Injectable()
export class FatecScraperService {
  private readonly logger = new Logger(FatecScraperService.name);
  private readonly http = axios.create({
    timeout: REQUEST_TIMEOUT_MS,
    headers: BROWSER_HEADERS,
  });

  constructor(private readonly prisma: PrismaService) {}

  async importAll() {
    const localDirectory = await this.findLocalDirectory();
    if (localDirectory) {
      this.logger.log(`Using local Fatec PDFs from ${localDirectory}`);
      return this.importFromDirectory(localDirectory);
    }

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

  async importFromDirectory(directory: string) {
    const pairs = await this.discoverLocalExamPairs(directory);
    let exams = 0;
    let questions = 0;

    for (const pair of pairs) {
      const item = this.mapLocalPairToExam(pair);
      const result = await this.importExam(item, {
        examText: await this.readPdfText(pair.examPath, true),
        answerText: await this.readPdfText(pair.answerPath),
      });
      exams += result.examImported ? 1 : 0;
      questions += result.questionsImported;
    }

    return {
      examsDiscovered: pairs.length,
      examsImported: exams,
      questionsImported: questions,
      source: directory,
    };
  }

  async discoverExams(): Promise<DiscoveredExam[]> {
    this.logger.log(`Fetching Fatec index: ${INDEX_URL}`);
    const { data } = await this.http.get(INDEX_URL);
    const $ = cheerio.load(data);
    const detailUrls = new Set<string>();

    $('a[href*="detalhe"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) detailUrls.add(new URL(href, INDEX_URL).toString());
    });

    const exams: DiscoveredExam[] = [];
    for (const detailUrl of detailUrls) {
      this.logger.log(`Fetching detail page: ${detailUrl}`);
      const detail = await this.http.get(detailUrl);
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

  async importExam(item: DiscoveredExam, prefetched?: { examText: string; answerText: string }) {
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

    const [answerPdf, examPdf] = prefetched
      ? [prefetched.answerText, prefetched.examText]
      : await Promise.all([
          this.downloadPdfText(item.answerPdfUrl),
          this.downloadPdfText(item.examPdfUrl, true),
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
      const question = await this.prisma.question.upsert({
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
      await this.ensureQuestionAsset(question.id, item.examPdfUrl, parsed?.page);
      questionsImported += 1;
    }

    return { examImported: true, questionsImported };
  }

  private async findLocalDirectory() {
    const candidates = [
      process.env.FATEC_PDFS_DIR,
      resolve(process.cwd(), 'provas'),
      '/app/provas',
    ].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      try {
        const entries = await readdir(candidate);
        if (entries.some((entry) => extname(entry).toLowerCase() === '.pdf')) {
          return candidate;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private async discoverLocalExamPairs(directory: string): Promise<LocalExamPair[]> {
    const entries = await readdir(directory);
    const pdfs = entries.filter((entry) => extname(entry).toLowerCase() === '.pdf');
    const examBySuffix = new Map<string, string>();
    const answerBySuffix = new Map<string, string>();

    for (const file of pdfs) {
      const proofMatch = file.match(/^Prova-(.+)\.pdf$/i);
      if (proofMatch) {
        examBySuffix.set(proofMatch[1], join(directory, file));
      }

      const answerMatch = file.match(/^Gabarito-(.+)\.pdf$/i);
      if (answerMatch) {
        answerBySuffix.set(answerMatch[1], join(directory, file));
      }
    }

    const pairs = [...examBySuffix.entries()]
      .filter(([suffix]) => answerBySuffix.has(suffix))
      .map(([suffix, examPath]) => ({
        suffix,
        examPath,
        answerPath: answerBySuffix.get(suffix)!,
      }))
      .sort((a, b) => a.suffix.localeCompare(b.suffix, 'pt-BR'));

    if (pairs.length === 0) {
      throw new Error(`No local Prova/Gabarito pairs found in ${directory}`);
    }

    return pairs;
  }

  private mapLocalPairToExam(pair: LocalExamPair): DiscoveredExam {
    const [yearToken, semesterToken] = pair.suffix.split('-');
    const year = Number(`20${yearToken}`);
    const semester = semesterToken === '1' ? '1' : '2';
    const code = `${year}${semester}`;
    const title = `Fatec ${year} - ${semester} semestre`;

    return {
      code,
      title,
      year,
      semester,
      detailUrl: `file://${basename(pair.examPath)}`,
      examPdfUrl: pair.examPath,
      answerPdfUrl: pair.answerPath,
    };
  }

  private async readPdfText(path: string, withPageMarkers = false) {
    this.logger.log(`Reading local PDF: ${path}`);
    const file = await readFile(path);
    if (!withPageMarkers) {
      const parsed = await pdfParse(file);
      return parsed.text;
    }

    const parsed = await pdfParse(file, {
      pagerender: async (pageData) => {
        const content = await pageData.getTextContent();
        const text = this.renderPdfItemsAsText(content.items as PdfTextItem[]);
        return `\n[[PAGE:${pageData.pageNumber}]]\n${text}`;
      },
    });
    return parsed.text;
  }

  private renderPdfItemsAsText(items: PdfTextItem[]) {
    const lines: Array<{ y: number; items: Array<{ x: number; width: number; text: string }> }> = [];

    for (const item of items) {
      const text = item.str ?? '';
      const transform = item.transform;
      if (!text.trim() || !transform) continue;

      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      let line = lines.find((candidate) => Math.abs(candidate.y - y) <= LINE_Y_TOLERANCE);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ x, width: item.width ?? text.length * WORD_GAP, text });
    }

    return lines
      .sort((a, b) => b.y - a.y)
      .map((line) => {
        const parts = line.items.sort((a, b) => a.x - b.x);
        let output = '';
        let previousEnd: number | null = null;

        for (const part of parts) {
          if (previousEnd !== null && part.x - previousEnd > WORD_GAP && output && !output.endsWith(' ')) {
            output += ' ';
          }
          output += part.text;
          previousEnd = part.x + part.width;
        }

        return output.trim();
      })
      .filter(Boolean)
      .join('\n');
  }

  private async ensureQuestionAsset(questionId: string, pdfPath?: string, page?: number) {
    if (!pdfPath || !page || /^https?:\/\//i.test(pdfPath)) return;

    const relativePath = join('questions', `${questionId}.png`);
    const uploadsRoot = resolve(process.cwd(), 'uploads');
    const outputDirectory = join(uploadsRoot, 'questions');
    const outputBase = join(outputDirectory, questionId);

    try {
      await mkdir(outputDirectory, { recursive: true });
      await execFileAsync('pdftoppm', ['-png', '-r', '130', '-f', String(page), '-l', String(page), '-singlefile', pdfPath, outputBase]);
      await this.prisma.questionAsset.deleteMany({ where: { questionId, kind: 'page-image' } });
      await this.prisma.questionAsset.create({
        data: {
          questionId,
          kind: 'page-image',
          path: relativePath,
          page,
        },
      });
    } catch (error) {
      this.logger.warn(`Could not render page image for question ${questionId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async downloadPdfText(url: string, withPageMarkers = false) {
    this.logger.log(`Downloading PDF: ${url}`);
    const response = await this.http.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      headers: {
        ...BROWSER_HEADERS,
        Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
      },
    });
    const buffer = Buffer.from(response.data);
    if (!withPageMarkers) {
      const parsed = await pdfParse(buffer);
      return parsed.text;
    }

    const parsed = await pdfParse(buffer, {
      pagerender: async (pageData) => {
        const content = await pageData.getTextContent();
        return `\n[[PAGE:${pageData.pageNumber}]]\n${this.renderPdfItemsAsText(content.items as PdfTextItem[])}`;
      },
    });
    return parsed.text;
  }
}
