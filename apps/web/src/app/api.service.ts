import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AttemptResult, Category, Exam, Question } from './api.types';

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE}/categories`);
  }

  exams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${API_BASE}/exams`);
  }

  nextQuestion(filters: { category?: string; examId?: string }): Observable<Question | null> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.examId) params = params.set('examId', filters.examId);
    return this.http.get<Question | null>(`${API_BASE}/questions/next`, { params });
  }

  submitAttempt(input: {
    questionId: string;
    answerMode: 'ALTERNATIVE' | 'WRITTEN';
    selectedAlternative?: string;
    writtenAnswer?: string;
  }): Observable<AttemptResult> {
    return this.http.post<AttemptResult>(`${API_BASE}/attempts`, input);
  }
}
