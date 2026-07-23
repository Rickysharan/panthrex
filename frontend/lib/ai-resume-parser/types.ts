import type { ResumeData } from "@/lib/resume/types";

export type AiParsedResumeData = Omit<
  ResumeData,
  "title" | "template" | "sectionOrder"
>;

export type AiResumeParserRequest = {
  resumeText: string;
};

export type AiResumeParserResponse = {
  resume: AiParsedResumeData;
  warnings: string[];
};

export type AiResumeParserErrorResponse = {
  error: string;
  details?: string;
};

export type RawParsedPersonalDetails = {
  fullName?: unknown;
  jobTitle?: unknown;
  email?: unknown;
  phone?: unknown;
  location?: unknown;
  website?: unknown;
  linkedin?: unknown;
  github?: unknown;
  professionalSummary?: unknown;
};

export type RawParsedWorkExperience = {
  company?: unknown;
  position?: unknown;
  location?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  isCurrent?: unknown;
  description?: unknown;
};

export type RawParsedEducation = {
  institution?: unknown;
  qualification?: unknown;
  fieldOfStudy?: unknown;
  location?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  description?: unknown;
};

export type RawParsedProject = {
  name?: unknown;
  role?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  projectUrl?: unknown;
  description?: unknown;
};

export type RawParsedCertification = {
  name?: unknown;
  issuer?: unknown;
  issueDate?: unknown;
  credentialId?: unknown;
  credentialUrl?: unknown;
};

export type RawAiParsedResume = {
  personalDetails?: RawParsedPersonalDetails;
  workExperience?: RawParsedWorkExperience[];
  education?: RawParsedEducation[];
  skills?: unknown[];
  projects?: RawParsedProject[];
  certifications?: RawParsedCertification[];
  warnings?: unknown[];
};