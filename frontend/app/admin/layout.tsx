import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
};

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75h6.5v6.5h-6.5v-6.5Zm10 0h6.5v6.5h-6.5v-6.5Zm-10 10h6.5v6.5h-6.5v-6.5Zm10 0h6.5v6.5h-6.5v-6.5Z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372A9.337 9.337 0 0 0 21 18.872a4.5 4.5 0 0 0-7.5-3.369M15 19.128v-.003c0-1.113-.285-2.16-.786-3.072M15 19.128v.106A12.318 12.318 0 0 1 9.75 20.25c-2.08 0-4.04-.51-5.75-1.412v-.106a6 6 0 0 1 11.214-3.073M12 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm6.75 2.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M3.75 5.25h16.5A1.5 1.5 0 0 1 21.75 6.75v10.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Zm2.25 9h3"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3v18h18M7.5 16.5v-4.25m4.5 4.25V8.75m4.5 7.75V6"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.278c.063.374.313.686.645.87.074.04.147.082.219.126.325.197.717.258 1.072.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.004.827a1.125 1.125 0 0 0-.403 1.01v.252c0 .39.17.76.47 1.009l1.005.827c.424.35.534.954.26 1.431l-1.297 2.247a1.125 1.125 0 0 1-1.369.49l-1.217-.456a1.125 1.125 0 0 0-1.072.124 6.9 6.9 0 0 1-.22.126 1.125 1.125 0 0 0-.644.87l-.213 1.278c-.09.542-.56.94-1.11.94h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.278a1.125 1.125 0 0 0-.645-.87 6.9 6.9 0 0 1-.219-.126 1.125 1.125 0 0 0-1.072-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.3-.248.47-.618.47-1.009v-.252c0-.39-.17-.76-.47-1.009l-1.004-.827a1.125 1.125 0 0 1-.26-1.431L4.89 6.372a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.134.747.073 1.072-.124.072-.044.145-.086.219-.126.332-.184.582-.496.645-.87l.213-1.278Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M10.5 13.5 21 3m0 0h-6.75M21 3v6.75"
      />
    </svg>
  );
}

const navigationItems: NavigationItem[] = [
  {
    href: "/admin",
    label: "Overview",
    description: "Platform performance",
    icon: <DashboardIcon />,
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Accounts and access",
    icon: <UsersIcon />,
  },
  {
    href: "/admin/billing",
    label: "Billing",
    description: "Plans and subscriptions",
    icon: <BillingIcon />,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "Usage and growth",
    icon: <AnalyticsIcon />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Admin configuration",
    icon: <SettingsIcon />,
  },
];

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirect=/admin");
  }

  const userEmail = user.email?.toLowerCase() ?? "";
  const adminEmails = getAdminEmails();
  const metadataRole = user.user_metadata?.role;
  const appMetadataRole = user.app_metadata?.role;

  const isAdmin =
    adminEmails.includes(userEmail) ||
    metadataRole === "admin" ||
    appMetadataRole === "admin";

  if (!isAdmin) {
    redirect("/dashboard?error=admin_access_required");
  }

  const displayName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email?.split("@")[0] ?? "Administrator";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/95 lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <Link
              href="/admin"
              className="flex items-center gap-3"
              aria-label="Panthrex Admin"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-black shadow-lg shadow-violet-950/40">
                P
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  Panthrex
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Admin Console
                </p>
              </div>
            </Link>
          </div>

          <nav
            aria-label="Admin navigation"
            className="flex-1 space-y-2 px-4 py-6"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-slate-300 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-violet-300 transition group-hover:bg-violet-500/15 group-hover:text-violet-200">
                  {item.icon}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500 group-hover:text-slate-400">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Return to Panthrex
              <ExternalLinkIcon />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  Administration
                </p>
                <h1 className="mt-1 text-lg font-bold text-white">
                  Platform control centre
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
                >
                  User dashboard
                </Link>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 pr-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                    {initials || "A"}
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="max-w-40 truncate text-sm font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="max-w-40 truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <nav
              aria-label="Mobile admin navigation"
              className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 lg:hidden"
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
