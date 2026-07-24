"use client";

import AppLayout from "@/components/layout/AppLayout";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  WandSparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import type {
  DashboardNotification,
  DashboardTask,
} from "@/lib/dashboard/useDashboardData";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import type {
  JobApplication,
  JobApplicationStatus,
} from "@/lib/job-tracker/types";

const statusLabels: Record<JobApplicationStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const statusStyles: Record<JobApplicationStatus, string> = {
  wishlist: "bg-white/[0.07] text-white/55",
  applied: "bg-blue-400/10 text-blue-300",
  assessment: "bg-amber-400/10 text-amber-300",
  interview: "bg-violet-400/10 text-violet-300",
  offer: "bg-emerald-400/10 text-emerald-300",
  rejected: "bg-rose-400/10 text-rose-300",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null | undefined): string {
  const date = parseDate(value);

  return date ? dateFormatter.format(date) : "Not specified";
}

function formatTaskDueDate(value: string | null): string {
  const date = parseDate(value);

  if (!date) {
    return "No deadline set";
  }

  return dateTimeFormatter.format(date);
}

function getApplicationDate(application: JobApplication): string {
  return application.appliedDate || application.createdAt;
}

function getStrengthLabel(value: number): string {
  if (value >= 80) {
    return "Strong profile";
  }

  if (value >= 60) {
    return "Good progress";
  }

  if (value >= 40) {
    return "Building momentum";
  }

  return "Getting started";
}

function getMetricChange(
  value: number,
  unit: "percent" | "points" | "count",
): string {
  if (unit === "percent") {
    if (value > 0) {
      return `+${value}% vs last month`;
    }

    if (value < 0) {
      return `${value}% vs last month`;
    }

    return "No monthly change";
  }

  if (unit === "points") {
    if (value > 0) {
      return `+${value} vs average`;
    }

    if (value < 0) {
      return `${value} vs average`;
    }

    return "Matches your average";
  }

  return `${value}% average match`;
}

