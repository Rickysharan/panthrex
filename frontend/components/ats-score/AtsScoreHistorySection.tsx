"use client";

import {
  BriefcaseBusiness,
  Check,
  Save,
} from "lucide-react";
import { useState } from "react";

import SavedAtsAnalysesPanel from "@/components/ats-score/SavedAtsAnalysesPanel";
import type { AtsScoreResult } from "@/lib/ats-score/types";
import {
  type SavedAtsAnalysis,
  useAtsScoreHistory,
} from "@/lib/ats-score/useAtsScoreHistory";

type AtsScoreHistorySectionProps = {
  result: AtsScoreResult | null;
  jobDescription: string;
  resumeName: string;
  onLoadAnalysis: (
    analysis: SavedAtsAnalysis,
  ) => void;
};

export default function AtsScoreHistorySection({
  result,
  jobDescription,
  resumeName,
  onLoadAnalysis,
}: AtsScoreHistorySectionProps) {
  const {
    savedAnalyses,
    selectedAnalysisId,
    averageScore,
    bestAnalysis,
    isHydrated,
    setSelectedAnalysisId,
    saveAnalysis,
    deleteAnalysis,
    duplicateAnalysis,
    clearAllAnalyses,
  } = useAtsScoreHistory();

  const [jobTitle, setJobTitle] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [savedConfirmation, setSavedConfirmation] =
    useState(false);

  const canSave =
    result !== null &&
    jobDescription.trim().length >= 50;

  function handleSave(): void {
    if (!result || !canSave) {
      return;
    }

    saveAnalysis({
      title:
        jobTitle.trim() ||
        "ATS resume analysis",
      company,
      jobDescription,
      resumeName,
      result,
    });

    setSavedConfirmation(true);

    window.setTimeout(() => {
      setSavedConfirmation(false);
    }, 2500);
  }

  function handleSelect(
    analysis: SavedAtsAnalysis,
  ): void {
    setSelectedAnalysisId(analysis.id);
    setJobTitle(analysis.title);
    setCompany(analysis.company);
    setSavedConfirmation(false);
    onLoadAnalysis(analysis);

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  function handleDuplicate(id: string): void {
    const duplicatedAnalysis =
      duplicateAnalysis(id);

    if (!duplicatedAnalysis) {
      return;
    }

    setJobTitle(duplicatedAnalysis.title);
    setCompany(duplicatedAnalysis.company);
    setSavedConfirmation(false);
  }

  function handleDelete(id: string): void {
    deleteAnalysis(id);
    setSavedConfirmation(false);
  }

  function handleClearAll(): void {
    clearAllAnalyses();
    setSavedConfirmation(false);
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <Save size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Save this ATS analysis
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  Store the current result in this browser so you can
                  compare vacancies and reload previous checks without
                  running another AI analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div>
              <label
                htmlFor="ats-history-job-title"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35"
              >
                Job title
              </label>

              <input
                id="ats-history-job-title"
                type="text"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(event.target.value);
                  setSavedConfirmation(false);
                }}
                placeholder="Machine Learning Engineer"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/60 focus:bg-black/30"
              />
            </div>

            <div>
              <label
                htmlFor="ats-history-company"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35"
              >
                Company
              </label>

              <div className="relative">
                <BriefcaseBusiness
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  id="ats-history-company"
                  type="text"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value);
                    setSavedConfirmation(false);
                  }}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/60 focus:bg-black/30"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-white/35">
            Saved analyses are stored locally in your browser and are
            limited to the 25 most recent results.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
              savedConfirmation
                ? "bg-emerald-500 hover:bg-emerald-500"
                : "bg-indigo-500 hover:bg-indigo-400"
            }`}
          >
            {savedConfirmation ? (
              <>
                <Check size={17} />
                Analysis saved
              </>
            ) : (
              <>
                <Save size={17} />
                Save analysis
              </>
            )}
          </button>
        </div>
      </section>

      <SavedAtsAnalysesPanel
        analyses={savedAnalyses}
        selectedAnalysisId={
          selectedAnalysisId
        }
        averageScore={averageScore}
        bestAnalysis={bestAnalysis}
        isHydrated={isHydrated}
        onSelect={handleSelect}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
    </div>
  );
}