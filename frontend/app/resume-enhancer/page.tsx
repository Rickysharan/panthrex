"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import type {
  ResumeEnhancementResponse,
  ResumeEnhancementStatus,
  ResumeEnhancementSuggestion,
} from "@/lib/ai-resume-enhancer/types";

const ENHANCEMENTS_STORAGE_KEY =
  "panthrex-resume-enhancements";

const ACCEPTED_ENHANCEMENTS_STORAGE_KEY =
  "panthrex-accepted-enhancements";

type InitialEnhancementState = {
  enhancementData: ResumeEnhancementResponse | null;
  error: string;
};

function isEnhancementResponse(
  value: unknown,
): value is ResumeEnhancementResponse {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<ResumeEnhancementResponse>;

  return (
    Array.isArray(candidate.suggestions) &&
    Array.isArray(candidate.warnings) &&
    typeof candidate.targetRole === "string"
  );
}

function loadInitialEnhancementState(): InitialEnhancementState {
  if (typeof window === "undefined") {
    return {
      enhancementData: null,
      error: "",
    };
  }

  const storedEnhancements =
    window.sessionStorage.getItem(
      ENHANCEMENTS_STORAGE_KEY,
    );

  if (!storedEnhancements) {
    return {
      enhancementData: null,
      error:
        "No resume enhancement suggestions were found. Return to the Resume Builder and run the AI enhancer first.",
    };
  }

  try {
    const parsedEnhancements: unknown =
      JSON.parse(storedEnhancements);

    if (!isEnhancementResponse(parsedEnhancements)) {
      return {
        enhancementData: null,
        error:
          "The stored resume enhancement data is invalid. Please generate a new enhancement analysis.",
      };
    }

    return {
      enhancementData: parsedEnhancements,
      error: "",
    };
  } catch {
    return {
      enhancementData: null,
      error:
        "The stored resume enhancement data could not be read. Please generate a new enhancement analysis.",
    };
  }
}

function getSectionLabel(
  section: ResumeEnhancementSuggestion["section"],
) {
  switch (section) {
    case "professionalSummary":
      return "Professional Summary";
    case "workExperience":
      return "Work Experience";
    case "projects":
      return "Projects";
    case "skills":
      return "Skills";
    default:
      return "Resume";
  }
}

