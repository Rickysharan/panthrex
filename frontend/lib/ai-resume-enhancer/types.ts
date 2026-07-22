import type { ResumeData } from "@/lib/resume/types";

export type ResumeEnhancementSection =
  | "professionalSummary"
  | "workExperience"
  | "projects"
  | "skills";

export type ResumeEnhancementStatus =
  | "pending"
  | "accepted"
  | "rejected";

export type ResumeEnhancementSuggestion = {
  id: string;
  section: ResumeEnhancementSection;
  itemId?: string;
  field: string;
  originalValue: string;
  improvedValue: string;
  explanation: string;
  status: ResumeEnhancementStatus;
};

export type ResumeEnhancementRequest = {
  resume: ResumeData;
  targetRole?: string;
  jobDescription?: string;
};

export type ResumeEnhancementResponse = {
  suggestions: ResumeEnhancementSuggestion[];
  targetRole: string;
  warnings: string[];
};

export type ResumeEnhancementApiError = {
  error: string;
  details?: string;
};