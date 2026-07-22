"use client";

import {
  useMemo,
  useState,
} from "react";

import SavedJobMatchesPanel from "@/components/job-matching/SavedJobMatchesPanel";
import type {
  JobMatchCategoryScore,
  JobMatchError,
  JobMatchResponse,
  JobMatchResult,
  JobMatchSkill,
  JobMatchSuggestion,
} from "@/lib/job-matching/types";
import {
  type SavedJobMatch,
  useJobMatching,
} from "@/lib/job-matching/useJobMatching";
import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";

export default function JobMatchingPage() {
  const { resumeData } = useResumeBuilder();

  const {
    savedMatches,
    selectedMatchId,
    averageScore,
    bestMatch,
    setSelectedMatchId,
    saveMatch,
    deleteMatch,
    duplicateMatch,
    clearAllMatches,
  } = useJobMatching();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] =
    useState("");
  const [result, setResult] =
    useState<JobMatchResult | null>(null);
  const [isAnalysing, setIsAnalysing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const characterCount = jobDescription.length;

  const canAnalyse = useMemo(
    () =>
      jobDescription.trim().length >= 50 &&
      !isAnalysing,
    [jobDescription, isAnalysing],
  );

  async function analyseJobMatch(): Promise<void> {
    const normalizedJobDescription =
      jobDescription.trim();

    if (normalizedJobDescription.length < 50) {
      setErrorMessage(
        "Paste a job description containing at least 50 characters.",
      );

      return;
    }

    setIsAnalysing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/job-matching",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeData,
            jobDescription:
              normalizedJobDescription,
          }),
        },
      );

      const data = (await response.json()) as
        | JobMatchResponse
        | JobMatchError;

      if (!response.ok || !data.success) {
        throw new Error(
          "error" in data
            ? data.error
            : "Unable to analyse the job match.",
        );
      }

      setResult(data.result);
      setSelectedMatchId(null);
    } catch (error) {
      setResult(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while analysing the job match.",
      );
    } finally {
      setIsAnalysing(false);
    }
  }

  function saveCurrentAnalysis(): void {
    if (!result) {
      setErrorMessage(
        "Run a job-match analysis before saving.",
      );

      return;
    }

    if (!jobDescription.trim()) {
      setErrorMessage(
        "A job description is required before saving.",
      );

      return;
    }

    const savedMatch = saveMatch({
      title:
        jobTitle.trim() ||
        company.trim() ||
        "Untitled job match",
      company,
      jobDescription,
      result,
    });

    setSelectedMatchId(savedMatch.id);
    setErrorMessage("");
    setSuccessMessage("Analysis saved successfully.");
  }

  function loadSavedMatch(
    match: SavedJobMatch,
  ): void {
    setJobTitle(match.title);
    setCompany(match.company ?? "");
    setJobDescription(match.jobDescription);
    setResult(match.result);
    setSelectedMatchId(match.id);
    setErrorMessage("");
    setSuccessMessage(
      `Loaded ${match.title}.`,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function duplicateSavedMatch(
    id: string,
  ): void {
    const duplicated = duplicateMatch(id);

    if (!duplicated) {
      setErrorMessage(
        "Unable to duplicate the selected analysis.",
      );

      return;
    }

    loadSavedMatch(duplicated);

    setSuccessMessage(
      "Analysis duplicated successfully.",
    );
  }

  function deleteSavedMatch(id: string): void {
    deleteMatch(id);

    if (selectedMatchId === id) {
      setSelectedMatchId(null);
    }

    setSuccessMessage(
      "Saved analysis deleted.",
    );
  }

  function clearSavedMatches(): void {
    const shouldClear = window.confirm(
      "Delete all saved job-match analyses? This action cannot be undone.",
    );

    if (!shouldClear) {
      return;
    }

    clearAllMatches();
    setSuccessMessage(
      "All saved analyses were deleted.",
    );
  }

  function clearWorkspace(): void {
    setJobTitle("");
    setCompany("");
    setJobDescription("");
    setResult(null);
    setSelectedMatchId(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Panthrex Job Intelligence
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Job Match Analysis
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Compare your current resume against a job
            description, identify ATS gaps and save
            analyses for future applications.
          </p>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
          <div className="self-start rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7 xl:sticky xl:top-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Job details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add identifying details and paste the
                complete vacancy description.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="job-title"
                label="Job title"
                value={jobTitle}
                placeholder="Software Engineer"
                onChange={(value) => {
                  setJobTitle(value);
                  setSuccessMessage("");
                }}
              />

              <Field
                id="company"
                label="Company"
                value={company}
                placeholder="Company name"
                onChange={(value) => {
                  setCompany(value);
                  setSuccessMessage("");
                }}
              />
            </div>

            <label
              htmlFor="job-description"
              className="mb-2 mt-5 block text-sm font-medium text-slate-200"
            >
              Vacancy details
            </label>

            <textarea
              id="job-description"
              rows={18}
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(
                  event.target.value,
                );
                setErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Paste the complete job description here..."
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
            />

            <div className="mt-2 flex items-center justify-between gap-4 text-xs">
              <span
                className={
                  characterCount >= 50
                    ? "text-emerald-400"
                    : "text-slate-500"
                }
              >
                Minimum 50 characters
              </span>

              <span className="text-slate-500">
                {characterCount} characters
              </span>
            </div>

            {errorMessage ? (
              <Message
                type="error"
                message={errorMessage}
              />
            ) : null}

            {successMessage ? (
              <Message
                type="success"
                message={successMessage}
              />
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={clearWorkspace}
                disabled={isAnalysing}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear workspace
              </button>

              <button
                type="button"
                onClick={analyseJobMatch}
                disabled={!canAnalyse}
                className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalysing
                  ? "Analysing..."
                  : result
                    ? "Analyse again"
                    : "Analyse job match"}
              </button>
            </div>

            {result ? (
              <button
                type="button"
                onClick={saveCurrentAnalysis}
                className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/15"
              >
                Save analysis
              </button>
            ) : null}

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">
                Resume source
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This analysis uses the resume currently
                stored in your Panthrex Resume Builder.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            {isAnalysing ? (
              <LoadingPanel />
            ) : result ? (
              <JobMatchResults result={result} />
            ) : (
              <EmptyResults />
            )}
          </div>
        </section>

        <section className="mt-8">
          <SavedJobMatchesPanel
            savedMatches={savedMatches}
            selectedMatchId={selectedMatchId}
            averageScore={averageScore}
            bestMatch={bestMatch}
            onLoad={loadSavedMatch}
            onDuplicate={duplicateSavedMatch}
            onDelete={deleteSavedMatch}
            onClearAll={clearSavedMatches}
          />
        </section>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
      />
    </div>
  );
}

function Message({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={
        type === "error"
          ? "mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
          : "mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200"
      }
    >
      {message}
    </div>
  );
}

function EmptyResults() {
  return (
    <section className="flex min-h-[540px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <div className="max-w-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-2xl">
          ◎
        </div>

        <h2 className="mt-6 text-2xl font-bold">
          Your match analysis will appear here
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Add a job description and Panthrex will
          evaluate ATS compatibility, skills alignment,
          interview readiness and the most important
          resume improvements.
        </p>
      </div>
    </section>
  );
}

function LoadingPanel() {
  return (
    <section className="min-h-[540px] rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
      <div className="animate-pulse">
        <div className="h-7 w-56 rounded bg-slate-800" />
        <div className="mt-4 h-4 w-full rounded bg-slate-800" />
        <div className="mt-2 h-4 w-4/5 rounded bg-slate-800" />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-40 rounded-2xl bg-slate-800"
              />
            ),
          )}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-slate-800" />
          <div className="h-72 rounded-2xl bg-slate-800" />
        </div>
      </div>
    </section>
  );
}

