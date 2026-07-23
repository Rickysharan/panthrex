export type JobApplicationStatus =
  | "wishlist"
  | "applied"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected";

export type JobApplicationPriority =
  | "low"
  | "medium"
  | "high";

export type JobApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  jobUrl: string;
  salary: string;
  jobDescription?: string;
  status: JobApplicationStatus;
  priority: JobApplicationPriority;
  appliedDate: string;
  interviewDate: string;
  recruiterName: string;
  recruiterEmail: string;
  resumeId: string;
  coverLetterId: string;

  atsAnalysisId?: string;
  interviewSessionId?: string;

  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateJobApplicationInput = Omit<
  JobApplication,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateJobApplicationInput =
  Partial<CreateJobApplicationInput>;

export type JobApplicationStats = {
  total: number;
  wishlist: number;
  applied: number;
  assessment: number;
  interview: number;
  offer: number;
  rejected: number;
};

export type JobTrackerState = {
  applications: JobApplication[];
  selectedApplicationId: string | null;
  searchQuery: string;
  statusFilter: JobApplicationStatus | "all";
};

export const JOB_APPLICATION_STATUSES: Array<{
  value: JobApplicationStatus;
  label: string;
}> = [
  {
    value: "wishlist",
    label: "Wishlist",
  },
  {
    value: "applied",
    label: "Applied",
  },
  {
    value: "assessment",
    label: "Assessment",
  },
  {
    value: "interview",
    label: "Interview",
  },
  {
    value: "offer",
    label: "Offer",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

export const JOB_APPLICATION_PRIORITIES: Array<{
  value: JobApplicationPriority;
  label: string;
}> = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];