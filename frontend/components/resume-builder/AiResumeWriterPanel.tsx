"use client";

import { useState } from "react";

import type {
  AiExperienceLevel,
  AiResumeSection,
  AiResumeWriterMode,
  AiWritingTone,
} from "@/lib/ai-resume/types";
import { useAiResumeWriter } from "@/lib/ai-resume/useAiResumeWriter";
import type { ResumeData } from "@/lib/resume/types";

type AiResumeWriterPanelProps = {
  resumeData: ResumeData;
  initialSection?: AiResumeSection;
  lockedSection?: AiResumeSection;
  existingContent?: string;
  onApplySuggestion: (content: string) => void;
};

const SECTION_OPTIONS: Array<{
  value: AiResumeSection;
  label: string;
}> = [
    {
      value: "professional-summary",
      label: "Professional summary",
    },
    {
      value: "work-experience",
      label: "Work experience",
    },
    {
      value: "project-description",
      label: "Project description",
    },
    {
      value: "skills",
      label: "Skills",
    },
  ];

const MODE_OPTIONS: Array<{
  value: AiResumeWriterMode;
  label: string;
  description: string;
}> = [
    {
      value: "generate",
      label: "Generate",
      description: "Create new resume content",
    },
    {
      value: "improve",
      label: "Improve",
      description: "Rewrite existing content",
    },
    {
      value: "tailor",
      label: "Tailor",
      description: "Match a target job",
    },
  ];

const TONE_OPTIONS: Array<{
  value: AiWritingTone;
  label: string;
}> = [
    {
      value: "professional",
      label: "Professional",
    },
    {
      value: "confident",
      label: "Confident",
    },
    {
      value: "concise",
      label: "Concise",
    },
    {
      value: "technical",
      label: "Technical",
    },
    {
      value: "leadership",
      label: "Leadership",
    },
  ];

const EXPERIENCE_LEVEL_OPTIONS: Array<{
  value: AiExperienceLevel;
  label: string;
}> = [
    {
      value: "student",
      label: "Student",
    },
    {
      value: "entry-level",
      label: "Entry level",
    },
    {
      value: "mid-level",
      label: "Mid level",
    },
    {
      value: "senior",
      label: "Senior",
    },
    {
      value: "executive",
      label: "Executive",
    },
  ];

