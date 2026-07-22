import type {
  CreateJobApplicationInput,
  JobApplicationPriority,
} from "@/lib/job-tracker/types";

import type {
  JobSalary,
  JobSearchResult,
  SponsorshipStatus,
} from "./types";

export function toJobApplication(
  job: JobSearchResult,
): CreateJobApplicationInput {
  return {
    companyName: job.company,
    jobTitle: job.title,
    location: job.location,
    jobUrl: job.applicationUrl,
    salary: formatJobSalary(job.salary),
    status: "wishlist",
    priority: getPriorityFromMatchScore(job.matchScore),
    appliedDate: "",
    interviewDate: "",
    recruiterName: "",
    recruiterEmail: "",
    resumeId: "",
    coverLetterId: "",
    notes: createTrackerNotes(job),
  };
}

function formatJobSalary(
  salary: JobSalary | null,
): string {
  if (!salary) {
    return "";
  }

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: salary.currency || "GBP",
    maximumFractionDigits: 0,
  });

  const minimum =
    salary.minimum !== null
      ? formatter.format(salary.minimum)
      : null;

  const maximum =
    salary.maximum !== null
      ? formatter.format(salary.maximum)
      : null;

  const periodLabel = getSalaryPeriodLabel(
    salary.period,
  );

  if (minimum && maximum) {
    return `${minimum} – ${maximum} ${periodLabel}`;
  }

  if (minimum) {
    return `From ${minimum} ${periodLabel}`;
  }

  if (maximum) {
    return `Up to ${maximum} ${periodLabel}`;
  }

  return "";
}

function getSalaryPeriodLabel(
  period: JobSalary["period"],
): string {
  switch (period) {
    case "hour":
      return "per hour";

    case "day":
      return "per day";

    case "week":
      return "per week";

    case "month":
      return "per month";

    case "year":
      return "per year";

    default:
      return "";
  }
}

function getPriorityFromMatchScore(
  matchScore: number | null,
): JobApplicationPriority {
  if (matchScore === null) {
    return "medium";
  }

  if (matchScore >= 85) {
    return "high";
  }

  if (matchScore >= 65) {
    return "medium";
  }

  return "low";
}

function createTrackerNotes(
  job: JobSearchResult,
): string {
  const sections: string[] = [];

  sections.push(`Imported from ${job.sourceLabel}.`);

  if (job.matchScore !== null) {
    sections.push(
      `Panthrex AI match score: ${job.matchScore}%.`,
    );
  }

  sections.push(
    `Visa sponsorship: ${getSponsorshipLabel(
      job.sponsorshipStatus,
    )}.`,
  );

  if (job.sponsorshipEvidence) {
    sections.push(
      `Sponsorship evidence: ${job.sponsorshipEvidence}`,
    );
  }

  if (job.matchReasons.length > 0) {
    sections.push(
      `Why this role matches: ${job.matchReasons.join(
        "; ",
      )}.`,
    );
  }

  if (job.missingSkills.length > 0) {
    sections.push(
      `Potential skill gaps: ${job.missingSkills.join(
        "; ",
      )}.`,
    );
  }

  return sections.join("\n\n");
}

function getSponsorshipLabel(
  status: SponsorshipStatus,
): string {
  switch (status) {
    case "available":
      return "available";

    case "possible":
      return "possible";

    case "not-available":
      return "not available";

    case "unknown":
    default:
      return "unknown";
  }
}