function JobMatchResults({
  result,
}: {
  result: JobMatchResult;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Analysis complete
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Job match overview
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {result.summary}
            </p>
          </div>

          <ScoreRing
            label="Overall match"
            score={result.overallScore}
            size="large"
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ScoreCard
          title="Overall match"
          score={result.overallScore}
          description="Combined suitability across all criteria."
        />

        <ScoreCard
          title="ATS compatibility"
          score={result.atsScore}
          description="Resume alignment with keywords and structure."
        />

        <ScoreCard
          title="Interview readiness"
          score={result.interviewReadiness}
          description="Estimated readiness to discuss this role."
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
        <SectionHeader
          title="Category breakdown"
          description="Detailed scores across the principal hiring criteria."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.categoryScores.map(
            (category) => (
              <CategoryScore
                key={category.name}
                category={category}
              />
            ),
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SkillPanel
          title="Matched skills"
          description="Skills supported by evidence in your resume."
          skills={result.matchedSkills}
          emptyMessage="No directly matched skills were identified."
          matched
        />

        <SkillPanel
          title="Missing skills"
          description="Important vacancy requirements not evidenced in your resume."
          skills={result.missingSkills}
          emptyMessage="No material skill gaps were identified."
          matched={false}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TextListPanel
          title="Candidate strengths"
          description="Resume evidence that improves your suitability."
          items={result.strengths}
          emptyMessage="No specific strengths were returned."
        />

        <TextListPanel
          title="Weaknesses and gaps"
          description="Issues that may reduce ATS or recruiter alignment."
          items={result.weaknesses}
          emptyMessage="No significant weaknesses were returned."
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
        <SectionHeader
          title="Recommended ATS keywords"
          description="Use only keywords that accurately reflect your real experience."
        />

        {result.keywordSuggestions.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {result.keywordSuggestions.map(
              (keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-200"
                >
                  {keyword}
                </span>
              ),
            )}
          </div>
        ) : (
          <EmptyMessage>
            No keyword suggestions were returned.
          </EmptyMessage>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
        <SectionHeader
          title="Resume improvements"
          description="Prioritised actions to improve alignment before applying."
        />

        {result.resumeImprovements.length > 0 ? (
          <div className="mt-6 space-y-4">
            {result.resumeImprovements.map(
              (suggestion, index) => (
                <ImprovementCard
                  key={`${suggestion.title}-${index}`}
                  suggestion={suggestion}
                  index={index}
                />
              ),
            )}
          </div>
        ) : (
          <EmptyMessage>
            No resume improvements were returned.
          </EmptyMessage>
        )}
      </section>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">
            {title}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <ScoreRing
          label={title}
          score={score}
          size="small"
        />
      </div>
    </article>
  );
}

function ScoreRing({
  label,
  score,
  size,
}: {
  label: string;
  score: number;
  size: "small" | "large";
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Math.round(score)),
  );

  const diameter =
    size === "large" ? 132 : 72;

  const strokeWidth =
    size === "large" ? 10 : 7;

  const radius =
    (diameter - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (safeScore / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: diameter,
        height: diameter,
      }}
      aria-label={`${label}: ${safeScore}%`}
    >
      <svg
        width={diameter}
        height={diameter}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />

        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-cyan-400 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            size === "large"
              ? "text-3xl font-bold"
              : "text-lg font-bold"
          }
        >
          {safeScore}
          <span
            className={
              size === "large"
                ? "text-base text-slate-400"
                : "text-xs text-slate-400"
            }
          >
            %
          </span>
        </span>
      </div>
    </div>
  );
}

