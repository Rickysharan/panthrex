"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


import ResumeUpload from "@/components/resume-import/ResumeUpload";
import type {
  AiParsedResumeData,
  AiResumeParserResponse,
} from "@/lib/ai-resume-parser/types";

type ExtractionResult = {
  fileName: string;
  fileType: "pdf" | "docx";
  text: string;
  characterCount: number;
  wordCount: number;
  pageCount?: number;
  warnings: string[];
};

type ErrorResponse = {
  error?: string;
  details?: string;
};

export default function ResumeImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);

  const [parsedResume, setParsedResume] =
    useState<AiParsedResumeData | null>(null);

  const [parserWarnings, setParserWarnings] =
    useState<string[]>([]);

  const [isExtracting, setIsExtracting] =
    useState(false);

  const [isParsing, setIsParsing] =
    useState(false);

  const [error, setError] = useState("");

  function handleFileSelected(file: File) {
    setSelectedFile(file);
    setExtractionResult(null);
    setParsedResume(null);
    setParserWarnings([]);
    setError("");
  }

  async function handleExtractResume() {
    if (!selectedFile || isExtracting || isParsing) {
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);
    setParsedResume(null);
    setParserWarnings([]);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "/api/resume-import",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = (await response.json()) as
        | ExtractionResult
        | ErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "The resume could not be extracted.",
        );
      }

      setExtractionResult(
        data as ExtractionResult,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The resume could not be extracted.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleParseResume() {
    if (
      !extractionResult ||
      isParsing ||
      isExtracting
    ) {
      return;
    }

    setIsParsing(true);
    setParsedResume(null);
    setParserWarnings([]);
    setError("");

    try {
      const response = await fetch(
        "/api/ai-resume-parser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText: extractionResult.text,
          }),
        },
      );

      const data = (await response.json()) as
        | AiResumeParserResponse
        | ErrorResponse;

      if (!response.ok) {
        const errorResponse = data as ErrorResponse;

        throw new Error(
          errorResponse.details
            ? `${errorResponse.error ?? "The resume could not be parsed."} ${errorResponse.details}`
            : errorResponse.error ??
                "The resume could not be parsed.",
        );
      }

      const parserResponse =
        data as AiResumeParserResponse;

      setParsedResume(parserResponse.resume);
      setParserWarnings(
        parserResponse.warnings,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The resume could not be parsed.",
      );
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Resume Import
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Import your existing resume
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Upload a PDF or DOCX resume.
              Panthrex will extract the text and use
              AI to convert it into structured resume
              data.
            </p>
          </div>

          <Link
            href="/resume-builder"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
          >
            Back to Resume Builder
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <ResumeUpload
              onFileSelected={
                handleFileSelected
              }
              disabled={
                isExtracting || isParsing
              }
            />
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              What happens next?
            </h2>

            <div className="mt-5 space-y-5">
              {[
                [
                  "Upload",
                  "Select a PDF or DOCX resume up to 5 MB.",
                ],
                [
                  "Extract",
                  "Panthrex reads the available text from your file.",
                ],
                [
                  "AI Parse",
                  "AI converts the resume text into structured data.",
                ],
                [
                  "Review",
                  "Inspect the parsed information before importing it.",
                ],
              ].map(
                (
                  [title, description],
                  index,
                ) => (
                  <div
                    key={title}
                    className="flex gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Supported files
              </p>

              <p className="mt-2 text-sm leading-5 text-slate-600">
                PDF and Microsoft Word DOCX
                files.
              </p>
            </div>
          </aside>
        </section>

        {selectedFile ? (
          <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  Ready to process
                </p>

                <p className="mt-1 break-all text-sm text-blue-800">
                  {selectedFile.name}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExtractResume}
                disabled={
                  isExtracting || isParsing
                }
                className="inline-flex min-w-40 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExtracting
                  ? "Extracting..."
                  : "Extract resume"}
              </button>
            </div>
          </section>
        ) : null}

        {error ? (
          <section
            role="alert"
            className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 sm:p-6"
          >
            {error}
          </section>
        ) : null}

        {extractionResult ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
                  Extraction Complete
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Resume text extracted
                  successfully
                </h2>

                <p className="mt-2 break-all text-sm text-slate-600">
                  {extractionResult.fileName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase text-slate-700">
                  {
                    extractionResult.fileType
                  }
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {extractionResult.wordCount}{" "}
                  words
                </span>

                {typeof extractionResult.pageCount ===
                "number" ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {
                      extractionResult.pageCount
                    }{" "}
                    pages
                  </span>
                ) : null}
              </div>
            </div>

            {extractionResult.warnings.length >
            0 ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Extraction warnings
                </p>

                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {extractionResult.warnings.map(
                    (warning, index) => (
                      <li
                        key={`${warning}-${index}`}
                      >
                        • {warning}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            <div className="mt-6">
              <label
                htmlFor="extracted-resume-text"
                className="text-sm font-semibold text-slate-900"
              >
                Extracted text
              </label>

              <textarea
                id="extracted-resume-text"
                value={extractionResult.text}
                readOnly
                rows={16}
                className="mt-3 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleParseResume}
                disabled={
                  isParsing || isExtracting
                }
                className="inline-flex min-w-44 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isParsing
                  ? "Parsing with AI..."
                  : "Parse with AI"}
              </button>
            </div>
          </section>
        ) : null}

        {parsedResume ? (
          <section className="mt-6 rounded-3xl border border-violet-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
                AI Parsing Complete
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Review your structured resume
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Confirm that the extracted details
                are accurate before importing them
                into the Resume Builder.
              </p>
            </div>

            {parserWarnings.length > 0 ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  AI parsing warnings
                </p>

                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {parserWarnings.map(
                    (warning, index) => (
                      <li
                        key={`${warning}-${index}`}
                      >
                        • {warning}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ReviewSection
                title="Personal Details"
                rows={[
                  [
                    "Name",
                    parsedResume
                      .personalDetails
                      .fullName,
                  ],
                  [
                    "Job Title",
                    parsedResume
                      .personalDetails
                      .jobTitle,
                  ],
                  [
                    "Email",
                    parsedResume
                      .personalDetails.email,
                  ],
                  [
                    "Phone",
                    parsedResume
                      .personalDetails.phone,
                  ],
                  [
                    "Location",
                    parsedResume
                      .personalDetails
                      .location,
                  ],
                  [
                    "LinkedIn",
                    parsedResume
                      .personalDetails
                      .linkedin,
                  ],
                  [
                    "GitHub",
                    parsedResume
                      .personalDetails.github,
                  ],
                  [
                    "Website",
                    parsedResume
                      .personalDetails.website,
                  ],
                ]}
              />

              <ReviewSection
                title="Section Summary"
                rows={[
                  [
                    "Work Experience",
                    `${parsedResume.workExperience.length} entries`,
                  ],
                  [
                    "Education",
                    `${parsedResume.education.length} entries`,
                  ],
                  [
                    "Skills",
                    `${parsedResume.skills.length} skills`,
                  ],
                  [
                    "Projects",
                    `${parsedResume.projects.length} entries`,
                  ],
                  [
                    "Certifications",
                    `${parsedResume.certifications.length} entries`,
                  ],
                ]}
              />
            </div>

            {parsedResume.personalDetails
              .professionalSummary ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-bold text-slate-950">
                  Professional Summary
                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {
                    parsedResume
                      .personalDetails
                      .professionalSummary
                  }
                </p>
              </div>
            ) : null}

            {parsedResume.workExperience.length >
            0 ? (
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Work Experience
                </h3>

                <div className="mt-3 space-y-3">
                  {parsedResume.workExperience.map(
                    (item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <h4 className="font-bold text-slate-950">
                          {item.position ||
                            "Untitled position"}
                        </h4>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.company}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            item.location,
                            item.startDate,
                            item.isCurrent
                              ? "Present"
                              : item.endDate,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>

                        {item.description ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {item.description}
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            {parsedResume.education.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Education
                </h3>

                <div className="mt-3 space-y-3">
                  {parsedResume.education.map(
                    (item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <h4 className="font-bold text-slate-950">
                          {item.qualification ||
                            item.fieldOfStudy ||
                            "Education"}
                        </h4>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.institution}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            item.location,
                            item.startDate,
                            item.endDate,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>

                        {item.description ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {item.description}
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            {parsedResume.skills.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Skills
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {parsedResume.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleParseResume}
                disabled={isParsing}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Parse again
              </button>

              <button
                type="button"
                onClick={() => {
                    if (!parsedResume) {
                        return;
                    }

                    window.sessionStorage.setItem(
                        "panthrex-imported-resume",
                        JSON.stringify(parsedResume)
                    );

                    router.push("/resume-builder");
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Import into Resume Builder
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

type ReviewSectionProps = {
  title: string;
  rows: Array<[string, string]>;
};

function ReviewSection({
  title,
  rows,
}: ReviewSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-bold text-slate-950">
        {title}
      </h3>

      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4"
          >
            <dt className="text-sm text-slate-500">
              {label}
            </dt>

            <dd className="max-w-[65%] break-words text-right text-sm font-semibold text-slate-900">
              {value || "Not found"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}