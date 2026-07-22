export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";

export type InterviewCategory =
  | "behavioral"
  | "technical"
  | "situational"
  | "company-specific"
  | "leadership"
  | "general";

export type InterviewQuestionType =
  | "short-answer"
  | "long-answer"
  | "coding"
  | "system-design"
  | "star";

export type InterviewSessionStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "abandoned";

export type InterviewAnswerRating =
  | "poor"
  | "needs-improvement"
  | "good"
  | "very-good"
  | "excellent";

export type InterviewQuestion = {
  id: string;
  question: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  type: InterviewQuestionType;
  expectedSkills: string[];
  guidance?: string;
  sampleAnswer?: string;
  createdAt: string;
};

export type InterviewAnswer = {
  id: string;
  questionId: string;
  answer: string;
  durationSeconds?: number;
  submittedAt: string;
  evaluation?: InterviewAnswerEvaluation;
};

export type InterviewAnswerEvaluation = {
  id: string;
  questionId: string;
  answerId: string;
  score: number;
  rating: InterviewAnswerRating;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  suggestedAnswer?: string;
  clarityScore: number;
  relevanceScore: number;
  structureScore: number;
  confidenceScore: number;
  technicalAccuracyScore?: number;
  createdAt: string;
};

export type InterviewSession = {
  id: string;
  title: string;
  role: string;
  company?: string;
  jobDescription?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  status: InterviewSessionStatus;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type InterviewGenerationRequest = {
  role: string;
  company?: string;
  jobDescription?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  questionCount: number;
  skills?: string[];
};

export type InterviewGenerationResponse = {
  success: boolean;
  questions: InterviewQuestion[];
  warnings?: string[];
};

export type InterviewGenerationError = {
  success: false;
  error: string;
};

export type InterviewEvaluationRequest = {
  question: InterviewQuestion;
  answer: string;
  role: string;
  company?: string;
  jobDescription?: string;
};

export type InterviewEvaluationResponse = {
  success: boolean;
  evaluation: InterviewAnswerEvaluation;
};

export type InterviewEvaluationError = {
  success: false;
  error: string;
};

export type InterviewSessionStats = {
  totalSessions: number;
  completedSessions: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  strongestCategory?: InterviewCategory;
  weakestCategory?: InterviewCategory;
};

export const INTERVIEW_DIFFICULTIES: {
  value: InterviewDifficulty;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Entry-level and foundational interview questions.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Questions requiring practical experience and deeper reasoning.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Complex questions for experienced or specialist roles.",
  },
];

export const INTERVIEW_CATEGORIES: {
  value: InterviewCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "general",
    label: "General",
    description: "Common interview questions across most roles.",
  },
  {
    value: "behavioral",
    label: "Behavioral",
    description: "Questions about past experiences, teamwork and achievements.",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Role-specific knowledge, tools and problem-solving questions.",
  },
  {
    value: "situational",
    label: "Situational",
    description: "Questions based on hypothetical workplace scenarios.",
  },
  {
    value: "company-specific",
    label: "Company Specific",
    description: "Questions tailored to a particular company and role.",
  },
  {
    value: "leadership",
    label: "Leadership",
    description: "Questions covering ownership, decisions and team management.",
  },
];

export const INTERVIEW_QUESTION_COUNTS = [5, 10, 15, 20] as const;