import type { GeneratedCoverLetter } from "@/lib/ai-cover-letter/types";
import type { AtsScoreResult } from "@/lib/ats-score/types";
import type { JobMatchResult } from "@/lib/job-matching/types";
import type { ResumeData } from "@/lib/resume/types";
import type { ResumeTailorAnalysis } from "@/lib/resume-tailor/types";

export type ApplicationAgentStage =
  | "idle"
  | "analysing-match"
  | "tailoring-resume"
  | "scanning-ats"
  | "generating-cover-letter"
  | "completed"
  | "failed";

export type ApplicationAgentStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type ApplicationAgentStep = {
  id:
    | "job-match"
    | "resume-tailor"
    | "ats-score"
    | "cover-letter";
  label: string;
  description: string;
  status: ApplicationAgentStepStatus;
  error: string;
};

export type ApplicationAgentInput = {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  hiringManagerName?: string;
  additionalContext?: string;
  resume: ResumeData;
};

export type ApplicationAgentResult = {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  originalResume: ResumeData;
  tailoredResume: ResumeData;
  jobMatch: JobMatchResult;
  tailorAnalysis: ResumeTailorAnalysis;
  atsResult: AtsScoreResult;
  coverLetter: GeneratedCoverLetter;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationAgentErrorResponse = {
  success?: false;
  error?: string;
  details?: string;
};

export type ApplicationAgentState = {
  stage: ApplicationAgentStage;
  steps: ApplicationAgentStep[];
  result: ApplicationAgentResult | null;
  error: string;
};
