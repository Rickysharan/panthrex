export type CoverLetterTemplate =
  | "professional"
  | "modern"
  | "minimal";

export type CoverLetterTone =
  | "professional"
  | "confident"
  | "friendly"
  | "concise";

export type CoverLetterLength =
  | "short"
  | "medium"
  | "long";

export type ExportFormat = "pdf" | "docx";

export interface CompanyDetails {
  companyName: string;
  jobTitle: string;
  hiringManager: string;
  location: string;
  jobDescription: string;
}

export interface ResumeReference {
  resumeId: string;
  resumeTitle: string;
}

export interface CoverLetterContent {
  introduction: string;
  body: string;
  closing: string;
}

export interface GenerationOptions {
  tone: CoverLetterTone;
  length: CoverLetterLength;
  includeSkills: boolean;
  includeProjects: boolean;
  includeExperience: boolean;
}

export interface CoverLetterData {
  company: CompanyDetails;
  resume: ResumeReference;
  template: CoverLetterTemplate;
  content: CoverLetterContent;
  generation: GenerationOptions;
  createdAt: string;
  updatedAt: string;
}