export default function DashboardPage() {
  const {
    profile,
    recentApplications,
    applicationActivity,
    notifications,
    upcomingTasks,
    metrics,
    latestAtsScore,
    bestAtsScore,
    averageAtsScore,
    savedAtsAnalysisCount,
    bestMatchScore,
    tailoredResumeCount,
    interviewSessionCount,
    completedInterviewQuestions,
    averageInterviewScore,
    bestInterviewScore,
    profileStrength,
    interviewRate,
    offerRate,
    isLoading,
    atsHistoryError,
  } = useDashboardData();

  const maximumActivity = Math.max(
    1,
    ...applicationActivity.map(
      (point) => point.applications,
    ),
  );

  return (
    <AppLayout
      title="Dashboard"
      description="Track applications, improve your resume and prepare for interviews."
    >
      <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-160px] top-[-150px] h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-[-180px] right-[-140px] h-[440px] w-[440px] rounded-full bg-blue-500/10 blur-[150px]"
        />

        <div className="relative z-10">
        <div className="px-5 py-8 sm:px-8 lg:px-10">
          <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                Career command centre
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {isLoading
                  ? "Loading your dashboard..."
                  : `Welcome back, ${profile.firstName}.`}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/45">
                Track applications, strengthen your CV and
                prepare for every interview from one focused
                workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/job-tracker"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <BriefcaseBusiness size={18} />
                Add application
              </Link>

              <Link
                href="/ats-score"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
              >
                <WandSparkles size={18} />
                Optimise CV
              </Link>
            </div>
          </section>

          {atsHistoryError ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4 text-sm text-amber-200">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  ATS history could not be loaded
                </p>

                <p className="mt-1 text-amber-100/60">
                  {atsHistoryError}
                </p>
              </div>
            </div>
          ) : null}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
            <MetricCard
              title="Applications"
              value={metrics.applications.value.toString()}
              change={getMetricChange(
                metrics.applications.change,
                "percent",
              )}
              icon={BriefcaseBusiness}
              href="/job-tracker"
            />

            <MetricCard
              title="Interviews"
              value={metrics.interviews.value.toString()}
              change={`${interviewRate}% interview rate`}
              icon={MessageSquareText}
              href="/job-tracker"
            />

            <MetricCard
              title="Offers"
              value={metrics.offers.value.toString()}
              change={`${offerRate}% interview conversion`}
              icon={Trophy}
              href="/job-tracker"
            />

            <MetricCard
              title="Latest ATS score"
              value={`${metrics.atsScore.value}%`}
              change={getMetricChange(
                metrics.atsScore.change,
                "points",
              )}
              icon={Target}
              href="/ats-score"
            />

            <MetricCard
              title="Job matches"
              value={metrics.jobMatches.value.toString()}
              change={getMetricChange(
                metrics.jobMatches.change,
                "count",
              )}
              icon={TrendingUp}
              href="/job-matching"
            />

            <MetricCard
              title="Tailored resumes"
              value={tailoredResumeCount.toString()}
              change="AI optimised CV versions"
              icon={FileCheck2}
              href="/resume-tailor"
            />

            <MetricCard
              title="Interview sessions"
              value={interviewSessionCount.toString()}
              change={`${completedInterviewQuestions} answers completed`}
              icon={MessageSquareText}
              href="/interview-prep"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Application activity
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Applications recorded during the last six
                    months.
                  </p>
                </div>

                <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/55">
                  Last 6 months
                </span>
              </div>

              <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
                {applicationActivity.map((point, index) => (
                  <ChartBar
                    key={`${point.year}-${point.month}`}
                    label={point.label}
                    count={point.applications}
                    maximum={maximumActivity}
                    highlighted={
                      index ===
                      applicationActivity.length - 1
                    }
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/[0.035] to-blue-500/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                  <Target size={21} />
                </span>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {getStrengthLabel(profileStrength)}
                </span>
              </div>

              <h2 className="mt-8 text-xl font-semibold">
                Profile strength
              </h2>

              <div className="mt-5 flex items-end justify-between gap-4">
                <p className="text-5xl font-semibold tracking-tight">
                  {profileStrength}%
                </p>

                <p className="text-right text-sm font-medium text-violet-200">
                  Based on your current activity
                </p>
              </div>

              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  style={{
                    width: `${profileStrength}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-sky-300 transition-all duration-700"
                />
              </div>

              <div className="mt-7 space-y-3 text-sm">
                <ProfileItem
                  label="Latest ATS score"
                  value={`${latestAtsScore}%`}
                />

                <ProfileItem
                  label="Interview readiness"
                  value={`${interviewRate}%`}
                />

                <ProfileItem
                  label="Best job match"
                  value={`${bestMatchScore}%`}
                />
              </div>

              <Link
                href="/profile"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
              >
                Improve profile
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
              <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Recent applications
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Monitor your latest application activity.
                  </p>
                </div>

                <Link
                  href="/job-tracker"
                  className="text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  View all
                </Link>
              </div>

              {recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-y border-white/10 text-xs uppercase tracking-[0.15em] text-white/30">
                        <th className="px-6 py-4 font-medium">
                          Company
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Role
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Applied
                        </th>

                        <th className="px-6 py-4 font-medium">
                          Status
                        </th>

                        <th className="px-6 py-4 font-medium" />
                      </tr>
                    </thead>

                    <tbody>
                      {recentApplications.map(
                        (application) => (
                          <ApplicationRow
                            key={application.id}
                            application={application}
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyApplications
                  hasSearchQuery={false}
                />
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    Upcoming tasks
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Your next priority actions.
                  </p>
                </div>

                <Link
                  href="/job-tracker"
                  aria-label="Open job tracker"
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/45 transition hover:text-white"
                >
                  <CalendarDays size={18} />
                </Link>
              </div>

              {upcomingTasks.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {upcomingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
                  <CheckCircle2
                    size={28}
                    className="mx-auto text-emerald-300"
                  />

                  <p className="mt-3 text-sm font-semibold">
                    No urgent tasks
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Your generated priorities will appear here.
                  </p>
                </div>
              )}

              <Link
                href="/job-tracker"
                className="mt-5 flex w-full items-center justify-center rounded-2xl border border-dashed border-white/15 py-3 text-sm font-medium text-white/45 transition hover:border-white/30 hover:text-white"
              >
                Manage applications
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    ATS intelligence
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Performance across your saved resume
                    analyses.
                  </p>
                </div>

                <Link
                  href="/ats-score"
                  className="text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  Open ATS score
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InsightCard
                  label="Saved analyses"
                  value={savedAtsAnalysisCount.toString()}
                />

                <InsightCard
                  label="Average score"
                  value={`${averageAtsScore}%`}
                />

                <InsightCard
                  label="Best score"
                  value={`${bestAtsScore}%`}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Best next action
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Recommended from your current dashboard
                    data.
                  </p>
                </div>

                <Sparkles
                  size={20}
                  className="text-violet-300"
                />
              </div>

              <NextAction
                latestAtsScore={latestAtsScore}
                applicationCount={
                  metrics.applications.value
                }
                interviewCount={metrics.interviews.value}
              />
            </div>
          </section>

          <section className="mt-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Interview readiness
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Performance from your completed AI interview practice.
                  </p>
                </div>

                <MessageSquareText
                  size={20}
                  className="text-violet-300"
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InsightCard
                  label="Sessions"
                  value={interviewSessionCount.toString()}
                />

                <InsightCard
                  label="Average score"
                  value={`${averageInterviewScore}%`}
                />

                <InsightCard
                  label="Best score"
                  value={`${bestInterviewScore}%`}
                />
              </div>

              <p className="mt-5 text-sm text-white/45">
                Completed answers: {completedInterviewQuestions}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction
              href="/resume-builder"
              icon={FileText}
              title="Build a tailored CV"
              description="Create a role-specific CV using AI-assisted recommendations."
              buttonText="Open builder"
            />

            <QuickAction
              href="/ats-score"
              icon={Target}
              title="Check your ATS score"
              description="Compare your CV against a job description and identify gaps."
              buttonText="Analyse CV"
            />

            <QuickAction
              href="/interview-prep"
              icon={CircleUserRound}
              title="Practice an interview"
              description="Generate realistic interview questions for your target role."
              buttonText="Start practice"
            />
          </section>
        </div>
        </div>
      </main>
    </AppLayout>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  href,
}: {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/15 hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-violet-300">
          <Icon size={19} />
        </span>

        <ArrowUpRight
          size={17}
          className="text-white/25 transition group-hover:text-white/60"
        />
      </div>

      <p className="mt-6 text-sm text-white/40">
        {title}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-emerald-300">
        {change}
      </p>
    </Link>
  );
}

function ChartBar({
  label,
  count,
  maximum,
  highlighted,
}: {
  label: string;
  count: number;
  maximum: number;
  highlighted: boolean;
}) {
  const height =
    count === 0
      ? 6
      : Math.max(12, (count / maximum) * 100);

  return (
    <div className="flex h-full flex-1 flex-col justify-end">
      <div className="flex flex-1 items-end">
        <div
          title={`${count} ${
            count === 1 ? "application" : "applications"
          }`}
          style={{ height: `${height}%` }}
          className={`relative w-full rounded-t-xl transition ${
            highlighted
              ? "bg-gradient-to-t from-violet-500 to-blue-300"
              : "bg-white/[0.08]"
          }`}
        >
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/55">
            {count}
          </span>
        </div>
      </div>

      <p
        className={`mt-3 text-center text-xs ${
          highlighted
            ? "font-semibold text-white"
            : "text-white/30"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function ApplicationRow({
  application,
}: {
  application: JobApplication;
}) {
  return (
    <tr className="border-b border-white/[0.07] last:border-b-0">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.07] text-sm font-semibold">
            {application.companyName.charAt(0).toUpperCase()}
          </span>

          <span className="font-medium">
            {application.companyName}
          </span>
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-white/55">
        {application.jobTitle}
      </td>

      <td className="px-6 py-5 text-sm text-white/40">
        {formatDate(getApplicationDate(application))}
      </td>

      <td className="px-6 py-5">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            statusStyles[application.status]
          }`}
        >
          {statusLabels[application.status]}
        </span>
      </td>

      <td className="px-6 py-5 text-right">
        <Link
          href="/job-tracker"
          aria-label={`Open ${application.companyName} application`}
          className="inline-flex rounded-xl p-2 text-white/35 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowRight size={18} />
        </Link>
      </td>
    </tr>
  );
}

function EmptyApplications({
  hasSearchQuery,
}: {
  hasSearchQuery: boolean;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <BriefcaseBusiness
        size={30}
        className="mx-auto text-white/25"
      />

      <p className="mt-4 font-semibold">
        {hasSearchQuery
          ? "No matching applications"
          : "No applications tracked yet"}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/35">
        {hasSearchQuery
          ? "Try another company, role or application status."
          : "Add your first application to activate live dashboard analytics."}
      </p>

      {!hasSearchQuery ? (
        <Link
          href="/job-tracker"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#050816]"
        >
          Add application
          <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}

function TaskCard({ task }: { task: DashboardTask }) {
  const taskIcons: Record<
    DashboardTask["type"],
    LucideIcon
  > = {
    interview: MessageSquareText,
    "follow-up": CalendarDays,
    ats: Target,
    application: BriefcaseBusiness,
  };

  const Icon = taskIcons[task.type];

  return (
    <Link
      href={task.href}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
        <Icon size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {task.title}
        </span>

        <span className="mt-1 block truncate text-xs text-white/35">
          {task.description}
        </span>

        <span className="mt-1 flex items-center gap-1.5 text-xs text-white/30">
          <Clock3 size={13} />
          {formatTaskDueDate(task.dueAt)}
        </span>
      </span>

      <ArrowUpRight
        size={16}
        className="shrink-0 text-white/25"
      />
    </Link>
  );
}

function NotificationPanel({
  notifications,
  onClose,
}: {
  notifications: DashboardNotification[];
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e1d]/95 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="font-semibold">Notifications</p>

          <p className="mt-0.5 text-xs text-white/35">
            {notifications.length} dashboard updates
          </p>
        </div>

        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="max-h-[420px] overflow-y-auto p-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <Bell
            size={28}
            className="mx-auto text-white/25"
          />

          <p className="mt-3 text-sm font-semibold">
            No notifications
          </p>

          <p className="mt-1 text-xs leading-5 text-white/35">
            New ATS analyses and application updates will
            appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: DashboardNotification;
  onClose: () => void;
}) {
  const notificationIcons: Record<
    DashboardNotification["type"],
    LucideIcon
  > = {
    application: BriefcaseBusiness,
    interview: MessageSquareText,
    offer: Trophy,
    ats: Target,
    match: TrendingUp,
    warning: AlertTriangle,
  };

  const Icon = notificationIcons[notification.type];

  return (
    <Link
      href={notification.href}
      onClick={onClose}
      className="flex gap-3 rounded-xl p-3 transition hover:bg-white/[0.05]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
        <Icon size={17} />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">
          {notification.title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-white/40">
          {notification.description}
        </span>
      </span>
    </Link>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/45">{label}</span>
      <span className="font-medium text-white/80">
        {value}
      </span>
    </div>
  );
}

function InsightCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-[0.13em] text-white/30">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function NextAction({
  latestAtsScore,
  applicationCount,
  interviewCount,
}: {
  latestAtsScore: number;
  applicationCount: number;
  interviewCount: number;
}) {
  if (latestAtsScore === 0) {
    return (
      <NextActionContent
        title="Run your first ATS analysis"
        description="Measure how closely your resume matches a target job description."
        href="/ats-score"
        buttonText="Analyse resume"
      />
    );
  }

  if (latestAtsScore < 70) {
    return (
      <NextActionContent
        title="Improve your resume alignment"
        description={`Your latest ATS score is ${latestAtsScore}%. Address missing keywords and impact statements before applying.`}
        href="/ats-score"
        buttonText="Improve ATS score"
      />
    );
  }

  if (applicationCount === 0) {
    return (
      <NextActionContent
        title="Start your application pipeline"
        description="Your resume is ready. Add a target role and begin tracking applications."
        href="/job-tracker"
        buttonText="Add application"
      />
    );
  }

  if (interviewCount === 0) {
    return (
      <NextActionContent
        title="Strengthen interview conversion"
        description="Tailor your strongest resume to each application and prepare targeted follow-ups."
        href="/resume-tailor"
        buttonText="Tailor resume"
      />
    );
  }

  return (
    <NextActionContent
      title="Prepare for your interviews"
      description="Generate role-specific questions and practise evidence-based responses."
      href="/interview-prep"
      buttonText="Start interview prep"
    />
  );
}

function NextActionContent({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="mt-6">
      <p className="font-semibold">{title}</p>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
      >
        {buttonText}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  buttonText,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
        <Icon size={20} />
      </span>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-white/40">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
      >
        {buttonText}
        <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
