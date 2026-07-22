"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AiWriterMode = "generate" | "improve" | "tailor";

type AiResumeSection =
  | "professional-summary"
  | "work-experience"
  | "project-description"
  | "skills";

type AiWritingTone =
  | "professional"
  | "confident"
  | "concise"
  | "technical"
  | "leadership";

type AiExperienceLevel =
  | "student"
  | "entry-level"
  | "mid-level"
  | "senior"
  | "executive";

type AiResumeSuggestion = {
  id: string;
  content: string;
};

type AiResumeWriterResponse = {
  suggestions: AiResumeSuggestion[];
};

type AiResumeWriterErrorResponse = {
  error?: string;
  details?: string;
};

const writerModes: Array<{
  value: AiWriterMode;
  title: string;
  description: string;
}> = [
  {
    value: "generate",
    title: "Generate",
    description: "Create new resume content using your background and context.",
  },
  {
    value: "improve",
    title: "Improve",
    description: "Rewrite existing content with stronger, ATS-friendly language.",
  },
  {
    value: "tailor",
    title: "Tailor",
    description: "Optimise content for a specific role and job description.",
  },
];

const resumeSections: Array<{
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

const writingTones: Array<{
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

const experienceLevels: Array<{
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

const emptyResumeData = {
  title: "AI Resume Draft",
  template: "modern",
  personalDetails: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    website: "",
    professionalSummary: "",
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

export default function AiResumePage() {
  const [mode, setMode] = useState<AiWriterMode>("generate");
  const [section, setSection] =
    useState<AiResumeSection>("professional-summary");
  const [tone, setTone] =
    useState<AiWritingTone>("professional");
  const [experienceLevel, setExperienceLevel] =
    useState<AiExperienceLevel>("student");

  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [existingContent, setExistingContent] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  const [suggestions, setSuggestions] = useState<
    AiResumeSuggestion[]
  >([]);
  const [copiedSuggestionId, setCopiedSuggestionId] =
    useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuggestions([]);
    setCopiedSuggestionId(null);

    const trimmedTargetRole = targetRole.trim();
    const trimmedJobDescription = jobDescription.trim();
    const trimmedExistingContent = existingContent.trim();
    const trimmedAdditionalContext = additionalContext.trim();

    if (mode === "improve" && !trimmedExistingContent) {
      setError(
        "Add the existing resume content you want Panthrex to improve.",
      );
      return;
    }

    if (mode === "tailor" && !trimmedTargetRole) {
      setError(
        "Enter a target role before tailoring resume content.",
      );
      return;
    }

    if (mode === "tailor" && !trimmedJobDescription) {
      setError(
        "Paste the job description before tailoring resume content.",
      );
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai-resume-writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          section,
          tone,
          experienceLevel,
          targetRole: trimmedTargetRole,
          jobDescription: trimmedJobDescription,
          existingContent: trimmedExistingContent,
          additionalContext: trimmedAdditionalContext,
          resumeData: emptyResumeData,
        }),
      });

      const responseData = (await response.json()) as
        | AiResumeWriterResponse
        | AiResumeWriterErrorResponse;

      if (!response.ok) {
        const errorResponse =
          responseData as AiResumeWriterErrorResponse;

        throw new Error(
          errorResponse.details
            ? `${errorResponse.error ?? "Request failed"} ${errorResponse.details}`
            : errorResponse.error ??
                "Unable to generate resume suggestions.",
        );
      }

      const successResponse =
        responseData as AiResumeWriterResponse;

      if (
        !Array.isArray(successResponse.suggestions) ||
        successResponse.suggestions.length !== 3
      ) {
        throw new Error(
          "The AI service did not return three valid suggestions.",
        );
      }

      setSuggestions(successResponse.suggestions);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "An unexpected error occurred while generating content.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy(suggestion: AiResumeSuggestion) {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      setCopiedSuggestionId(suggestion.id);

      window.setTimeout(() => {
        setCopiedSuggestionId((currentId) =>
          currentId === suggestion.id ? null : currentId,
        );
      }, 2000);
    } catch {
      setError(
        "The suggestion could not be copied automatically.",
      );
    }
  }

  function handleClear() {
    setMode("generate");
    setSection("professional-summary");
    setTone("professional");
    setExperienceLevel("student");
    setTargetRole("");
    setJobDescription("");
    setExistingContent("");
    setAdditionalContext("");
    setSuggestions([]);
    setCopiedSuggestionId(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back to dashboard
            </Link>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Resume Writer
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Generate three ATS-focused resume suggestions tailored
              to your experience, target role and preferred writing
              style.
            </p>
          </div>

          <Link
            href="/resume-builder"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
          >
            Open Resume Builder
          </Link>
        </header>

        <form onSubmit={handleGenerate}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Step 1
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Choose the writing mode
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {writerModes.map((writerMode) => {
                    const isSelected = mode === writerMode.value;

                    return (
                      <button
                        key={writerMode.value}
                        type="button"
                        onClick={() => setMode(writerMode.value)}
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-cyan-400/60 bg-cyan-400/10"
                            : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-white/[0.045]"
                        }`}
                      >
                        <span
                          className={`block text-sm font-semibold ${
                            isSelected
                              ? "text-cyan-200"
                              : "text-white"
                          }`}
                        >
                          {writerMode.title}
                        </span>

                        <span className="mt-2 block text-xs leading-5 text-slate-400">
                          {writerMode.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Step 2
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Configure the output
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="section"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Resume section
                    </label>

                    <select
                      id="section"
                      value={section}
                      onChange={(event) =>
                        setSection(
                          event.target.value as AiResumeSection,
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      {resumeSections.map((resumeSection) => (
                        <option
                          key={resumeSection.value}
                          value={resumeSection.value}
                        >
                          {resumeSection.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tone"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Writing tone
                    </label>

                    <select
                      id="tone"
                      value={tone}
                      onChange={(event) =>
                        setTone(
                          event.target.value as AiWritingTone,
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      {writingTones.map((writingTone) => (
                        <option
                          key={writingTone.value}
                          value={writingTone.value}
                        >
                          {writingTone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="experience-level"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Experience level
                    </label>

                    <select
                      id="experience-level"
                      value={experienceLevel}
                      onChange={(event) =>
                        setExperienceLevel(
                          event.target
                            .value as AiExperienceLevel,
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      {experienceLevels.map((level) => (
                        <option
                          key={level.value}
                          value={level.value}
                        >
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Step 3
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Add your information
                </h2>

                <div className="mt-5 space-y-5">
                  <div>
                    <label
                      htmlFor="target-role"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Target role
                      {mode !== "tailor" ? (
                        <span className="ml-2 font-normal text-slate-500">
                          Optional
                        </span>
                      ) : null}
                    </label>

                    <input
                      id="target-role"
                      type="text"
                      value={targetRole}
                      onChange={(event) =>
                        setTargetRole(event.target.value)
                      }
                      maxLength={120}
                      placeholder="Example: Machine Learning Engineer"
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="job-description"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Job description
                        {mode !== "tailor" ? (
                          <span className="ml-2 font-normal text-slate-500">
                            Optional
                          </span>
                        ) : null}
                      </label>

                      <span className="text-xs text-slate-500">
                        {jobDescription.length.toLocaleString()} /
                        12,000
                      </span>
                    </div>

                    <textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(event) =>
                        setJobDescription(event.target.value)
                      }
                      maxLength={12000}
                      rows={7}
                      placeholder="Paste the target job description here."
                      className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="existing-content"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Existing resume content
                        {mode !== "improve" ? (
                          <span className="ml-2 font-normal text-slate-500">
                            Optional
                          </span>
                        ) : null}
                      </label>

                      <span className="text-xs text-slate-500">
                        {existingContent.length.toLocaleString()} /
                        8,000
                      </span>
                    </div>

                    <textarea
                      id="existing-content"
                      value={existingContent}
                      onChange={(event) =>
                        setExistingContent(event.target.value)
                      }
                      maxLength={8000}
                      rows={10}
                      placeholder="Paste the summary, experience, project or skills content you want to generate, improve or tailor."
                      className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="additional-context"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Additional context
                        <span className="ml-2 font-normal text-slate-500">
                          Optional
                        </span>
                      </label>

                      <span className="text-xs text-slate-500">
                        {additionalContext.length.toLocaleString()} /
                        4,000
                      </span>
                    </div>

                    <textarea
                      id="additional-context"
                      value={additionalContext}
                      onChange={(event) =>
                        setAdditionalContext(event.target.value)
                      }
                      maxLength={4000}
                      rows={6}
                      placeholder="Add achievements, technologies, metrics, responsibilities or other relevant details."
                      className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
                  >
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={isGenerating}
                    className="min-h-11 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear form
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
                        />
                        Generating suggestions...
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">✦</span>
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
                <div className="border-b border-white/10 bg-slate-900/70 px-5 py-4 sm:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    AI output
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Three resume suggestions
                  </h2>
                </div>

                <div className="min-h-[680px] p-5 sm:p-6">
                  {isGenerating ? (
                    <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
                      <div className="relative mb-5 h-14 w-14">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300" />
                        <div className="absolute inset-[10px] rounded-full bg-cyan-400/10" />
                      </div>

                      <h3 className="font-semibold text-white">
                        Generating three suggestions
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        Panthrex is analysing your information and
                        preparing alternative resume versions.
                      </p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-5">
                      {suggestions.map((suggestion, index) => (
                        <article
                          key={suggestion.id}
                          className="rounded-xl border border-white/10 bg-slate-950/40"
                        >
                          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                            <h3 className="text-sm font-semibold text-cyan-200">
                              Suggestion {index + 1}
                            </h3>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(suggestion)
                              }
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                            >
                              {copiedSuggestionId === suggestion.id
                                ? "Copied ✓"
                                : "Copy"}
                            </button>
                          </div>

                          <div className="whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-200">
                            {suggestion.content}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[620px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-6 text-center">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl text-cyan-200">
                        ✦
                      </div>

                      <h3 className="font-semibold text-white">
                        Your suggestions will appear here
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        Configure the writer, add your information and
                        generate three alternative resume suggestions.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 px-2 text-center text-xs leading-5 text-slate-500">
                Review every AI-generated claim and keep all resume
                information accurate and verifiable.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}