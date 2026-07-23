import Link from "next/link";

export const dynamic = "force-dynamic";

type BillingMetricProps = {
  label: string;
  value: string;
  description: string;
};

function BillingMetric({
  label,
  value,
  description,
}: BillingMetricProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

export default function AdminBillingPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
            Billing
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Subscription management
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Monitor paid plans, subscription status, recurring revenue and
            billing activity across Panthrex.
          </p>
        </div>

        <Link
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          Open Stripe Dashboard
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BillingMetric
          label="Active subscriptions"
          value="—"
          description="Customers with an active paid subscription"
        />

        <BillingMetric
          label="Monthly recurring revenue"
          value="—"
          description="Estimated recurring subscription income"
        />

        <BillingMetric
          label="Trial subscriptions"
          value="—"
          description="Customers currently using a trial period"
        />

        <BillingMetric
          label="Cancelled subscriptions"
          value="—"
          description="Subscriptions marked as cancelled"
        />
      </div>

      <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-6 py-5">
          <h3 className="text-lg font-bold text-white">
            Recent subscriptions
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Live subscription records will be loaded from Supabase in the next
            step.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Renewal
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  Subscription data will appear here after the live query is
                  connected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
