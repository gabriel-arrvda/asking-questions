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
  isCorrect: boolean;
  correctAlternative: string;
  explanation: {
    correctAnswer: string;
    steps: string[];
    wrongAlternativeNotes: Record<string, string>;
  };
  probableError?: string | null;
};
