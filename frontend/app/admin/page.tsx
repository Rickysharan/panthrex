import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

type RecentProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
};

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDisplayName(profile: RecentProfile): string {
  return (
    profile.full_name?.trim() ||
    profile.username?.trim() ||
    "Unnamed user"
  );
}

export default async function AdminPage() {
  const supabase = createAdminClient();

  const [
    profilesResult,
    subscriptionsResult,
    resumesResult,
    apiUsageResult,
    recentProfilesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),

    supabase
      .from("resumes")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("api_usage")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("profiles")
      .select(
        "id, full_name, username, subscription_plan, subscription_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const errors = [
    profilesResult.error,
    subscriptionsResult.error,
    resumesResult.error,
    apiUsageResult.error,
    recentProfilesResult.error,
  ].filter(Boolean);

  const totalUsers = profilesResult.count ?? 0;
  const activeSubscribers = subscriptionsResult.count ?? 0;
  const totalResumes = resumesResult.count ?? 0;
  const totalAiRequests = apiUsageResult.count ?? 0;
  const recentProfiles =
    (recentProfilesResult.data as RecentProfile[] | null) ?? [];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
          Overview
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Admin dashboard
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Monitor Panthrex users, subscriptions, resume activity and AI usage
          from live Supabase data.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
          Some dashboard metrics could not be loaded. Check the server logs for
          the underlying Supabase error.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total users"
          value={totalUsers.toLocaleString("en-GB")}
          description="Registered Panthrex accounts"
        />

        <MetricCard
          label="Active subscribers"
          value={activeSubscribers.toLocaleString("en-GB")}
          description="Active and trialing Stripe subscriptions"
        />

        <MetricCard
          label="Resumes created"
          value={totalResumes.toLocaleString("en-GB")}
          description="Resume records stored in Panthrex"
        />

        <MetricCard
          label="AI requests"
          value={totalAiRequests.toLocaleString("en-GB")}
          description="Tracked AI API usage events"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="text-lg font-bold text-white">Newest users</h3>
            <p className="mt-1 text-sm text-slate-400">
              The five most recently created profiles.
            </p>
          </div>

          {recentProfiles.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              No user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
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
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {recentProfiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">
                          {getDisplayName(profile)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {profile.username
                            ? `@${profile.username}`
                            : profile.id}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-slate-300">
                        {profile.subscription_plan || "free"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                          {profile.subscription_status || "inactive"}
                        </span>
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
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-lg font-bold text-white">System status</h3>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <span className="text-sm font-medium text-slate-300">
                Supabase
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <span className="text-sm font-medium text-slate-300">
                Stripe
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Configured
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <span className="text-sm font-medium text-slate-300">
                OpenAI
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Configured
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
