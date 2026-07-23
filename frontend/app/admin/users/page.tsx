import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type AdminUsersPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  subscription_plan: string;
  subscription_status: string;
  ai_credits: number;
  resumes_created: number;
  cover_letters_created: number;
  ats_scans: number;
  interview_sessions: number;
  last_login: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-semibold text-slate-400">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDisplayName(profile: Profile): string {
  return (
    profile.full_name?.trim() ||
    profile.username?.trim() ||
    "Unnamed user"
  );
}

function getInitials(profile: Profile): string {
  const name = getDisplayName(profile);

  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

function getStatusClasses(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "trialing"
  ) {
    return "bg-emerald-500/10 text-emerald-300";
  }

  if (
    normalizedStatus === "past_due" ||
    normalizedStatus === "unpaid"
  ) {
    return "bg-amber-500/10 text-amber-300";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled"
  ) {
    return "bg-rose-500/10 text-rose-300";
  }

  return "bg-white/[0.06] text-slate-300";
}

function createPageHref(
  page: number,
  search: string,
): string {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  params.set("page", String(page));

  return `/admin/users?${params.toString()}`;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  let usersQuery = supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        username,
        avatar_url,
        subscription_plan,
        subscription_status,
        ai_credits,
        resumes_created,
        cover_letters_created,
        ats_scans,
        interview_sessions,
        last_login,
        onboarding_completed,
        created_at
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (search) {
    const safeSearch = search
      .replace(/[%_]/g, "")
      .replace(/,/g, " ")
      .trim();

    if (safeSearch) {
      usersQuery = usersQuery.or(
        `full_name.ilike.%${safeSearch}%,username.ilike.%${safeSearch}%`,
      );
    }
  }

  const [
    usersResult,
    totalUsersResult,
    activeSubscribersResult,
    onboardingResult,
  ] = await Promise.all([
    usersQuery,

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("subscription_status", ["active", "trialing"]),

    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("onboarding_completed", true),
  ]);

  const users = (usersResult.data ?? []) as Profile[];
  const matchingUsers = usersResult.count ?? 0;
  const totalUsers = totalUsersResult.count ?? 0;
  const activeSubscribers =
    activeSubscribersResult.count ?? 0;
  const onboardedUsers = onboardingResult.count ?? 0;
  const freeUsers = Math.max(
    totalUsers - activeSubscribers,
    0,
  );

  const totalPages = Math.max(
    Math.ceil(matchingUsers / PAGE_SIZE),
    1,
  );

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const errors = [
    usersResult.error,
    totalUsersResult.error,
    activeSubscribersResult.error,
    onboardingResult.error,
  ].filter(Boolean);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
          Users
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          User management
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Review Panthrex accounts, subscription access,
          engagement and recent platform activity.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
          Some user data could not be loaded. Check the
          development server logs for the Supabase error.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total users"
          value={totalUsers.toLocaleString("en-GB")}
          description="Registered Panthrex profiles"
        />

        <MetricCard
          label="Active subscribers"
          value={activeSubscribers.toLocaleString("en-GB")}
          description="Active and trialing accounts"
        />

        <MetricCard
          label="Free accounts"
          value={freeUsers.toLocaleString("en-GB")}
          description="Users without an active subscription"
        />

        <MetricCard
          label="Onboarding completed"
          value={onboardedUsers.toLocaleString("en-GB")}
          description="Users who completed account setup"
        />
      </div>

      <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              All users
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {matchingUsers.toLocaleString("en-GB")} matching
              account{matchingUsers === 1 ? "" : "s"}
            </p>
          </div>

          <form
            action="/admin/users"
            method="get"
            className="flex w-full max-w-lg gap-2"
          >
            <label htmlFor="user-search" className="sr-only">
              Search users
            </label>

            <input
              id="user-search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Search by name or username"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
            />

            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              Search
            </button>

            {search && (
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <p className="text-base font-semibold text-white">
              No users found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try a different name or username."
                : "No Panthrex profiles currently exist."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full divide-y divide-white/10">
              <thead className="bg-black/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Plan
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI credits
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resumes
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last login
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {users.map((profile) => (
                  <tr
                    key={profile.id}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-200">
                            {getInitials(profile)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="max-w-56 truncate text-sm font-semibold text-white">
                            {getDisplayName(profile)}
                          </p>

                          <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                            {profile.username
                              ? `@${profile.username}`
                              : profile.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm capitalize text-slate-300">
                      {profile.subscription_plan || "free"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                          profile.subscription_status ||
                            "inactive",
                        )}`}
                      >
                        {profile.subscription_status ||
                          "inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {profile.ai_credits.toLocaleString(
                        "en-GB",
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {profile.resumes_created.toLocaleString(
                        "en-GB",
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDate(profile.last_login)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDate(profile.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage.toLocaleString("en-GB")} of{" "}
            {totalPages.toLocaleString("en-GB")}
          </p>

          <div className="flex items-center gap-2">
            {hasPreviousPage ? (
              <Link
                href={createPageHref(
                  currentPage - 1,
                  search,
                )}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xl border border-white/5 px-4 py-2 text-sm font-semibold text-slate-600">
                Previous
              </span>
            )}

            {hasNextPage ? (
              <Link
                href={createPageHref(
                  currentPage + 1,
                  search,
                )}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xl border border-white/5 px-4 py-2 text-sm font-semibold text-slate-600">
                Next
              </span>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
