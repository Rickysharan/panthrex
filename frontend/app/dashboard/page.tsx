"use client";

import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Resume Builder",
    href: "#",
    icon: FileText,
    active: false,
  },
  {
    label: "ATS Optimizer",
    href: "#",
    icon: Target,
    active: false,
  },
  {
    label: "Interview Coach",
    href: "#",
    icon: MessageSquareText,
    active: false,
  },
  {
    label: "Job Matches",
    href: "#",
    icon: BriefcaseBusiness,
    active: false,
  },
  {
    label: "Applications",
    href: "#",
    icon: FileCheck2,
    active: false,
  },
];

const recentApplications = [
  {
    company: "Monzo",
    role: "Junior Data Analyst",
    date: "18 Jul 2026",
    status: "Interview",
    statusStyle: "bg-violet-400/10 text-violet-300",
  },
  {
    company: "Revolut",
    role: "Fraud Operations Analyst",
    date: "16 Jul 2026",
    status: "Applied",
    statusStyle: "bg-blue-400/10 text-blue-300",
  },
  {
    company: "Starling Bank",
    role: "Graduate Software Engineer",
    date: "14 Jul 2026",
    status: "Review",
    statusStyle: "bg-amber-400/10 text-amber-300",
  },
  {
    company: "Wise",
    role: "Machine Learning Intern",
    date: "12 Jul 2026",
    status: "Rejected",
    statusStyle: "bg-rose-400/10 text-rose-300",
  },
];

