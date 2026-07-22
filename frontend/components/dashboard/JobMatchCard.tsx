import Link from "next/link";

type JobMatchCardProps = {
  savedAnalyses?: number;
  averageScore?: number;
  bestScore?: number;
};

export default function JobMatchCard({
  savedAnalyses = 0,
  averageScore = 0,
  bestScore = 0,
}: JobMatchCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-cyan-500/40 hover:bg-slate-900">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-xl text-cyan-300">
            ◎
          </div>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            AI powered
          </span>
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          AI Job Matching
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Compare your resume with job descriptions,
          calculate ATS compatibility and identify the
          most important improvements before applying.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric
            label="Saved"
            value={savedAnalyses.toString()}
          />

          <Metric
            label="Average"
            value={`${normalizeScore(averageScore)}%`}
          />

          <Metric
            label="Best"
            value={`${normalizeScore(bestScore)}%`}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/job-matching"
            className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Analyse a job
          </Link>

          <Link
            href="/resume-builder"
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Update resume
          </Link>
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 text-center">
      <p className="text-lg font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(value)),
  );
}