export default function AiResumeWriterPanel({
  resumeData,
  initialSection = "professional-summary",
  lockedSection,
  existingContent = "",
  onApplySuggestion,
}: AiResumeWriterPanelProps) {
  const {
    suggestions,
    isGenerating,
    error,
    generateSuggestions,
    clearSuggestions,
    clearError,
  } = useAiResumeWriter();

  const [mode, setMode] =
    useState<AiResumeWriterMode>("generate");

  const [section, setSection] =
    useState<AiResumeSection>(
      lockedSection ?? initialSection,
    );

  const [tone, setTone] =
    useState<AiWritingTone>("professional");

  const [experienceLevel, setExperienceLevel] =
    useState<AiExperienceLevel>("student");

  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] =
    useState("");

  const [content, setContent] =
    useState(existingContent);

  const [additionalContext, setAdditionalContext] =
    useState("");

  const [appliedSuggestionId, setAppliedSuggestionId] =
    useState<string | null>(null);



  const requiresExistingContent = mode === "improve";
  const requiresJobDetails = mode === "tailor";

  const canGenerate =
    !isGenerating &&
    (!requiresExistingContent || content.trim().length > 0) &&
    (!requiresJobDetails ||
      (targetRole.trim().length > 0 &&
        jobDescription.trim().length > 0));
  function resetSuggestionState() {
    clearSuggestions();
    clearError();
    setAppliedSuggestionId(null);
  }

  function handleModeChange(nextMode: AiResumeWriterMode) {
    setMode(nextMode);
    resetSuggestionState();
  }

  function handleSectionChange(nextSection: AiResumeSection) {
    setSection(nextSection);
    resetSuggestionState();
  }
  async function handleGenerate() {
    setAppliedSuggestionId(null);

    await generateSuggestions({
      mode,
      section,
      tone,
      experienceLevel,
      targetRole,
      jobDescription,
      existingContent: content,
      additionalContext,
      resumeData,
    });
  }

  function handleApplySuggestion(
    suggestionId: string,
    suggestionContent: string,
  ) {
    onApplySuggestion(suggestionContent);
    setContent(suggestionContent);
    setAppliedSuggestionId(suggestionId);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-lg font-semibold text-white shadow-sm">
            AI
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              AI Resume Writer
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Generate, improve or tailor ATS-compatible
              resume content using your existing resume data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Writing mode
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MODE_OPTIONS.map((option) => {
              const isActive = mode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleModeChange(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${isActive
                      ? "border-violet-600 bg-violet-50 ring-2 ring-violet-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span
                    className={`block text-sm font-semibold ${isActive
                        ? "text-violet-700"
                        : "text-slate-900"
                      }`}
                  >
                    {option.label}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Resume section
            </span>

            {lockedSection ? (
              <div className="mt-2 flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700">
                {SECTION_OPTIONS.find(
                  (option) => option.value === lockedSection,
                )?.label ?? "Professional summary"}
              </div>
            ) : (
              <select
                value={section}
                onChange={(event) =>
                  handleSectionChange(
                    event.target.value as AiResumeSection,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                {SECTION_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Experience level
            </span>

            <select
              value={experienceLevel}
              onChange={(event) =>
                setExperienceLevel(
                  event.target.value as AiExperienceLevel,
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            >
              {EXPERIENCE_LEVEL_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Writing tone
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {TONE_OPTIONS.map((option) => {
              const isActive = tone === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTone(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {requiresJobDetails && (
          <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Target role
              </span>

              <input
                type="text"
                value={targetRole}
                onChange={(event) =>
                  setTargetRole(event.target.value)
                }
                placeholder="Example: Machine Learning Engineer"
                maxLength={120}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900">
                Job description
              </span>

              <textarea
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                placeholder="Paste the relevant job description here."
                rows={7}
                maxLength={12000}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <span className="mt-1 block text-right text-xs text-slate-500">
                {jobDescription.length.toLocaleString()} /
                12,000
              </span>
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            {requiresExistingContent
              ? "Content to improve"
              : "Existing content"}
          </span>

          <span className="ml-2 text-xs font-normal text-slate-500">
            {requiresExistingContent
              ? "Required"
              : "Optional"}
          </span>

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder={
              requiresExistingContent
                ? "Paste or select the resume content you want to improve."
                : "Add existing content when relevant."
            }
            rows={6}
            maxLength={8000}
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          <span className="mt-1 block text-right text-xs text-slate-500">
            {content.length.toLocaleString()} / 8,000
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            Additional context
          </span>

          <span className="ml-2 text-xs font-normal text-slate-500">
            Optional
          </span>

          <textarea
            value={additionalContext}
            onChange={(event) =>
              setAdditionalContext(event.target.value)
            }
            placeholder="Add achievements, technologies, responsibilities or measurable results that the AI should use."
            rows={4}
            maxLength={4000}
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isGenerating
            ? "Generating suggestions..."
            : "Generate three suggestions"}
        </button>

        {suggestions.length > 0 && (
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                AI suggestions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review each suggestion before applying it to
                your resume.
              </p>
            </div>

            <div className="space-y-4">
              {suggestions.map(
                (suggestion, index) => {
                  const isApplied =
                    appliedSuggestionId === suggestion.id;

                  return (
                    <article
                      key={suggestion.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                          Suggestion {index + 1}
                        </span>

                        {isApplied && (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Applied
                          </span>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {suggestion.content}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            suggestion.id,
                            suggestion.content,
                          )
                        }
                        className="mt-4 rounded-xl border border-violet-600 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                      >
                        {isApplied
                          ? "Applied to resume"
                          : "Apply suggestion"}
                      </button>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}