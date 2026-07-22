export type ThemePreference =
  | "system"
  | "dark"
  | "light";

export type JobWorkplacePreference =
  | "remote"
  | "hybrid"
  | "onsite";

export type EmploymentTypePreference =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "temporary";

export type ExperienceLevelPreference =
  | "internship"
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead";

export type SalaryPeriod =
  | "year"
  | "month"
  | "day"
  | "hour";

export type SalaryCurrency =
  | "GBP"
  | "EUR"
  | "USD"
  | "INR";

export type AiWritingTone =
  | "professional"
  | "confident"
  | "concise"
  | "friendly"
  | "technical";

export type AiResponseLength =
  | "short"
  | "balanced"
  | "detailed";

export type ResumeTemplatePreference =
  | "modern"
  | "professional"
  | "minimal"
  | "executive";

export type NotificationPreferences = {
  emailJobMatches: boolean;
  emailApplicationReminders: boolean;
  emailInterviewReminders: boolean;
  emailProductUpdates: boolean;
  browserNotifications: boolean;
  weeklyCareerSummary: boolean;
};

export type AiPreferences = {
  writingTone: AiWritingTone;
  responseLength: AiResponseLength;
  useBritishEnglish: boolean;
  includeQuantifiedAchievements: boolean;
  prioritiseAtsKeywords: boolean;
  avoidGenericPhrases: boolean;
};

export type ResumePreferences = {
  defaultTemplate: ResumeTemplatePreference;
  defaultFileName: string;
  includePhoto: boolean;
  includeLinkedIn: boolean;
  includeGitHub: boolean;
  includePortfolio: boolean;
  showReferences: boolean;
};

export type JobPreferences = {
  preferredJobTitles: string[];
  preferredLocations: string[];
  workplaceTypes: JobWorkplacePreference[];
  employmentTypes: EmploymentTypePreference[];
  experienceLevels: ExperienceLevelPreference[];
  minimumSalary: number | null;
  salaryCurrency: SalaryCurrency;
  salaryPeriod: SalaryPeriod;
  requiresVisaSponsorship: boolean;
  excludeJobsWithoutSalary: boolean;
  excludeRecruitmentAgencies: boolean;
};

export type ProfileSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  profileImageUrl: string;
};

export type AppearanceSettings = {
  theme: ThemePreference;
  compactNavigation: boolean;
  reduceMotion: boolean;
};

export type AccountSettings = {
  profile: ProfileSettings;
  appearance: AppearanceSettings;
  notifications: NotificationPreferences;
  ai: AiPreferences;
  resume: ResumePreferences;
  jobs: JobPreferences;
  updatedAt: string;
};

export type SettingsSectionId =
  | "profile"
  | "appearance"
  | "notifications"
  | "ai"
  | "resume"
  | "jobs"
  | "account";

export type SettingsSaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error";

export type SettingsState = {
  settings: AccountSettings;
  isLoaded: boolean;
  saveStatus: SettingsSaveStatus;
  error: string | null;
};

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  profile: {
    firstName: "Ricky",
    lastName: "Sharan",
    email: "",
    phone: "",
    headline:
      "MSc Artificial Intelligence and Data Science student",
    location: "London, United Kingdom",
    linkedInUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    profileImageUrl: "",
  },

  appearance: {
    theme: "dark",
    compactNavigation: false,
    reduceMotion: false,
  },

  notifications: {
    emailJobMatches: true,
    emailApplicationReminders: true,
    emailInterviewReminders: true,
    emailProductUpdates: false,
    browserNotifications: true,
    weeklyCareerSummary: true,
  },

  ai: {
    writingTone: "professional",
    responseLength: "balanced",
    useBritishEnglish: true,
    includeQuantifiedAchievements: true,
    prioritiseAtsKeywords: true,
    avoidGenericPhrases: true,
  },

  resume: {
    defaultTemplate: "professional",
    defaultFileName: "Ricky-Sharan-CV",
    includePhoto: false,
    includeLinkedIn: true,
    includeGitHub: true,
    includePortfolio: true,
    showReferences: false,
  },

  jobs: {
    preferredJobTitles: [
      "Fraud Analyst",
      "AML Analyst",
      "Data Analyst",
      "Machine Learning Engineer",
      "Software Engineer",
    ],
    preferredLocations: [
      "London",
      "United Kingdom",
      "Remote",
    ],
    workplaceTypes: [
      "remote",
      "hybrid",
      "onsite",
    ],
    employmentTypes: [
      "full-time",
      "internship",
    ],
    experienceLevels: [
      "entry",
      "junior",
    ],
    minimumSalary: 30000,
    salaryCurrency: "GBP",
    salaryPeriod: "year",
    requiresVisaSponsorship: true,
    excludeJobsWithoutSalary: false,
    excludeRecruitmentAgencies: false,
  },

  updatedAt: new Date(0).toISOString(),
};