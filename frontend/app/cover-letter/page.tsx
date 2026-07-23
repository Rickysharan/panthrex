"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  Download,
  LoaderCircle,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  CoverLetterApiError,
  CoverLetterApiResponse,
  CoverLetterLength,
  CoverLetterTone,
  GeneratedCoverLetter,
} from "@/lib/ai-cover-letter/types";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";
import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";

const toneOptions: Array<{
  value: CoverLetterTone;
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
    value: "enthusiastic",
    label: "Enthusiastic",
  },
  {
    value: "technical",
    label: "Technical",
  },
];

const lengthOptions: Array<{
  value: CoverLetterLength;
  label: string;
}> = [
  {
    value: "short",
    label: "Short",
  },
  {
    value: "standard",
    label: "Standard",
  },
  {
    value: "detailed",
    label: "Detailed",
  },
];

const STORAGE_KEY =
  "panthrex-generated-cover-letters";

function readStoredCoverLetters(): GeneratedCoverLetter[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (
        item,
      ): item is GeneratedCoverLetter =>
        Boolean(
          item &&
            typeof item === "object" &&
            "id" in item &&
            "content" in item,
        ),
    );
  } catch (error) {
    console.error(
      "Failed to read saved cover letters:",
      error,
    );

    return [];
  }
}

function saveCoverLetter(
  coverLetter: GeneratedCoverLetter,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const existingLetters =
      readStoredCoverLetters();

    const updatedLetters = [
      coverLetter,
      ...existingLetters.filter(
        (item) => item.id !== coverLetter.id,
      ),
    ];

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLetters),
    );
  } catch (error) {
    console.error(
      "Failed to save cover letter locally:",
      error,
    );
  }
}

