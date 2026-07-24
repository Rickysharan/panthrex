"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  JobApplication,
  JobApplicationStatus,
} from "@/lib/job-tracker/types";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";
import { useJobMatching } from "@/lib/job-matching/useJobMatching";
import { useAtsScoreHistory } from "@/lib/ats-score/useAtsScoreHistory";
import { useResumeTailor } from "@/lib/resume-tailor/useResumeTailor";
import { useInterviewPrep } from "@/lib/interview-prep/useInterviewPrep";
import { createClient } from "@/lib/supabase/client";

export type DashboardUserProfile = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
};

export type DashboardMetric = {
  value: number;
  change: number;
};

export type DashboardActivityPoint = {
  label: string;
  month: number;
  year: number;
  applications: number;
};

export type DashboardNotificationType =
  | "application"
  | "interview"
  | "offer"
  | "ats"
  | "match"
  | "warning";

export type DashboardNotification = {
  id: string;
  type: DashboardNotificationType;
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

export type DashboardTaskType =
  | "interview"
  | "follow-up"
  | "ats"
  | "application";

export type DashboardTask = {
  id: string;
  type: DashboardTaskType;
  title: string;
  description: string;
  href: string;
  dueAt: string | null;
};

const fallbackProfile: DashboardUserProfile = {
  fullName: "Panthrex User",
  firstName: "there",
  email: "",
  initial: "P",
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function buildProfile(
  fullNameValue: unknown,
  emailValue: string | undefined,
): DashboardUserProfile {
  const email = emailValue?.trim() ?? "";

  const metadataName =
    typeof fullNameValue === "string"
      ? fullNameValue.trim()
      : "";

  const emailName = email ? email.split("@")[0] : "";

  const fullName =
    metadataName ||
    emailName ||
    fallbackProfile.fullName;

  const firstName =
    fullName.split(/\s+/)[0] ||
    fallbackProfile.firstName;

  const initial =
    fullName.charAt(0).toUpperCase() ||
    fallbackProfile.initial;

  return {
    fullName,
    firstName,
    email,
    initial,
  };
}

function parseDate(value: string): Date | null {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function getApplicationDate(
  application: JobApplication,
): Date {
  return (
    parseDate(application.appliedDate) ??
    parseDate(application.createdAt) ??
    new Date(0)
  );
}

function getMonthsAgoDate(
  monthsAgo: number,
): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    1,
  );
}

function isSameMonth(
  first: Date,
  second: Date,
): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

function countApplicationsByStatus(
  applications: JobApplication[],
  status: JobApplicationStatus,
): number {
  return applications.filter(
    (application) =>
      application.status === status,
  ).length;
}

function getPercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(
    ((current - previous) / previous) * 100,
  );
}

function getProfileStrength({
  applicationCount,
  interviewCount,
  offerCount,
  atsScore,
  savedMatchCount,
}: {
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
  atsScore: number;
  savedMatchCount: number;
}): number {
  const applicationScore = Math.min(
    25,
    applicationCount * 2.5,
  );

  const interviewScore = Math.min(
    20,
    interviewCount * 5,
  );

  const offerScore = Math.min(
    15,
    offerCount * 15,
  );

  const atsContribution =
    Math.min(100, Math.max(0, atsScore)) * 0.3;

  const matchingScore = Math.min(
    10,
    savedMatchCount * 2,
  );

  return Math.round(
    Math.min(
      100,
      applicationScore +
        interviewScore +
        offerScore +
        atsContribution +
        matchingScore,
    ),
  );
}

function sortApplications(
  applications: JobApplication[],
): JobApplication[] {
  return [...applications].sort(
    (first, second) =>
      getApplicationDate(second).getTime() -
      getApplicationDate(first).getTime(),
  );
}

