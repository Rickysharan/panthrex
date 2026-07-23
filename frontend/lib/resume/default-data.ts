import type {
  ResumeData,
  ResumeSectionId,
} from "./types";

export const DEFAULT_RESUME_SECTION_ORDER: ResumeSectionId[] = [
  "professional-summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

export const defaultResumeData: ResumeData = {
  title: "Untitled Resume",
  template: "professional",
  sectionOrder: [...DEFAULT_RESUME_SECTION_ORDER],
  personalDetails: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    professionalSummary: "",
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};