const upcomingTasks = [
  {
    title: "Prepare for Monzo interview",
    time: "Today, 4:30 PM",
    icon: MessageSquareText,
  },
  {
    title: "Tailor CV for Barclays role",
    time: "Tomorrow, 10:00 AM",
    icon: FileText,
  },
  {
    title: "Follow up with recruiter",
    time: "22 Jul, 9:00 AM",
    icon: CalendarDays,
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div
        aria-hidden="true"
        className="fixed left-[-160px] top-[-150px] h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[140px]"
      />

      <div
        aria-hidden="true"
        className="fixed bottom-[-180px] right-[-140px] h-[440px] w-[440px] rounded-full bg-blue-500/10 blur-[150px]"
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#070a18]/95 p-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#050816]">
              <Sparkles size={21} />
            </span>

            <div>
              <p className="text-lg font-bold tracking-tight">Panthrex</p>
              <p className="text-xs text-white/35">Career Intelligence</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-white text-[#050816]"
                    : "text-white/55 hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-violet-400/20 bg-violet-400/[0.075] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
            <WandSparkles size={19} />
          </div>

          <h3 className="mt-4 font-semibold">Upgrade your workflow</h3>

          <p className="mt-2 text-sm leading-6 text-white/45">
            Unlock unlimited CV optimisation and advanced interview coaching.
          </p>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
          >
            View Pro plan
          </button>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/80 px-5 py-4 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/70 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="relative hidden sm:block">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="search"
                  placeholder="Search applications, jobs and tools"
                  className="h-11 w-[330px] rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
              >
                <Bell size={19} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-violet-400" />
              </button>

              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.07]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 font-semibold text-white">
                  R
                </span>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">Ricky Sharan</p>
                  <p className="text-xs text-white/35">Free plan</p>
                </div>

                <ChevronDown size={16} className="text-white/35" />
              </button>
            </div>
          </div>
        </header>

        <div className="px-5 py-8 sm:px-8 lg:px-10">
          <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                Career command centre
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Welcome back, Ricky.
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/45">
                Track your applications, strengthen your CV and prepare for
                every interview from one focused workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <BriefcaseBusiness size={18} />
                Add application
              </button>

              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
              >
                <WandSparkles size={18} />
                Optimize CV
              </button>
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Applications"
              value="24"
              change="+6 this month"
              icon={BriefcaseBusiness}
            />

            <MetricCard
              title="Interviews"
              value="5"
              change="+2 this month"
              icon={MessageSquareText}
            />

            <MetricCard
              title="CV score"
              value="82%"
              change="+14% improved"
              icon={Target}
            />

            <MetricCard
              title="Job matches"
              value="18"
              change="7 high matches"
              icon={TrendingUp}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Application performance
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Your job-search activity during the last six months.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/55 transition hover:text-white"
                >
                  Last 6 months
                </button>
              </div>

              <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
                <ChartBar label="Feb" value={36} />
                <ChartBar label="Mar" value={52} />
                <ChartBar label="Apr" value={44} />
                <ChartBar label="May" value={68} />
                <ChartBar label="Jun" value={58} />
                <ChartBar label="Jul" value={86} highlighted />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/[0.035] to-blue-500/10 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                  <Target size={21} />
                </span>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Strong profile
                </span>
              </div>

              <h2 className="mt-8 text-xl font-semibold">Profile strength</h2>

              <div className="mt-5 flex items-end justify-between">
                <p className="text-5xl font-semibold tracking-tight">82%</p>

                <p className="text-sm font-medium text-emerald-300">
                  +14% this month
                </p>
              </div>

              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-sky-300" />
              </div>

              <div className="mt-7 space-y-3 text-sm">
                <ProfileItem label="CV completeness" value="92%" />
                <ProfileItem label="Interview readiness" value="78%" />
                <ProfileItem label="Application consistency" value="74%" />
              </div>

              <button
                type="button"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white"
              >
                Improve profile
                <ArrowUpRight size={16} />
              </button>
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

                <button
                  type="button"
                  className="text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-y border-white/10 text-xs uppercase tracking-[0.15em] text-white/30">
                      <th className="px-6 py-4 font-medium">Company</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Applied</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium" />
                    </tr>
                  </thead>

                  <tbody>
                    {recentApplications.map((application) => (
                      <tr
                        key={`${application.company}-${application.role}`}
                        className="border-b border-white/[0.07] last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.07] text-sm font-semibold">
                              {application.company.charAt(0)}
                            </span>

                            <span className="font-medium">
                              {application.company}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-white/55">
                          {application.role}
                        </td>

                        <td className="px-6 py-5 text-sm text-white/40">
                          {application.date}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${application.statusStyle}`}
                          >
                            {application.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            className="rounded-xl p-2 text-white/35 transition hover:bg-white/5 hover:text-white"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Upcoming tasks</h2>

                  <p className="mt-1 text-sm text-white/40">
                    Your next priority actions.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/45 transition hover:text-white"
                >
                  <CalendarDays size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {upcomingTasks.map((task) => {
                  const Icon = task.icon;

                  return (
                    <button
                      key={task.title}
                      type="button"
                      className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                        <Icon size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {task.title}
                        </span>

                        <span className="mt-1 flex items-center gap-1.5 text-xs text-white/35">
                          <Clock3 size={13} />
                          {task.time}
                        </span>
                      </span>

                      <ArrowUpRight size={16} className="text-white/25" />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-2xl border border-dashed border-white/15 py-3 text-sm font-medium text-white/45 transition hover:border-white/30 hover:text-white"
              >
                + Add new task
              </button>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction
              icon={FileText}
              title="Build a tailored CV"
              description="Create a role-specific CV using AI-assisted recommendations."
              buttonText="Open builder"
            />

            <QuickAction
              icon={Target}
              title="Check your ATS score"
              description="Compare your CV against a job description and identify gaps."
              buttonText="Analyze CV"
            />

            <QuickAction
              icon={CircleUserRound}
              title="Practice an interview"
              description="Generate realistic interview questions for your target role."
              buttonText="Start practice"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-violet-300">
          <Icon size={19} />
        </span>

        <ArrowUpRight size={17} className="text-white/25" />
      </div>

      <p className="mt-6 text-sm text-white/40">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs font-medium text-emerald-300">{change}</p>
    </div>
  );
}

function ChartBar({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: number;
  highlighted?: boolean;
}) {
  return (
    <div className="flex h-full flex-1 flex-col justify-end">
      <div className="flex flex-1 items-end">
        <div
          style={{ height: `${value}%` }}
          className={`w-full rounded-t-xl transition ${
            highlighted
              ? "bg-gradient-to-t from-violet-500 to-blue-300"
              : "bg-white/[0.08]"
          }`}
        />
      </div>

      <p
        className={`mt-3 text-center text-xs ${
          highlighted ? "font-semibold text-white" : "text-white/30"
        }`}
      >
        {label}
      </p>
    </div>
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
      <span className="font-medium text-white/80">{value}</span>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  buttonText,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
        <Icon size={20} />
      </span>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-white/40">
        {description}
      </p>

      <button
        type="button"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
      >
        {buttonText}
        <ArrowUpRight size={16} />
      </button>
    </div>
  );
}