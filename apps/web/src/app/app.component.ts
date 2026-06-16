import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { AttemptResult, Category, Exam, Question } from './api.types';
import { EMPTY_STATS, StudyStats, calculateAccuracy, updateStats } from './study-stats';

const STORAGE_KEY = 'fatec-study-stats-v1';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  categories = signal<Category[]>([]);
  exams = signal<Exam[]>([]);
  question = signal<Question | null>(null);
  result = signal<AttemptResult | null>(null);
  stats = signal<StudyStats>(this.loadStats());
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  selectedCategory = signal('');
  selectedExamId = signal('');
  selectedAlternative = signal('');
  writtenAnswer = signal('');

  accuracy = computed(() => calculateAccuracy(this.stats()));
  answered = computed(() => this.result() !== null);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadFilters();
    this.loadNextQuestion();
  }

  loadFilters() {
    this.api.categories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.error.set('Nao foi possivel carregar as categorias. Rode a importacao ou o seed do banco.'),
    });

    this.api.exams().subscribe({
      next: (exams) => this.exams.set(exams),
      error: () => this.error.set('Nao foi possivel carregar as provas. Verifique a API.'),
    });
  }

  loadNextQuestion() {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.selectedAlternative.set('');
    this.writtenAnswer.set('');

    this.api
      .nextQuestion({
        category: this.selectedCategory() || undefined,
        examId: this.selectedExamId() || undefined,
      })
      .subscribe({
        next: (question) => {
          this.question.set(question);
          this.loading.set(false);
          if (!question) this.error.set('Nenhuma questao encontrada para esses filtros.');
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Nao consegui buscar uma questao agora. Confira se API e banco estao ativos.');
        },
      });
  }

  chooseAlternative(letter: string) {
    if (this.submitting() || this.answered()) return;
    this.selectedAlternative.set(letter);
    this.submit('ALTERNATIVE');
  }

  submitWritten() {
    if (!this.writtenAnswer().trim()) {
      this.error.set('Digite uma resposta antes de enviar.');
      return;
    }
    this.submit('WRITTEN');
  }

  submit(answerMode: 'ALTERNATIVE' | 'WRITTEN') {
    const question = this.question();
    if (!question) return;

    this.submitting.set(true);
    this.error.set(null);
    this.api
      .submitAttempt({
        questionId: question.id,
        answerMode,
        selectedAlternative: answerMode === 'ALTERNATIVE' ? this.selectedAlternative() : undefined,
        writtenAnswer: answerMode === 'WRITTEN' ? this.writtenAnswer() : undefined,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.submitting.set(false);
          const nextStats = updateStats(this.stats(), {
            questionId: question.id,
            category: question.category,
            isCorrect: result.isCorrect,
          });
          this.stats.set(nextStats);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats));
        },
        error: () => {
          this.submitting.set(false);
          this.error.set('Nao foi possivel corrigir essa resposta. Tente novamente.');
        },
      });
  }

  resetStats() {
    this.stats.set(EMPTY_STATS);
    localStorage.removeItem(STORAGE_KEY);
  }

  assetUrl(assetPath: string) {
    return assetPath.startsWith('http') ? assetPath : `/assets/${assetPath.replace(/^\/+/, '')}`;
  }

  private loadStats(): StudyStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS;
    } catch {
      return EMPTY_STATS;
    }
  }
}