function CategoryScore({
  category,
}: {
  category: JobMatchCategoryScore;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Math.round(category.score)),
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-300">
          {category.name}
        </span>

        <span className="text-sm font-semibold text-white">
          {safeScore}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

function SkillPanel({
  title,
  description,
  skills,
  emptyMessage,
  matched,
}: {
  title: string;
  description: string;
  skills: JobMatchSkill[];
  emptyMessage: string;
  matched: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <SectionHeader
        title={title}
        description={description}
      />

      {skills.length > 0 ? (
        <div className="mt-6 space-y-3">
          {skills.map((skill) => (
            <div
              key={`${title}-${skill.name}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={
                    matched
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400"
                      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm text-amber-400"
                  }
                >
                  {matched ? "✓" : "!"}
                </span>

                <span className="truncate text-sm font-medium text-slate-200">
                  {skill.name}
                </span>
              </div>

              <ImportanceBadge
                importance={skill.importance}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyMessage>{emptyMessage}</EmptyMessage>
      )}
    </section>
  );
}

function ImportanceBadge({
  importance,
}: {
  importance: JobMatchSkill["importance"];
}) {
  return (
    <span
      className={
        importance === "required"
          ? "shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium capitalize text-red-300"
          : "shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium capitalize text-slate-300"
      }
    >
      {importance}
    </span>
  );
}

function TextListPanel({
  title,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  description: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <SectionHeader
        title={title}
        description={description}
      />

      {items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex gap-3 text-sm leading-7 text-slate-300"
            >
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyMessage>{emptyMessage}</EmptyMessage>
      )}
    </section>
  );
}

function ImprovementCard({
  suggestion,
  index,
}: {
  suggestion: JobMatchSuggestion;
  index: number;
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-sm font-semibold text-cyan-400">
            {index + 1}
          </span>

          <div>
            <h3 className="font-semibold text-white">
              {suggestion.title}
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              {suggestion.description}
            </p>
          </div>
        </div>

        <PriorityBadge
          priority={suggestion.priority}
        />
      </div>
    </article>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: JobMatchSuggestion["priority"];
}) {
  const className =
    priority === "high"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : priority === "medium"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : "border-slate-700 bg-slate-800 text-slate-300";

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {priority} priority
    </span>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function EmptyMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}