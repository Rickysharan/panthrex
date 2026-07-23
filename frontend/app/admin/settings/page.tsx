export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
          Settings
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Admin settings
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Review platform configuration, integrations and administrative access.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-lg font-bold text-white">Platform integrations</h3>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Supabase</p>
                <p className="mt-1 text-xs text-slate-500">
                  Authentication and database
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Configured
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Stripe</p>
                <p className="mt-1 text-xs text-slate-500">
                  Subscription billing
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Configured
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-white">OpenAI</p>
                <p className="mt-1 text-xs text-slate-500">
                  AI-powered platform features
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Configured
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-lg font-bold text-white">Administrative access</h3>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Admin access is controlled through the ADMIN_EMAILS environment
            variable and Supabase user role metadata.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current admin
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              rickysharan999@gmail.com
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
