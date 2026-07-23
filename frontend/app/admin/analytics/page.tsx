export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
          Analytics
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Platform analytics
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Monitor user growth, resume activity, AI usage and conversion trends.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-slate-400">AI requests</p>
          <p className="mt-3 text-3xl font-bold text-white">—</p>
          <p className="mt-2 text-sm text-slate-500">Total API usage events</p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-slate-400">
            ATS analyses
          </p>
          <p className="mt-3 text-3xl font-bold text-white">—</p>
          <p className="mt-2 text-sm text-slate-500">
            Completed ATS score checks
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-slate-400">
            Resumes created
          </p>
          <p className="mt-3 text-3xl font-bold text-white">—</p>
          <p className="mt-2 text-sm text-slate-500">
            Resume records in the platform
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-slate-400">
            Job applications
          </p>
          <p className="mt-3 text-3xl font-bold text-white">—</p>
          <p className="mt-2 text-sm text-slate-500">
            Applications tracked by users
          </p>
        </article>
      </div>

      <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h3 className="text-lg font-bold text-white">Usage trends</h3>

        <p className="mt-2 text-sm text-slate-400">
          Charts will be connected after the live analytics queries are added.
        </p>

        <div className="mt-6 flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10">
          <p className="text-sm font-medium text-slate-500">
            Analytics visualisation coming next
          </p>
        </div>
      </article>
    </section>
  );
}
