import type { ResumeData } from "./types";

export const defaultResumeData: ResumeData = {
  title: "Untitled Resume",
  template: "professional",
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