import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { AttemptResult, Category, Exam, ExplanationReadyEvent, Question } from './api.types';
import { EMPTY_STATS, StudyStats, calculateAccuracy, updateStats } from './study-stats';

const STORAGE_KEY = 'fatec-study-stats-v1';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  categories = signal<Category[]>([]);
  exams = signal<Exam[]>([]);
  question = signal<Question | null>(null);
  result = signal<AttemptResult | null>(null);
  stats = signal<StudyStats>(this.loadStats());
  loading = signal(false);
  submitting = signal(false);
  explanationLoading = signal(false);
  error = signal<string | null>(null);
  selectedCategory = signal('');
  selectedExamId = signal('');
  selectedAlternative = signal('');
  submittedAlternative = signal('');
  writtenAnswer = signal('');
  imageZoom = signal(1);
  imageViewerOpen = signal(false);
  private explanationStream?: EventSource;

  accuracy = computed(() => calculateAccuracy(this.stats()));
  answered = computed(() => this.result() !== null);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadFilters();
    this.loadNextQuestion();
  }

  goToResult() {
    document.getElementById('resultPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnDestroy() {
    this.closeExplanationStream();
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.imageViewerOpen()) this.closeImageViewer();
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
    this.closeExplanationStream();
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.explanationLoading.set(false);
    this.selectedAlternative.set('');
    this.submittedAlternative.set('');
    this.writtenAnswer.set('');
    this.closeImageViewer();

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

  skipQuestion() {
    if (this.loading() || this.submitting()) return;
    this.loadNextQuestion();
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
    const normalizedWritten = this.writtenAnswer().trim().toUpperCase();
    const submittedAlternative = answerMode === 'ALTERNATIVE' ? this.selectedAlternative() : /^[A-E]$/.test(normalizedWritten) ? normalizedWritten : '';

    this.submitting.set(true);
    this.submittedAlternative.set(submittedAlternative);
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
          this.explanationLoading.set(result.explanationStatus === 'PENDING');
          if (result.explanationStatus === 'PENDING') {
            this.listenForExplanation(result.attemptId);
          }
          const nextStats = updateStats(this.stats(), {
            questionId: question.id,
            category: question.category,
            isCorrect: result.isCorrect,
          });
          this.stats.set(nextStats);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats));
          setTimeout(() => this.goToResult(), 80);
        },
        error: () => {
          this.submitting.set(false);
          this.explanationLoading.set(false);
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

  increaseImageZoom() {
    this.imageZoom.update((zoom) => Math.min(zoom + 0.25, 3));
  }

  decreaseImageZoom() {
    this.imageZoom.update((zoom) => Math.max(zoom - 0.25, 0.75));
  }

  resetImageZoom() {
    this.imageZoom.set(1);
  }

  openImageViewer() {
    this.imageViewerOpen.set(true);
  }

  closeImageViewer() {
    this.imageViewerOpen.set(false);
    this.imageZoom.set(1);
  }

  private listenForExplanation(attemptId: string) {
    this.closeExplanationStream();
    this.explanationStream = new EventSource(`/api/explanations/stream?attemptId=${encodeURIComponent(attemptId)}`);
    this.explanationStream.addEventListener('explanation.ready', (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as ExplanationReadyEvent;
      const current = this.result();
      if (!current || current.attemptId !== data.attemptId) return;

      this.result.set({
        ...current,
        explanationStatus: 'READY',
        explanation: data.explanation,
        probableError: data.probableError,
      });
      this.explanationLoading.set(false);
      this.closeExplanationStream();
    });
    this.explanationStream.onerror = () => {
      this.explanationLoading.set(false);
      this.closeExplanationStream();
    };
  }

  private closeExplanationStream() {
    this.explanationStream?.close();
    this.explanationStream = undefined;
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
