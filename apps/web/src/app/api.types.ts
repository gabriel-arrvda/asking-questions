export type Category = {
  name: string;
  count: number;
};

export type Exam = {
  id: string;
  code: string;
  year: number;
  semester: string;
  title: string;
};

export type QuestionAsset = {
  id: string;
  kind: string;
  path: string;
  page?: number | null;
};

export type Question = {
  id: string;
  number: number;
  category: string;
  statement: string;
  alternatives: Record<string, string>;
  correctAlternative: string;
  sourcePdfUrl?: string | null;
  assets: QuestionAsset[];
  exam: Exam;
};

export type AttemptResult = {
  attemptId: string;
  isCorrect: boolean;
  correctAlternative: string;
  explanationStatus: 'READY' | 'PENDING';
  explanation: ExplanationPayload | null;
  probableError?: string | null;
};

export type ExplanationPayload = {
    correctAnswer: string;
    steps: string[];
    wrongAlternativeNotes: Record<string, string>;
};

export type ExplanationReadyEvent = {
  attemptId: string;
  questionId: string;
  explanation: ExplanationPayload;
  probableError?: string | null;
};
