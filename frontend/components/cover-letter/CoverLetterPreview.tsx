"use client";

import type {
  CompanyDetails,
  CoverLetterContent,
  CoverLetterTemplate,
} from "@/lib/cover-letter/types";

interface CoverLetterPreviewProps {
  company: CompanyDetails;
  content: CoverLetterContent;
  template: CoverLetterTemplate;
  previewId?: string;
}

const placeholderClassName =
  "italic text-slate-400";

function PreviewParagraph({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string;
}) {
  if (!value.trim()) {
    return (
      <p className={placeholderClassName}>
        {placeholder}
      </p>
    );
  }

  return (
    <>
      {value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={`${paragraph}-${index}`}>
            {paragraph}
          </p>
        ))}
    </>
  );
}

function getTemplateClasses(
  template: CoverLetterTemplate,
) {
  switch (template) {
    case "modern":
      return {
        wrapper:
          "border-t-8 border-slate-950 bg-white",
        heading:
          "text-3xl font-bold tracking-tight text-slate-950",
        accent:
          "text-sm font-semibold uppercase tracking-[0.18em] text-slate-500",
        body:
          "text-[15px] leading-7 text-slate-700",
      };

    case "minimal":
      return {
        wrapper:
          "border border-slate-200 bg-white",
        heading:
          "text-2xl font-medium tracking-tight text-slate-950",
        accent:
          "text-xs font-medium uppercase tracking-[0.16em] text-slate-400",
        body:
          "text-[15px] leading-7 text-slate-700",
      };

    case "professional":
    default:
      return {
        wrapper:
          "border border-slate-200 bg-white",
        heading:
          "font-serif text-3xl font-semibold text-slate-950",
        accent:
          "text-sm font-semibold uppercase tracking-[0.14em] text-slate-600",
        body:
          "font-serif text-[15px] leading-7 text-slate-800",
      };
  }
}

export default function CoverLetterPreview({
  company,
  content,
  template,
  previewId = "cover-letter-preview",
}: CoverLetterPreviewProps) {
  const styles = getTemplateClasses(template);

  const recipientName =
    company.hiringManager.trim() ||
    "Hiring Manager";

  const companyName =
    company.companyName.trim() ||
    "Company Name";

  const jobTitle =
    company.jobTitle.trim() ||
    "Target Job Title";

  const location =
    company.location.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Live preview
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Cover letter
          </h2>
        </div>

        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600">
          {template}
        </span>
      </div>

      <article
        id={previewId}
        className={`${styles.wrapper} mx-auto min-h-[900px] w-full max-w-[820px] rounded-sm px-8 py-10 shadow-lg sm:px-12 sm:py-14`}
      >
        <header className="border-b border-slate-200 pb-8">
          <p className={styles.accent}>
            Application for
          </p>

          <h1 className={`${styles.heading} mt-3`}>
            {jobTitle}
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            {companyName}
            {location ? ` · ${location}` : ""}
          </p>
        </header>

        <div className={`mt-10 ${styles.body}`}>
          <div className="space-y-1">
            <p>{recipientName}</p>
            <p>{companyName}</p>

            {location ? (
              <p>{location}</p>
            ) : null}
          </div>

          <p className="mt-8">
            Dear {recipientName},
          </p>

          <div className="mt-8 space-y-6">
            <PreviewParagraph
              value={content.introduction}
              placeholder="Your introduction will appear here."
            />

            <PreviewParagraph
              value={content.body}
              placeholder="Your main supporting evidence will appear here."
            />

            <PreviewParagraph
              value={content.closing}
              placeholder="Your closing paragraph will appear here."
            />
          </div>

          <div className="mt-10">
            <p>Yours sincerely,</p>

            <p className="mt-8 font-semibold text-slate-950">
              Your Name
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