function getStatusClasses(
  status: ResumeEnhancementStatus,
) {
  switch (status) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

export default function ResumeEnhancerPage() {
  const router = useRouter();

  const [initialState] =
    useState<InitialEnhancementState>(
      loadInitialEnhancementState,
    );

  const [enhancementData, setEnhancementData] =
    useState<ResumeEnhancementResponse | null>(
      initialState.enhancementData,
    );

  const [error, setError] = useState(
    initialState.error,
  );

  const [copiedSuggestionId, setCopiedSuggestionId] =
    useState<string | null>(null);

  const [copiedAll, setCopiedAll] =
    useState(false);

  useEffect(() => {
    if (!enhancementData) {
      return;
    }

    window.sessionStorage.setItem(
      ENHANCEMENTS_STORAGE_KEY,
      JSON.stringify(enhancementData),
    );
  }, [enhancementData]);

  const suggestionCounts = useMemo(() => {
    if (!enhancementData) {
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
      };
    }

    return enhancementData.suggestions.reduce(
      (counts, suggestion) => {
        counts.total += 1;
        counts[suggestion.status] += 1;

        return counts;
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
      },
    );
  }, [enhancementData]);

  const acceptedSuggestions = useMemo(() => {
    if (!enhancementData) {
      return [];
    }

    return enhancementData.suggestions.filter(
      (suggestion) =>
        suggestion.status === "accepted",
    );
  }, [enhancementData]);

  function updateSuggestionStatus(
    suggestionId: string,
    status: ResumeEnhancementStatus,
  ) {
    setEnhancementData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        suggestions:
          currentData.suggestions.map(
            (suggestion) =>
              suggestion.id === suggestionId
                ? {
                    ...suggestion,
                    status,
                  }
                : suggestion,
          ),
      };
    });
  }

  function acceptAllSuggestions() {
    setEnhancementData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        suggestions:
          currentData.suggestions.map(
            (suggestion) => ({
              ...suggestion,
              status: "accepted",
            }),
          ),
      };
    });
  }

  function rejectAllSuggestions() {
    setEnhancementData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        suggestions:
          currentData.suggestions.map(
            (suggestion) => ({
              ...suggestion,
              status: "rejected",
            }),
          ),
      };
    });
  }

  function resetAllSuggestions() {
    setEnhancementData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        suggestions:
          currentData.suggestions.map(
            (suggestion) => ({
              ...suggestion,
              status: "pending",
            }),
          ),
      };
    });
  }

  async function copyText(
    text: string,
    suggestionId: string,
  ) {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedSuggestionId(suggestionId);

      window.setTimeout(() => {
        setCopiedSuggestionId((currentId) =>
          currentId === suggestionId
            ? null
            : currentId,
        );
      }, 1800);
    } catch {
      setError(
        "The improved text could not be copied. Please copy it manually.",
      );
    }
  }

  async function copyAcceptedSuggestions() {
    if (acceptedSuggestions.length === 0) {
      return;
    }

    const content = acceptedSuggestions
      .map(
        (suggestion) =>
          `${getSectionLabel(
            suggestion.section,
          )} — ${suggestion.field}\n\n${
            suggestion.improvedValue
          }`,
      )
      .join("\n\n--------------------------------\n\n");

    try {
      await navigator.clipboard.writeText(content);

      setCopiedAll(true);

      window.setTimeout(() => {
        setCopiedAll(false);
      }, 1800);
    } catch {
      setError(
        "The accepted suggestions could not be copied. Please copy them manually.",
      );
    }
  }

  function applyAcceptedSuggestions() {
    if (
      !enhancementData ||
      acceptedSuggestions.length === 0
    ) {
      return;
    }

    window.sessionStorage.setItem(
      ACCEPTED_ENHANCEMENTS_STORAGE_KEY,
      JSON.stringify(acceptedSuggestions),
    );

    window.sessionStorage.removeItem(
      ENHANCEMENTS_STORAGE_KEY,
    );

    router.push("/resume-builder");
  }

  function discardEnhancementAnalysis() {
    window.sessionStorage.removeItem(
      ENHANCEMENTS_STORAGE_KEY,
    );

    window.sessionStorage.removeItem(
      ACCEPTED_ENHANCEMENTS_STORAGE_KEY,
    );

    router.push("/resume-builder");
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-400">
                AI Resume Enhancer
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Review your AI improvements
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">
                Compare every recommendation with your
                original content, then accept only the
                changes you want applied to your resume.
              </p>
            </div>

            <Link
              href="/resume-builder"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Back to Resume Builder
            </Link>
          </header>

          {error ? (
            <section
              role="alert"
              className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm leading-6 text-red-200">
                {error}
              </p>

              {!enhancementData ? (
                <Link
                  href="/resume-builder"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Open Resume Builder
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-300/25 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-400/20"
                >
                  Dismiss
                </button>
              )}
            </section>
          ) : null}

          {enhancementData ? (
            <>
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/50">
                      Target role
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-white">
                      {enhancementData.targetRole ||
                        "General resume improvement"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {suggestionCounts.total}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-200/70">
                        Pending
                      </p>

                      <p className="mt-1 text-xl font-bold text-amber-100">
                        {suggestionCounts.pending}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/70">
                        Accepted
                      </p>

                      <p className="mt-1 text-xl font-bold text-emerald-100">
                        {suggestionCounts.accepted}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-red-200/70">
                        Rejected
                      </p>

                      <p className="mt-1 text-xl font-bold text-red-100">
                        {suggestionCounts.rejected}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={acceptAllSuggestions}
                    disabled={
                      enhancementData.suggestions.length ===
                      0
                    }
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Accept all
                  </button>

                  <button
                    type="button"
                    onClick={rejectAllSuggestions}
                    disabled={
                      enhancementData.suggestions.length ===
                      0
                    }
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject all
                  </button>

                  <button
                    type="button"
                    onClick={resetAllSuggestions}
                    disabled={
                      enhancementData.suggestions.length ===
                      0
                    }
                    className="rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset decisions
                  </button>
                </div>

                {enhancementData.warnings.length >
                0 ? (
                  <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                    <p className="text-sm font-semibold text-amber-100">
                      Analysis warnings
                    </p>

                    <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-100/75">
                      {enhancementData.warnings.map(
                        (warning, index) => (
                          <li
                            key={`${warning}-${index}`}
                            className="flex gap-2"
                          >
                            <span aria-hidden="true">
                              •
                            </span>

                            <span>{warning}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                ) : null}
              </section>

              {enhancementData.suggestions.length >
              0 ? (
                <section className="mt-6 space-y-5">
                  {enhancementData.suggestions.map(
                    (suggestion, index) => (
                      <article
                        key={suggestion.id}
                        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20"
                      >
                        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
                                {getSectionLabel(
                                  suggestion.section,
                                )}
                              </span>

                              <span className="text-xs text-white/30">
                                Suggestion {index + 1}
                              </span>
                            </div>

                            <h3 className="mt-2 text-lg font-bold capitalize text-white">
                              {suggestion.field.replace(
                                /([A-Z])/g,
                                " $1",
                              )}
                            </h3>
                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
                              suggestion.status,
                            )}`}
                          >
                            {suggestion.status}
                          </span>
                        </div>

                        <div className="grid gap-px bg-white/10 lg:grid-cols-2">
                          <div className="bg-[#0a0e1d] p-5 sm:p-6">
                            <p className="text-sm font-semibold text-red-300">
                              Original
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/55">
                              {suggestion.originalValue ||
                                "No original content"}
                            </p>
                          </div>

                          <div className="bg-[#08150f] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-emerald-300">
                                Improved
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  copyText(
                                    suggestion.improvedValue,
                                    suggestion.id,
                                  )
                                }
                                className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/20"
                              >
                                {copiedSuggestionId ===
                                suggestion.id
                                  ? "Copied"
                                  : "Copy"}
                              </button>
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-emerald-50/80">
                              {suggestion.improvedValue}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-sm font-semibold text-white">
                              Why this is better
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/55">
                              {suggestion.explanation}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap justify-end gap-3">
                            {suggestion.status !==
                            "pending" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  updateSuggestionStatus(
                                    suggestion.id,
                                    "pending",
                                  )
                                }
                                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                              >
                                Reset
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() =>
                                updateSuggestionStatus(
                                  suggestion.id,
                                  "rejected",
                                )
                              }
                              aria-pressed={
                                suggestion.status ===
                                "rejected"
                              }
                              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                suggestion.status ===
                                "rejected"
                                  ? "border-red-400/40 bg-red-500/20 text-red-100"
                                  : "border-white/15 bg-white/5 text-white/70 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-100"
                              }`}
                            >
                              {suggestion.status ===
                              "rejected"
                                ? "Rejected"
                                : "Reject"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateSuggestionStatus(
                                  suggestion.id,
                                  "accepted",
                                )
                              }
                              aria-pressed={
                                suggestion.status ===
                                "accepted"
                              }
                              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                suggestion.status ===
                                "accepted"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-emerald-600 text-white hover:bg-emerald-500"
                              }`}
                            >
                              {suggestion.status ===
                              "accepted"
                                ? "Accepted"
                                : "Accept"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </section>
              ) : (
                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                  <h2 className="text-xl font-bold text-white">
                    No suggestions generated
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">
                    The enhancer did not return any
                    actionable resume changes. Return to
                    the Resume Builder, review the resume
                    content and try again.
                  </p>

                  <Link
                    href="/resume-builder"
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    Return to Resume Builder
                  </Link>
                </section>
              )}

              <section className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-white/15 bg-[#0b1020]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {suggestionCounts.accepted} suggestion
                      {suggestionCounts.accepted === 1
                        ? ""
                        : "s"}{" "}
                      selected
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      Accepted improvements will be applied
                      automatically when you return to the
                      Resume Builder.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={discardEnhancementAnalysis}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                    >
                      Discard analysis
                    </button>

                    <button
                      type="button"
                      onClick={copyAcceptedSuggestions}
                      disabled={
                        acceptedSuggestions.length === 0
                      }
                      className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedAll
                        ? "Copied accepted"
                        : "Copy accepted"}
                    </button>

                    <button
                      type="button"
                      onClick={applyAcceptedSuggestions}
                      disabled={
                        acceptedSuggestions.length === 0
                      }
                      className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-white/35"
                    >
                      Apply accepted suggestions
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  );
}