CREATE TYPE "AnswerMode" AS ENUM ('ALTERNATIVE', 'WRITTEN');

CREATE TABLE "Exam" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "semester" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detailUrl" TEXT NOT NULL,
  "examPdfUrl" TEXT,
  "answerPdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "statement" TEXT NOT NULL,
  "alternatives" JSONB NOT NULL,
  "correctAlternative" TEXT NOT NULL,
  "sourcePage" INTEGER,
  "sourcePdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnswerKey" (
  "id" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "questionNumber" INTEGER NOT NULL,
  "correctAlternative" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnswerKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionAsset" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "page" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Explanation" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "steps" JSONB NOT NULL,
  "wrongAlternativeNotes" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attempt" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "answerMode" "AnswerMode" NOT NULL,
  "selectedAlternative" TEXT,
  "writtenAnswer" TEXT,
  "normalizedAnswer" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Exam_code_key" ON "Exam"("code");
CREATE UNIQUE INDEX "Question_examId_number_key" ON "Question"("examId", "number");
CREATE INDEX "Question_category_idx" ON "Question"("category");
CREATE UNIQUE INDEX "AnswerKey_examId_questionNumber_key" ON "AnswerKey"("examId", "questionNumber");
CREATE UNIQUE INDEX "Explanation_questionId_key" ON "Explanation"("questionId");
CREATE INDEX "Attempt_questionId_idx" ON "Attempt"("questionId");

ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionAsset" ADD CONSTRAINT "QuestionAsset_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