function createNotifications({
  applications,
  latestAtsScore,
  latestAtsDate,
  savedMatchCount,
  bestMatchScore,
}: {
  applications: JobApplication[];
  latestAtsScore: number;
  latestAtsDate: string | null;
  savedMatchCount: number;
  bestMatchScore: number;
}): DashboardNotification[] {
  const notifications: DashboardNotification[] =
    [];

  const sortedApplications =
    sortApplications(applications);

  const upcomingInterviews = sortedApplications
    .filter(
      (application) =>
        application.status === "interview" &&
        Boolean(parseDate(application.interviewDate)),
    )
    .slice(0, 3);

  for (const application of upcomingInterviews) {
    const interviewDate =
      parseDate(application.interviewDate);

    if (!interviewDate) {
      continue;
    }

    notifications.push({
      id: `interview-${application.id}`,
      type: "interview",
      title: `Interview with ${application.companyName}`,
      description: `${application.jobTitle} · ${dateFormatter.format(interviewDate)}`,
      href: "/job-tracker",
      createdAt: application.updatedAt,
    });
  }

  const latestOffer = sortedApplications.find(
    (application) =>
      application.status === "offer",
  );

  if (latestOffer) {
    notifications.push({
      id: `offer-${latestOffer.id}`,
      type: "offer",
      title: `Offer from ${latestOffer.companyName}`,
      description: latestOffer.jobTitle,
      href: "/job-tracker",
      createdAt: latestOffer.updatedAt,
    });
  }

  const latestApplication = sortedApplications.find(
    (application) =>
      application.status !== "wishlist",
  );

  if (latestApplication) {
    notifications.push({
      id: `application-${latestApplication.id}`,
      type: "application",
      title: `Application updated`,
      description: `${latestApplication.companyName} · ${latestApplication.jobTitle}`,
      href: "/job-tracker",
      createdAt: latestApplication.updatedAt,
    });
  }

  if (latestAtsDate) {
    notifications.push({
      id: "latest-ats-analysis",
      type: latestAtsScore >= 70 ? "ats" : "warning",
      title: `Latest ATS score: ${latestAtsScore}%`,
      description:
        latestAtsScore >= 70
          ? "Your resume is performing well."
          : "Your resume has improvement opportunities.",
      href: "/ats-score",
      createdAt: latestAtsDate,
    });
  }

  if (savedMatchCount > 0) {
    notifications.push({
      id: "job-match-summary",
      type: "match",
      title: `${savedMatchCount} saved job ${
        savedMatchCount === 1 ? "match" : "matches"
      }`,
      description:
        bestMatchScore > 0
          ? `Best match score: ${bestMatchScore}%`
          : "Review your saved job matches.",
      href: "/job-matching",
      createdAt: new Date().toISOString(),
    });
  }

  return notifications
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 8);
}

function createUpcomingTasks(
  applications: JobApplication[],
  latestAtsScore: number,
): DashboardTask[] {
  const tasks: DashboardTask[] = [];

  const sortedApplications =
    sortApplications(applications);

  const interviewApplications =
    sortedApplications
      .filter(
        (application) =>
          application.status === "interview",
      )
      .slice(0, 3);

  for (const application of interviewApplications) {
    tasks.push({
      id: `prepare-${application.id}`,
      type: "interview",
      title: `Prepare for ${application.companyName}`,
      description: application.jobTitle,
      href: "/interview-prep",
      dueAt:
        parseDate(application.interviewDate)?.toISOString() ??
        null,
    });
  }

  const followUpApplications =
    sortedApplications
      .filter(
        (application) =>
          application.status === "applied" ||
          application.status === "assessment",
      )
      .slice(0, 2);

  for (const application of followUpApplications) {
    tasks.push({
      id: `follow-up-${application.id}`,
      type: "follow-up",
      title: `Follow up with ${application.companyName}`,
      description: application.jobTitle,
      href: "/job-tracker",
      dueAt: null,
    });
  }

  if (latestAtsScore > 0 && latestAtsScore < 70) {
    tasks.push({
      id: "improve-ats-score",
      type: "ats",
      title: "Improve your ATS score",
      description: `Current score: ${latestAtsScore}%`,
      href: "/ats-score",
      dueAt: null,
    });
  }

  if (applications.length === 0) {
    tasks.push({
      id: "add-first-application",
      type: "application",
      title: "Add your first application",
      description:
        "Start tracking your job-search pipeline.",
      href: "/job-tracker",
      dueAt: null,
    });
  }

  return tasks.slice(0, 5);
}

