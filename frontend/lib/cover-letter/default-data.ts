import type { CoverLetterData } from "./types";

export const defaultCoverLetterData: CoverLetterData = {
  company: {
    companyName: "",
    jobTitle: "",
    hiringManager: "",
    location: "",
    jobDescription: "",
  },

  resume: {
    resumeId: "",
    resumeTitle: "",
  },

  template: "professional",

  content: {
    introduction: "",
    body: "",
    closing: "",
  },

  generation: {
    tone: "professional",
    length: "medium",
    includeSkills: true,
    includeProjects: true,
    includeExperience: true,
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};