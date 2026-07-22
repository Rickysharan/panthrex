"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ResumeEnhancementResponse,
  ResumeEnhancementSuggestion,
} from "@/lib/ai-resume-enhancer/types";

type InitialEnhancementState = {
  enhancementData: ResumeEnhancementResponse | null;
  error: string;
};

function loadInitialEnhancementState(): InitialEnhancementState {
  if (typeof window === "undefined") {
    return {
      enhancementData: null,
      error: "",
    };
  }

  const storedEnhancements = window.sessionStorage.getItem(
    "panthrex-resume-enhancements",
  );

  if (!storedEnhancements) {
    return {
      enhancementData: null,
      error: "No resume enhancement suggestions were found.",
    };
  }

  try {
    const parsedEnhancements = JSON.parse(
      storedEnhancements,
    ) as ResumeEnhancementResponse;

    return {
      enhancementData: parsedEnhancements,
      error: "",
    };
  } catch {
    return {
      enhancementData: null,
      error: "The stored resume enhancement data is invalid.",
    };
  }
}

export default function ResumeEnhancerPage() {
  const router = useRouter();

  const [initialState] = useState<InitialEnhancementState>(
    loadInitialEnhancementState,
  );

  const [enhancementData, setEnhancementData] =
    useState<ResumeEnhancementResponse | null>(
      initialState.enhancementData,
    );

  const error = initialState.error;

  function updateSuggestionStatus(
    suggestionId: string,
    status: ResumeEnhancementSuggestion["status"],
  ) {
    setEnhancementData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        suggestions: currentData.suggestions.map((suggestion) =>
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
        suggestions: currentData.suggestions.map((suggestion) => ({
          ...suggestion,
          status: "accepted",
        })),
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
        suggestions: currentData.suggestions.map((suggestion) => ({
          ...suggestion,
          status: "rejected",
        })),
      };
    });
  }

  function applyAcceptedSuggestions() {
    if (!enhancementData) {
      return;
    }

    const acceptedSuggestions = enhancementData.suggestions.filter(
      (suggestion) => suggestion.status === "accepted",
    );

    window.sessionStorage.setItem(
      "panthrex-accepted-enhancements",
      JSON.stringify(acceptedSuggestions),
    );

    window.sessionStorage.removeItem(
      "panthrex-resume-enhancements",
    );

    router.push("/resume-builder");
  }
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              AI Resume Enhancer
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Review AI suggestions
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Accept or reject each suggested improvement before applying it to
              your resume.
            </p>
          </div>

          <Link
            href="/resume-builder"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
          >
            Back to Resume Builder
          </Link>
        </div>

        {error ? (
          <section
            role="alert"
            className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
          >
            {error}
          </section>
        ) : null}

        {enhancementData ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Target role
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {enhancementData.targetRole ||
                      "General resume improvement"}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={rejectAllSuggestions}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reject all
                  </button>

                  <button
                    type="button"
                    onClick={acceptAllSuggestions}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Accept all
                  </button>
                </div>
              </div>

              {enhancementData.warnings.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Warnings
                  </p>

                  <ul className="mt-2 space-y-1 text-sm text-amber-800">
                    {enhancementData.warnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <section className="mt-6 space-y-5">
              {enhancementData.suggestions.map((suggestion) => (
                <article
                  key={suggestion.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
                        {suggestion.section}
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-slate-950">
                        {suggestion.field}
                      </h3>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700">
                      {suggestion.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-900">
                        Original
                      </p>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-800">
                        {suggestion.originalValue || "No original content"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-900">
                        Improved
                      </p>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-emerald-800">
                        {suggestion.improvedValue}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Why this is better
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {suggestion.explanation}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateSuggestionStatus(
                          suggestion.id,
                          "rejected",
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSuggestionStatus(
                          suggestion.id,
                          "accepted",
                        )
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={applyAcceptedSuggestions}
                disabled={
                  !enhancementData.suggestions.some(
                    (suggestion) =>
                      suggestion.status === "accepted",
                  )
                }
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Apply accepted suggestions
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}