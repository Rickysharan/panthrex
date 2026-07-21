import type { ResumeData } from "@/lib/resume/types";

export type AiResumeSection =
  | "professional-summary"
  | "work-experience"
  | "project-description"
  | "skills";

export type AiWritingTone =
  | "professional"
  | "confident"
  | "concise"
  | "technical"
  | "leadership";

export type AiExperienceLevel =
  | "student"
  | "entry-level"
  | "mid-level"
  | "senior"
  | "executive";

export type AiResumeWriterMode =
  | "generate"
  | "improve"
  | "tailor";

export type AiResumeWriterRequest = {
  mode: AiResumeWriterMode;
  section: AiResumeSection;
  tone: AiWritingTone;
  experienceLevel: AiExperienceLevel;
  targetRole: string;
  jobDescription: string;
  existingContent: string;
  additionalContext: string;
  resumeData: ResumeData;
};

export type AiResumeSuggestion = {
  id: string;
  content: string;
};

export type AiResumeWriterResponse = {
  suggestions: AiResumeSuggestion[];
};

export type AiResumeWriterErrorResponse = {
  error: string;
  details?: string;
};
