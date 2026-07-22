import type {
  InterviewAnswer,
  InterviewAnswerEvaluation,
  InterviewCategory,
  InterviewDifficulty,
  InterviewQuestion,
  InterviewSession,
} from "@/lib/interview/types";

type CreateInterviewSessionInput = {
  role: string;
  company?: string;
  jobDescription?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  questions: InterviewQuestion[];
};

type CreateInterviewAnswerInput = {
  questionId: string;
  answer: string;
  evaluation?: InterviewAnswerEvaluation;
  durationSeconds?: number;
};

function createId(): string {
  return crypto.randomUUID();
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function buildSessionTitle(
  role: string,
  company?: string,
): string {
  const normalizedRole = role.trim();
  const normalizedCompany = company?.trim();

  if (normalizedCompany) {
    return `${normalizedRole} interview at ${normalizedCompany}`;
  }

  return `${normalizedRole} interview`;
}

export function createInterviewSession(
  input: CreateInterviewSessionInput,
): InterviewSession {
  const timestamp = createTimestamp();

  return {
    id: createId(),
    title: buildSessionTitle(
      input.role,
      input.company,
    ),
    role: input.role.trim(),
    company: input.company?.trim() || undefined,
    jobDescription:
      input.jobDescription?.trim() || undefined,
    category: input.category,
    difficulty: input.difficulty,
    status: "not-started",
    questions: input.questions,
    answers: [],
    currentQuestionIndex: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createInterviewAnswer(
  input: CreateInterviewAnswerInput,
): InterviewAnswer {
  const timestamp = createTimestamp();

  const evaluation = input.evaluation
    ? {
        ...input.evaluation,
      }
    : undefined;

  return {
    id: evaluation?.answerId || createId(),
    questionId: input.questionId,
    answer: input.answer.trim(),
    durationSeconds:
      input.durationSeconds !== undefined
        ? Math.max(
            0,
            Math.round(input.durationSeconds),
          )
        : undefined,
    submittedAt: timestamp,
    evaluation,
  };
}

export function replaceSessionAnswer(
  answers: InterviewAnswer[],
  nextAnswer: InterviewAnswer,
): InterviewAnswer[] {
  const existingAnswerIndex = answers.findIndex(
    (answer) =>
      answer.questionId === nextAnswer.questionId,
  );

  if (existingAnswerIndex === -1) {
    return [...answers, nextAnswer];
  }

  return answers.map((answer, index) =>
    index === existingAnswerIndex
      ? nextAnswer
      : answer,
  );
}

export function calculateSessionProgress(
  session: InterviewSession,
): number {
  if (session.questions.length === 0) {
    return 0;
  }

  const answeredQuestionIds = new Set(
    session.answers
      .filter((answer) => answer.answer.trim())
      .map((answer) => answer.questionId),
  );

  const progress =
    (answeredQuestionIds.size /
      session.questions.length) *
    100;

  return Math.min(
    100,
    Math.max(0, Math.round(progress)),
  );
}

export function calculateSessionAverageScore(
  session: InterviewSession,
): number {
  const evaluatedAnswers = session.answers.filter(
    (
      answer,
    ): answer is InterviewAnswer & {
      evaluation: InterviewAnswerEvaluation;
    } => Boolean(answer.evaluation),
  );

  if (evaluatedAnswers.length === 0) {
    return 0;
  }

  const scoreTotal = evaluatedAnswers.reduce(
    (total, answer) =>
      total + answer.evaluation.score,
    0,
  );

  return Number(
    (
      scoreTotal / evaluatedAnswers.length
    ).toFixed(1),
  );
}

export function deriveSessionStatus(
  session: InterviewSession,
): InterviewSession["status"] {
  if (session.answers.length === 0) {
    return "not-started";
  }

  const answeredQuestionIds = new Set(
    session.answers
      .filter((answer) => answer.answer.trim())
      .map((answer) => answer.questionId),
  );

  const allQuestionsAnswered =
    session.questions.length > 0 &&
    session.questions.every((question) =>
      answeredQuestionIds.has(question.id),
    );

  return allQuestionsAnswered
    ? "completed"
    : "in-progress";
}