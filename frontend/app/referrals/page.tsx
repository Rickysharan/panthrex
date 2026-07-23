import AppLayout from "@/components/layout/AppLayout";

export default function ReferralsPage() {
  return (
    <AppLayout
      title="Refer & Earn"
      description="Invite friends and earn rewards with Panthrex."
    >
      <div className="mx-auto max-w-4xl space-y-6 p-6">

        <div className="rounded-3xl border border-indigo-400/20 bg-indigo-500/10 p-8">
          <h2 className="text-2xl font-bold">
            Invite friends. Grow together. 🚀
          </h2>

          <p className="mt-3 text-white/50">
            Share Panthrex with friends looking for jobs
            and earn rewards when they join.
          </p>

          <div className="mt-6 rounded-2xl bg-black/20 p-4">
            <p className="text-xs text-white/40">
              Your referral link
            </p>

            <p className="mt-2 font-mono text-sm text-indigo-300">
              panthrex.ai/signup?ref=YOURCODE
            </p>

            <button
              className="mt-4 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold"
            >
              Copy Link
            </button>
          </div>
        </div>


        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/40">
              Friends invited
            </p>
            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/40">
              Rewards earned
            </p>
            <p className="mt-2 text-3xl font-bold">
              £0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/40">
              Referral status
            </p>
            <p className="mt-2 text-xl font-bold text-indigo-300">
              Active
            </p>
          </div>

        </div>


        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <h3 className="text-lg font-semibold">
            How it works
          </h3>

          <ol className="mt-4 space-y-3 text-sm text-white/60">

            <li>
              1. Share your referral link
            </li>

            <li>
              2. Your friend creates a Panthrex account
            </li>

            <li>
              3. They upgrade to Panthrex Pro
            </li>

            <li>
              4. You receive referral rewards 🎁
            </li>

          </ol>

        </div>

      </div>
    </AppLayout>
  );
}
