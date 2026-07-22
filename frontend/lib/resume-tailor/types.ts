import type { ResumeData } from "@/lib/resume/types";

export type ResumeTailorStatus =
  | "draft"
  | "completed";

export type KeywordMatchCategory =
  | "matched"
  | "missing"
  | "partial";

export type ResumeKeywordMatch = {
  keyword: string;
  category: KeywordMatchCategory;
  importance: "low" | "medium" | "high";
  explanation: string;
};

export type TailoredBullet = {
  id: string;
  section: "work-experience" | "projects";
  sourceItemId: string;
  original: string;
  tailored: string;
  reason: string;
  keywordsAdded: string[];
};

export type ResumeTailorAnalysis = {
  atsScore: number;
  originalScore: number;
  scoreImprovement: number;
  summary: string;
  matchedKeywords: ResumeKeywordMatch[];
  missingKeywords: ResumeKeywordMatch[];
  partialKeywords: ResumeKeywordMatch[];
  strengths: string[];
  improvements: string[];
  tailoredBullets: TailoredBullet[];
  suggestedSkills: string[];
  suggestedHeadline: string;
  suggestedSummary: string;
};

export type ResumeTailorSession = {
  id: string;
  name: string;
  targetRole: string;
  company: string;
  jobDescription: string;
  originalResume: ResumeData;
  tailoredResume: ResumeData | null;
  analysis: ResumeTailorAnalysis | null;
  status: ResumeTailorStatus;
  createdAt: string;
  updatedAt: string;
};

export type TailorResumeRequest = {
  targetRole: string;
  company?: string;
  jobDescription: string;
  resume: ResumeData;
};

export type TailorResumeResponse = {
  success: true;
  analysis: ResumeTailorAnalysis;
  tailoredResume: ResumeData;
};

export type ResumeTailorError = {
  success: false;
  error: string;
};