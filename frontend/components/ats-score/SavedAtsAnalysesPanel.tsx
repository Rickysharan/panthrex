"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Copy,
  FileText,
  History,
  LoaderCircle,
  RotateCcw,
  Trash2,
  Trophy,
} from "lucide-react";

import type { SavedAtsAnalysis } from "@/lib/ats-score/useAtsScoreHistory";

type SavedAtsAnalysesPanelProps = {
  analyses: SavedAtsAnalysis[];
  selectedAnalysisId: string | null;
  averageScore: number;
  bestAnalysis: SavedAtsAnalysis | null;
  isHydrated: boolean;
  onSelect: (analysis: SavedAtsAnalysis) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getScoreLabel(score: number): string {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Strong";
  }

  if (score >= 55) {
    return "Moderate";
  }

  if (score >= 40) {
    return "Needs work";
  }

  return "Low match";
}

function getScoreStyles(score: number): string {
  if (score >= 85) {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (score >= 70) {
    return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";
  }

  if (score >= 55) {
    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  if (score >= 40) {
    return "border-orange-400/20 bg-orange-500/10 text-orange-300";
  }

  return "border-red-400/20 bg-red-500/10 text-red-300";
}

function getScoreBarStyles(score: number): string {
  if (score >= 85) {
    return "bg-emerald-400";
  }

  if (score >= 70) {
    return "bg-cyan-400";
  }

  if (score >= 55) {
    return "bg-amber-400";
  }

  if (score >= 40) {
    return "bg-orange-400";
  }

  return "bg-red-400";
}

export default function SavedAtsAnalysesPanel({
  analyses,
  selectedAnalysisId,
  averageScore,
  bestAnalysis,
  isHydrated,
  onSelect,
  onDuplicate,
  onDelete,
  onClearAll,
}: SavedAtsAnalysesPanelProps) {
  if (!isHydrated) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="flex min-h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-indigo-300" />

            <div>
              <p className="font-semibold text-white">
                Loading saved analyses
              </p>

              <p className="mt-1 text-sm text-white/40">
                Retrieving your ATS score history.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <History className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Saved ATS analyses
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/40">
                Reload, duplicate or remove previous resume checks.
              </p>
            </div>
          </div>

          {analyses.length > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 px-3.5 py-2 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Clear history
            </button>
          ) : null}
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="px-6 py-12">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
              <FileText className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              No saved analyses yet
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Run an ATS check and save the result to build your analysis
              history.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 border-b border-white/10 bg-black/15 p-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                    Analyses
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {analyses.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/50">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                    Average score
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {averageScore}
                    <span className="text-sm text-white/30">
                      /100
                    </span>
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <RotateCcw className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                    Best score
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {bestAnalysis?.result.overallScore ?? 0}
                    <span className="text-sm text-white/30">
                      /100
                    </span>
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {analyses.map((analysis) => {
              const score = analysis.result.overallScore;
              const isSelected =
                selectedAnalysisId === analysis.id;

              return (
                <article
                  key={analysis.id}
                  className={`p-5 transition ${
                    isSelected
                      ? "bg-indigo-500/[0.08]"
                      : "hover:bg-white/[0.025]"
                  }`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <button
                      type="button"
                      onClick={() => onSelect(analysis)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div
                          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border ${getScoreStyles(
                            score,
                          )}`}
                        >
                          <span className="text-xl font-bold leading-none">
                            {score}
                          </span>

                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                            Score
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-white">
                              {analysis.title}
                            </h3>

                            {isSelected ? (
                              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                                Selected
                              </span>
                            ) : null}

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getScoreStyles(
                                score,
                              )}`}
                            >
                              {getScoreLabel(score)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                            {analysis.company ? (
                              <span className="inline-flex items-center gap-1.5">
                                <BriefcaseBusiness className="h-4 w-4" />
                                {analysis.company}
                              </span>
                            ) : null}

                            <span className="inline-flex items-center gap-1.5">
                              <FileText className="h-4 w-4" />
                              {analysis.resumeName}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(analysis.updatedAt)}
                            </span>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className={`h-full rounded-full transition-all ${getScoreBarStyles(
                                score,
                              )}`}
                              style={{
                                width: `${Math.min(
                                  Math.max(score, 0),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/40">
                            {analysis.jobDescription}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-2 sm:pl-[4.5rem] xl:pl-0">
                      <button
                        type="button"
                        onClick={() => onSelect(analysis)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:flex-none"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Load
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicate(analysis.id)}
                        aria-label={`Duplicate ${analysis.title}`}
                        title="Duplicate analysis"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(analysis.id)}
                        aria-label={`Delete ${analysis.title}`}
                        title="Delete analysis"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}