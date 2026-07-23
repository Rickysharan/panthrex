import type { ResumeData } from "@/lib/resume/types";

export type AtsScoreLevel =
  | "excellent"
  | "good"
  | "needs-improvement"
  | "poor";

export type AtsIssueSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type AtsCategoryName =
  | "keywords"
  | "skills"
  | "experience"
  | "education"
  | "formatting"
  | "contact-information"
  | "section-completeness"
  | "impact"
  | "readability";

export type AtsCategoryScore = {
  category: AtsCategoryName;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  summary: string;
};

export type AtsKeywordMatch = {
  keyword: string;
  matched: boolean;
  importance: "required" | "preferred" | "general";
  occurrencesInResume: number;
  occurrencesInJobDescription: number;
};

export type AtsSectionCheck = {
  section:
    | "personal-details"
    | "professional-summary"
    | "work-experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications";
  label: string;
  present: boolean;
  complete: boolean;
  score: number;
  recommendation: string;
};

export type AtsFormattingCheck = {
  id: string;
  title: string;
  passed: boolean;
  description: string;
  recommendation: string;
};

export type AtsIssue = {
  id: string;
  title: string;
  description: string;
  severity: AtsIssueSeverity;
  category: AtsCategoryName;
  recommendation: string;
};

export type AtsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: AtsIssueSeverity;
  category: AtsCategoryName;
  expectedImpact: string;
};

export type AtsResumeStatistics = {
  totalWords: number;
  summaryWordCount: number;
  experienceEntries: number;
  educationEntries: number;
  skillCount: number;
  projectCount: number;
  certificationCount: number;
  quantifiedBulletCount: number;
  actionVerbCount: number;
};

export type AtsScoreResult = {
  overallScore: number;
  scoreLevel: AtsScoreLevel;

  keywordScore: number;
  formattingScore: number;
  completenessScore: number;
  impactScore: number;
  readabilityScore: number;

  matchedKeywords: AtsKeywordMatch[];
  missingKeywords: AtsKeywordMatch[];

  categoryScores: AtsCategoryScore[];
  sectionChecks: AtsSectionCheck[];
  formattingChecks: AtsFormattingCheck[];

  strengths: string[];
  issues: AtsIssue[];
  recommendations: AtsRecommendation[];

  statistics: AtsResumeStatistics;

  summary: string;
};

export type AtsScoreRequest = {
  resume: ResumeData;
  jobDescription: string;
};

export type AtsScoreResponse = {
  success: true;
  result: AtsScoreResult;
};

export type AtsScoreError = {
  success: false;
  error: string;
};

export type SavedAtsScore = {
  id: string;
  resumeId?: string;
  resumeTitle: string;
  jobTitle?: string;
  company?: string;
  jobDescription: string;
  result: AtsScoreResult;
  createdAt: string;
  updatedAt: string;
};

export type SaveAtsScoreInput = {
  resumeId?: string;
  resumeTitle: string;
  jobTitle?: string;
  company?: string;
  jobDescription: string;
  result: AtsScoreResult;
};