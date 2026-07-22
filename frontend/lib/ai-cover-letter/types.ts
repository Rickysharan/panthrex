import type { ResumeData } from "@/lib/resume/types";

export type CoverLetterTone =
  | "professional"
  | "confident"
  | "concise"
  | "enthusiastic"
  | "technical";

export type CoverLetterLength =
  | "short"
  | "standard"
  | "detailed";

export type CoverLetterRequest = {
  resume: ResumeData;
  companyName: string;
  hiringManagerName?: string;
  jobTitle: string;
  jobDescription: string;
  tone: CoverLetterTone;
  length: CoverLetterLength;
  additionalContext?: string;
};

export type GeneratedCoverLetter = {
  id: string;
  title: string;
  companyName: string;
  hiringManagerName: string;
  jobTitle: string;
  content: string;
  tone: CoverLetterTone;
  length: CoverLetterLength;
  createdAt: string;
};

export type CoverLetterApiResponse = {
  coverLetter: GeneratedCoverLetter;
  warnings: string[];
};

export type CoverLetterApiError = {
  error: string;
  details?: string;
};