export function useDashboardData() {
  const [profile, setProfile] =
    useState<DashboardUserProfile>(
      fallbackProfile,
    );

  const [isProfileLoading, setIsProfileLoading] =
    useState(true);

  const {
    applications,
    stats,
    isLoaded: isJobTrackerLoaded,
  } = useJobTracker();

  const {
    savedAnalyses,
    averageScore: averageAtsScore,
    bestAnalysis,
    mostRecentAnalysis,
    isHydrated: isAtsHistoryLoaded,
    error: atsHistoryError,
  } = useAtsScoreHistory();

  const {
    savedMatches,
    averageScore: averageMatchScore,
    bestMatch,
    isLoaded: isJobMatchingLoaded,
  } = useJobMatching();

  const {
    sessions: tailorSessions,
  } = useResumeTailor();

  const {
    sessions: interviewSessions,
    isLoaded: isInterviewLoaded,
  } = useInterviewPrep();

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadProfile(): Promise<void> {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (user) {
        setProfile(
          buildProfile(
            user.user_metadata?.full_name,
            user.email,
          ),
        );
      }

      setIsProfileLoading(false);
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        const user = session?.user;

        if (!user) {
          setProfile(fallbackProfile);
          return;
        }

        setProfile(
          buildProfile(
            user.user_metadata?.full_name,
            user.email,
          ),
        );
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const latestAtsScore =
    mostRecentAnalysis?.result.overallScore ?? 0;

  const bestAtsScore =
    bestAnalysis?.result.overallScore ?? 0;

  const bestMatchScore =
    bestMatch?.result.overallScore ?? 0;

  const interviewFeedbackScores =
    interviewSessions.flatMap((session) =>
      session.questions
        .map((question) => question.feedback?.score)
        .filter(
          (score): score is number =>
            typeof score === "number",
        ),
    );

  const averageInterviewScore =
    interviewFeedbackScores.length === 0
      ? 0
      : Math.round(
          interviewFeedbackScores.reduce(
            (total, score) => total + score,
            0,
          ) / interviewFeedbackScores.length,
        );

  const bestInterviewScore =
    interviewFeedbackScores.length === 0
      ? 0
      : Math.max(...interviewFeedbackScores);

  const completedInterviewQuestions =
    interviewSessions.reduce(
      (total, session) =>
        total +
        session.questions.filter(
          (question) => question.completed,
        ).length,
      0,
    );

  const recentApplications = useMemo(
    () => sortApplications(applications).slice(0, 5),
    [applications],
  );

  const applicationActivity = useMemo<
    DashboardActivityPoint[]
  >(() => {
    return Array.from(
      { length: 6 },
      (_, index) => getMonthsAgoDate(5 - index),
    ).map((monthDate) => {
      const applicationCount =
        applications.filter((application) =>
          isSameMonth(
            getApplicationDate(application),
            monthDate,
          ),
        ).length;

      return {
        label: monthFormatter.format(monthDate),
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        applications: applicationCount,
      };
    });
  }, [applications]);

  const currentMonthApplications =
    applicationActivity.at(-1)?.applications ?? 0;

  const previousMonthApplications =
    applicationActivity.at(-2)?.applications ?? 0;

  const applicationChange =
    getPercentageChange(
      currentMonthApplications,
      previousMonthApplications,
    );

  const interviewCount =
    countApplicationsByStatus(
      applications,
      "interview",
    );

  const offerCount =
    countApplicationsByStatus(
      applications,
      "offer",
    );

  const activeApplicationCount =
    applications.filter(
      (application) =>
        application.status !== "wishlist" &&
        application.status !== "rejected",
    ).length;

  const interviewRate =
    activeApplicationCount > 0
      ? Math.round(
          (interviewCount /
            activeApplicationCount) *
            100,
        )
      : 0;

  const offerRate =
    interviewCount > 0
      ? Math.round(
          (offerCount / interviewCount) *
            100,
        )
      : 0;

  const profileStrength = getProfileStrength({
    applicationCount: stats.total,
    interviewCount,
    offerCount,
    atsScore: latestAtsScore,
    savedMatchCount: savedMatches.length,
  });

  const notifications = useMemo(
    () =>
      createNotifications({
        applications,
        latestAtsScore,
        latestAtsDate:
          mostRecentAnalysis?.createdAt ?? null,
        savedMatchCount: savedMatches.length,
        bestMatchScore,
      }),
    [
      applications,
      bestMatchScore,
      latestAtsScore,
      mostRecentAnalysis?.createdAt,
      savedMatches.length,
    ],
  );

  const upcomingTasks = useMemo(
    () =>
      createUpcomingTasks(
        applications,
        latestAtsScore,
      ),
    [applications, latestAtsScore],
  );

  const isLoading =
    isProfileLoading ||
    !isJobTrackerLoaded ||
    !isAtsHistoryLoaded ||
    !isJobMatchingLoaded ||
    !isInterviewLoaded;

  return {
    profile,
    applications,
    recentApplications,
    applicationActivity,
    notifications,
    upcomingTasks,

    metrics: {
      applications: {
        value: stats.total,
        change: applicationChange,
      },
      interviews: {
        value: interviewCount,
        change: interviewRate,
      },
      offers: {
        value: offerCount,
        change: offerRate,
      },
      atsScore: {
        value: latestAtsScore,
        change:
          latestAtsScore - averageAtsScore,
      },
      jobMatches: {
        value: savedMatches.length,
        change: Math.round(averageMatchScore),
      },
    },

    stats,
    latestAtsScore,
    averageAtsScore,
    bestAtsScore,
    savedAtsAnalysisCount:
      savedAnalyses.length,

    averageMatchScore,
    bestMatchScore,
    savedMatchCount: savedMatches.length,

    tailoredResumeCount:
      tailorSessions.length,

    interviewSessionCount:
      interviewSessions.length,

    completedInterviewQuestions,

    averageInterviewScore,

    bestInterviewScore,

    profileStrength,
    interviewRate,
    offerRate,

    isLoading,
    atsHistoryError,
  };
}
