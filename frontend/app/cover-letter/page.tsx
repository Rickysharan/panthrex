"use client";

import Link from "next/link";
import { useState } from "react";

import CompanyForm from "@/components/cover-letter/CompanyForm";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";
import CoverLetterPreview from "@/components/cover-letter/CoverLetterPreview";
import ExportPdfButton from "@/components/cover-letter/ExportPdfButton";
import GenerateButton from "@/components/cover-letter/GenerateButton";
import TemplateSelector from "@/components/cover-letter/TemplateSelector";
import type { CoverLetterContent } from "@/lib/cover-letter/types";
import { useCoverLetter } from "@/lib/cover-letter/useCoverLetter";

interface GenerateCoverLetterResponse {
  success?: boolean;
  coverLetter?: string;
  error?: string;
}

const COVER_LETTER_PREVIEW_ID =
  "cover-letter-preview";

function splitCoverLetter(
  generatedLetter: string,
): CoverLetterContent {
  const cleanedLetter = generatedLetter
    .replace(/\r/g, "")
    .trim();

  const paragraphs = cleanedLetter
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length >= 3) {
    return {
      introduction: paragraphs[0],
      body: paragraphs.slice(1, -1).join("\n\n"),
      closing: paragraphs[paragraphs.length - 1],
    };
  }

  if (paragraphs.length === 2) {
    return {
      introduction: paragraphs[0],
      body: paragraphs[1],
      closing:
        "Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experience can contribute to your team.",
    };
  }

  return {
    introduction: cleanedLetter,
    body: "",
    closing:
      "Thank you for considering my application. I look forward to the opportunity to discuss my suitability for the role.",
  };
}

function createPdfFileName(
  companyName: string,
  jobTitle: string,
) {
  const baseName = [
    companyName.trim(),
    jobTitle.trim(),
    "Cover Letter",
  ]
    .filter(Boolean)
    .join(" ");

  const safeName = (
    baseName || "Panthrex Cover Letter"
  )
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "_");

  return `${safeName}.pdf`;
}

export default function CoverLetterPage() {
  const {
    coverLetterData,
    lastSavedAt,
    hasLoadedStorage,
    updateCompany,
    updateTemplate,
    updateContent,
    updateGenerationOptions,
    replaceContent,
    resetCoverLetter,
  } = useCoverLetter();

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

  const companyName =
    coverLetterData.company.companyName.trim();

  const jobTitle =
    coverLetterData.company.jobTitle.trim();

  const cannotGenerate =
    !hasLoadedStorage ||
    !companyName ||
    !jobTitle;

  const pdfFileName = createPdfFileName(
    companyName,
    jobTitle,
  );

  const handleGenerate = async () => {
    if (cannotGenerate || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch(
        "/api/ai-cover-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName,
            jobTitle,
            jobDescription:
              coverLetterData.company.jobDescription,
            applicantName: "",
            skills: "",
            experience: "",
            tone: coverLetterData.generation.tone,
            length:
              coverLetterData.generation.length,
          }),
        },
      );

      const result =
        (await response.json()) as GenerateCoverLetterResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "The AI service could not generate the cover letter.",
        );
      }

      if (
        !result.coverLetter ||
        !result.coverLetter.trim()
      ) {
        throw new Error(
          "The AI service returned an empty cover letter.",
        );
      }

      replaceContent(
        splitCoverLetter(result.coverLetter),
      );
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating the cover letter.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset the entire cover letter? This will remove the saved draft.",
    );

    if (confirmed) {
      resetCoverLetter();
      setGenerationError(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              ← Back to dashboard
            </Link>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Panthrex
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Cover Letter Generator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Generate, edit and export a tailored
                cover letter for your target role.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <p className="text-xs font-medium text-slate-500">
                Draft status
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {!hasLoadedStorage
                  ? "Loading saved draft..."
                  : lastSavedAt
                    ? `Saved at ${lastSavedAt.toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}`
                    : "Ready"}
              </p>
            </div>

            <ExportPdfButton
              targetId={COVER_LETTER_PREVIEW_ID}
              fileName={pdfFileName}
            />

            <button
              type="button"
              onClick={handleReset}
              disabled={
                !hasLoadedStorage || isGenerating
              }
              className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset draft
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-950">
            AI-powered workspace
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Add the company, role and job
            description, generate a tailored draft,
            edit the content and export the final
            letter as a PDF.
          </p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(500px,0.9fr)]">
          <div className="space-y-6">
            <CompanyForm
              company={coverLetterData.company}
              generation={
                coverLetterData.generation
              }
              onCompanyChange={updateCompany}
              onGenerationChange={
                updateGenerationOptions
              }
              disabled={
                !hasLoadedStorage || isGenerating
              }
            />

            <GenerateButton
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              disabled={cannotGenerate}
              error={generationError}
            />

            <TemplateSelector
              template={coverLetterData.template}
              onTemplateChange={updateTemplate}
              disabled={
                !hasLoadedStorage || isGenerating
              }
            />

            <CoverLetterEditor
              content={coverLetterData.content}
              onContentChange={updateContent}
              disabled={
                !hasLoadedStorage || isGenerating
              }
            />
          </div>

          <div className="xl:sticky xl:top-6">
            <CoverLetterPreview
              company={coverLetterData.company}
              content={coverLetterData.content}
              template={coverLetterData.template}
              previewId={COVER_LETTER_PREVIEW_ID}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
