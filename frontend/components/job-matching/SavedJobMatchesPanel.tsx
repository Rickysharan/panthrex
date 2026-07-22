"use client";

import type {
  SavedJobMatch,
} from "@/lib/job-matching/useJobMatching";

type SavedJobMatchesPanelProps = {
  savedMatches: SavedJobMatch[];
  selectedMatchId: string | null;
  averageScore: number;
  bestMatch: SavedJobMatch | null;
  onLoad: (match: SavedJobMatch) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

export default function SavedJobMatchesPanel({
  savedMatches,
  selectedMatchId,
  averageScore,
  bestMatch,
  onLoad,
  onDuplicate,
  onDelete,
  onClearAll,
}: SavedJobMatchesPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Analysis history
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Saved job matches
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Load, duplicate or remove previously saved job-match analyses.
          </p>
        </div>

        {savedMatches.length > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/15"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {savedMatches.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Saved analyses"
              value={savedMatches.length.toString()}
            />

            <StatCard
              label="Average match"
              value={`${averageScore}%`}
            />

            <StatCard
              label="Best match"
              value={
                bestMatch
                  ? `${bestMatch.result.overallScore}%`
                  : "0%"
              }
            />
          </div>

          <div className="mt-6 space-y-4">
            {savedMatches.map((match) => (
              <SavedMatchCard
                key={match.id}
                match={match}
                selected={
                  match.id === selectedMatchId
                }
                onLoad={onLoad}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-xl text-slate-400">
            ◫
          </div>

          <h3 className="mt-4 font-semibold text-white">
            No saved analyses
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Analyse a vacancy and save the result to build your job-match
            history.
          </p>
        </div>
      )}
    </section>
  );
}

function SavedMatchCard({
  match,
  selected,
  onLoad,
  onDuplicate,
  onDelete,
}: {
  match: SavedJobMatch;
  selected: boolean;
  onLoad: (match: SavedJobMatch) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      className={
        selected
          ? "rounded-2xl border border-cyan-500/40 bg-cyan-500/5 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-950 p-5"
      }
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-white">
              {match.title}
            </h3>

            {selected ? (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                Selected
              </span>
            ) : null}
          </div>

          {match.company ? (
            <p className="mt-1 text-sm text-cyan-400">
              {match.company}
            </p>
          ) : null}

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {match.jobDescription}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>
              Overall:{" "}
              <strong className="text-slate-300">
                {match.result.overallScore}%
              </strong>
            </span>

            <span>
              ATS:{" "}
              <strong className="text-slate-300">
                {match.result.atsScore}%
              </strong>
            </span>

            <span>
              Interview:{" "}
              <strong className="text-slate-300">
                {match.result.interviewReadiness}%
              </strong>
            </span>

            <span>
              Saved:{" "}
              <strong className="text-slate-300">
                {formatDate(match.createdAt)}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onLoad(match)}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Load
          </button>

          <button
            type="button"
            onClick={() =>
              onDuplicate(match.id)
            }
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={() => onDelete(match.id)}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/40"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string): string {
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