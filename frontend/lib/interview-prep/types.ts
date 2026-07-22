export type InterviewDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type InterviewQuestionType =
  | "behavioural"
  | "technical"
  | "situational"
  | "role-specific";

export type InterviewQuestion = {
  id: string;
  question: string;
  type: InterviewQuestionType;
  difficulty: InterviewDifficulty;
  competency: string;
  guidance: string;
};

export type InterviewAnswerFeedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  summary: string;
};

export type InterviewSessionQuestion = InterviewQuestion & {
  answer: string;
  feedback: InterviewAnswerFeedback | null;
  completed: boolean;
};

export type InterviewSession = {
  id: string;
  role: string;
  company: string;
  jobDescription: string;
  difficulty: InterviewDifficulty;
  questions: InterviewSessionQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type GenerateInterviewRequest = {
  role: string;
  company?: string;
  jobDescription?: string;
  difficulty: InterviewDifficulty;
  questionCount: number;
  resume: unknown;
};

export type GenerateInterviewResponse = {
  success: true;
  questions: InterviewQuestion[];
};

export type EvaluateInterviewAnswerRequest = {
  question: InterviewQuestion;
  answer: string;
  role: string;
  jobDescription?: string;
};

export type EvaluateInterviewAnswerResponse = {
  success: true;
  feedback: InterviewAnswerFeedback;
};

export type InterviewPrepError = {
  success: false;
  error: string;
};