export type ResumeTemplate =
  | "professional"
  | "modern"
  | "minimal";

export type PersonalDetails = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  professionalSummary: string;
};

export type WorkExperience = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

export type Education = {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Project = {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  projectUrl: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
};

export type ResumeData = {
  title: string;
  template: ResumeTemplate;
  personalDetails: PersonalDetails;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
};