function CoverLetterPageContent() {
  const searchParams = useSearchParams();

  const applicationId =
    searchParams.get("applicationId");

  const { resumeData } = useResumeBuilder();

  const {
    applications,
    updateApplication,
    isLoaded: isJobTrackerLoaded,
  } = useJobTracker();

  const linkedApplication = useMemo(
    () =>
      applicationId
        ? applications.find(
            (application) =>
              application.id === applicationId,
          ) ?? null
        : null,
    [applicationId, applications],
  );

  const [companyName, setCompanyName] =
    useState("");

  const [
    hiringManagerName,
    setHiringManagerName,
  ] = useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [
    additionalContext,
    setAdditionalContext,
  ] = useState("");

  const [tone, setTone] =
    useState<CoverLetterTone>("professional");

  const [length, setLength] =
    useState<CoverLetterLength>("standard");

  const [
    generatedLetter,
    setGeneratedLetter,
  ] =
    useState<GeneratedCoverLetter | null>(
      null,
    );

  const [warnings, setWarnings] =
    useState<string[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const hasPrefilledApplication =
    useRef(false);

  const candidateName = useMemo(
    () =>
      resumeData.personalDetails.fullName.trim() ||
      "Your resume profile",
    [resumeData.personalDetails.fullName],
  );

  useEffect(() => {
    hasPrefilledApplication.current = false;
  }, [applicationId]);

  useEffect(() => {
    if (
      !isJobTrackerLoaded ||
      !linkedApplication ||
      hasPrefilledApplication.current
    ) {
      return;
    }

    setCompanyName(
      linkedApplication.companyName ?? "",
    );

    setJobTitle(
      linkedApplication.jobTitle ?? "",
    );

    setHiringManagerName(
      linkedApplication.recruiterName ?? "",
    );

    setJobDescription(
      linkedApplication.jobDescription ?? "",
    );

    if (linkedApplication.coverLetterId) {
      const storedLetter =
        readStoredCoverLetters().find(
          (letter) =>
            letter.id ===
            linkedApplication.coverLetterId,
        );

      if (storedLetter) {
        setGeneratedLetter(storedLetter);
      }
    }

    hasPrefilledApplication.current = true;
  }, [isJobTrackerLoaded, linkedApplication]);

  const canGenerate =
    companyName.trim().length > 0 &&
    jobTitle.trim().length > 0 &&
    jobDescription.trim().length >= 50 &&
    !isGenerating;

  async function handleGenerate(): Promise<void> {
    if (!canGenerate) {
      setErrorMessage(
        "Enter the company name, job title and a job description of at least 50 characters.",
      );

      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");
    setWarnings([]);
    setCopied(false);

    try {
      const response = await fetch(
        "/api/ai-cover-letter",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            resume: resumeData,
            companyName:
              companyName.trim(),
            hiringManagerName:
              hiringManagerName.trim() ||
              undefined,
            jobTitle: jobTitle.trim(),
            jobDescription:
              jobDescription.trim(),
            tone,
            length,
            additionalContext:
              additionalContext.trim() ||
              undefined,
          }),
        },
      );

      const data =
        (await response.json()) as
          | CoverLetterApiResponse
          | CoverLetterApiError;

      if (
        !response.ok ||
        !("coverLetter" in data)
      ) {
        throw new Error(
          "error" in data
            ? data.details || data.error
            : "Failed to generate the cover letter.",
        );
      }

      setGeneratedLetter(
        data.coverLetter,
      );

      setWarnings(data.warnings);

      saveCoverLetter(
        data.coverLetter,
      );

      if (applicationId && linkedApplication) {
        updateApplication(applicationId, {
          companyName:
            companyName.trim(),
          jobTitle: jobTitle.trim(),
          recruiterName:
            hiringManagerName.trim(),
          jobDescription:
            jobDescription.trim(),
          coverLetterId:
            data.coverLetter.id,
        });

        setSuccessMessage(
          `Cover letter saved and linked to ${linkedApplication.jobTitle} at ${linkedApplication.companyName}.`,
        );
      } else {
        setSuccessMessage(
          "Cover letter generated and saved locally.",
        );
      }
    } catch (error) {
      setGeneratedLetter(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate the cover letter.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!generatedLetter?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedLetter.content,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setErrorMessage(
        "The cover letter could not be copied automatically.",
      );
    }
  }

  function handleDownload(): void {
    if (!generatedLetter?.content) {
      return;
    }

    const blob = new Blob(
      [generatedLetter.content],
      {
        type: "text/plain;charset=utf-8",
      },
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    const safeJobTitle =
      generatedLetter.jobTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    anchor.href = downloadUrl;

    anchor.download = `${
      safeJobTitle || "generated"
    }-cover-letter.txt`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href={
              applicationId
                ? "/job-tracker"
                : "/dashboard"
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
          >
            <ArrowLeft size={17} />

            {applicationId
              ? "Back to Job Tracker"
              : "Back to Dashboard"}
          </Link>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Panthrex AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Cover Letter Generator
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Generate a tailored UK cover
            letter using{" "}
            <span className="font-medium text-slate-200">
              {candidateName}
            </span>
            , your saved resume and the target
            job description.
          </p>
        </div>

        {applicationId &&
          isJobTrackerLoaded &&
          linkedApplication && (
            <section className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <BriefcaseBusiness
                      size={20}
                    />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                      Linked application
                    </p>

                    <h2 className="mt-1 font-semibold text-white">
                      {
                        linkedApplication.jobTitle
                      }{" "}
                      at{" "}
                      {
                        linkedApplication.companyName
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Job details were loaded
                      automatically. The generated
                      letter will be saved back to
                      this application.
                    </p>
                  </div>
                </div>

                <Link
                  href="/job-tracker"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  View application
                </Link>
              </div>
            </section>
          )}

        {applicationId &&
          isJobTrackerLoaded &&
          !linkedApplication && (
            <section className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={21}
                  className="mt-0.5 shrink-0 text-amber-300"
                />

                <div>
                  <h2 className="font-semibold text-amber-100">
                    Application not found
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-amber-100/70">
                    The linked Job Tracker
                    application may have been
                    deleted. You can still generate
                    a standalone cover letter.
                  </p>
                </div>
              </div>
            </section>
          )}

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="companyName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Company name
                </label>

                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Barclays"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Job title
                </label>

                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(event) =>
                    setJobTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Fraud Analytics Graduate"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label
                  htmlFor="hiringManagerName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Hiring manager name
                </label>

                <input
                  id="hiringManagerName"
                  type="text"
                  value={hiringManagerName}
                  onChange={(event) =>
                    setHiringManagerName(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label
                  htmlFor="jobDescription"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Job description
                </label>

                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Paste the complete job description here..."
                  rows={10}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  {
                    jobDescription.trim()
                      .length
                  }{" "}
                  characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="additionalContext"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Additional context
                </label>

                <textarea
                  id="additionalContext"
                  value={additionalContext}
                  onChange={(event) =>
                    setAdditionalContext(
                      event.target.value,
                    )
                  }
                  placeholder="Optional: motivation, referral, availability or career transition details."
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tone"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Tone
                  </label>

                  <select
                    id="tone"
                    value={tone}
                    onChange={(event) =>
                      setTone(
                        event.target
                          .value as CoverLetterTone,
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                  >
                    {toneOptions.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="length"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Length
                  </label>

                  <select
                    id="length"
                    value={length}
                    onChange={(event) =>
                      setLength(
                        event.target
                          .value as CoverLetterLength,
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                  >
                    {lengthOptions.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {successMessage}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  void handleGenerate()
                }
                disabled={!canGenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Generating cover letter...
                  </>
                ) : (
                  "Generate cover letter"
                )}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Generated cover letter
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Review, copy or download the
                  generated result.
                </p>
              </div>

              {generatedLetter && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy()
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
                  >
                    <Copy size={15} />

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
                  >
                    <Download size={15} />

                    Download
                  </button>
                </div>
              )}
            </div>

            {warnings.length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-sm font-semibold text-amber-200">
                  Review notes
                </p>

                <ul className="mt-2 space-y-1 text-sm text-amber-100/80">
                  {warnings.map(
                    (warning) => (
                      <li key={warning}>
                        • {warning}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {generatedLetter ? (
              <div className="min-h-[680px] rounded-xl border border-slate-700 bg-white p-6 text-slate-900 shadow-inner sm:p-8">
                <div className="mb-6 border-b border-slate-200 pb-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {
                      generatedLetter.title
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Generated{" "}
                    {new Date(
                      generatedLetter.createdAt,
                    ).toLocaleString(
                      "en-GB",
                    )}
                  </p>
                </div>

                <div className="whitespace-pre-wrap text-[15px] leading-7">
                  {
                    generatedLetter.content
                  }
                </div>
              </div>
            ) : (
              <div className="flex min-h-[680px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center">
                <div className="max-w-md">
                  <p className="text-lg font-semibold text-slate-200">
                    Your cover letter will
                    appear here
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Enter the target job
                    details and generate a
                    tailored letter using your
                    saved resume.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CoverLetterPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />

        <p className="mt-4 text-sm text-slate-400">
          Loading cover letter workspace...
        </p>
      </div>
    </main>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<CoverLetterPageFallback />}>
      <CoverLetterPageContent />
    </Suspense>
  );
}
