export type JobMatchSkill = {
  name: string;
  matched: boolean;
  importance: "required" | "preferred";
};

export type JobMatchSuggestion = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

export type JobMatchCategoryScore = {
  name: string;
  score: number;
};

export type JobMatchResult = {
  overallScore: number;
  atsScore: number;
  interviewReadiness: number;

  matchedSkills: JobMatchSkill[];
  missingSkills: JobMatchSkill[];

  strengths: string[];
  weaknesses: string[];

  keywordSuggestions: string[];
  resumeImprovements: JobMatchSuggestion[];

  categoryScores: JobMatchCategoryScore[];

  summary: string;
};

export type JobMatchRequest = {
  resume: unknown;
  jobDescription: string;
};

export type JobMatchResponse = {
  success: true;
  result: JobMatchResult;
};

export type JobMatchError = {
  success: false;
  error: string;
};