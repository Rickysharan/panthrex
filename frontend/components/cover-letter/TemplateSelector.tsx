"use client";

import type { CoverLetterTemplate } from "@/lib/cover-letter/types";

interface TemplateSelectorProps {
  template: CoverLetterTemplate;
  onTemplateChange: (
    template: CoverLetterTemplate,
  ) => void;
  disabled?: boolean;
}

const templates: Array<{
  value: CoverLetterTemplate;
  label: string;
  description: string;
}> = [
  {
    value: "professional",
    label: "Professional",
    description:
      "Traditional typography and formal spacing for corporate applications.",
  },
  {
    value: "modern",
    label: "Modern",
    description:
      "Bold headings and a clean contemporary layout.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description:
      "Simple styling with restrained typography and maximum readability.",
  },
];

export default function TemplateSelector({
  template,
  onTemplateChange,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Design
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Choose a template
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Select the visual style used in the live preview and exported cover letter.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {templates.map((option) => {
          const selected =
            template === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onTemplateChange(option.value)
              }
              disabled={disabled}
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <TemplateThumbnail
                template={option.value}
                selected={selected}
              />

              <span className="mt-4 block text-sm font-semibold">
                {option.label}
              </span>

              <span
                className={`mt-1 block text-xs leading-5 ${
                  selected
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface TemplateThumbnailProps {
  template: CoverLetterTemplate;
  selected: boolean;
}

function TemplateThumbnail({
  template,
  selected,
}: TemplateThumbnailProps) {
  const lineClassName = selected
    ? "bg-slate-300"
    : "bg-slate-300";

  if (template === "modern") {
    return (
      <div
        className={`h-28 rounded-lg border bg-white p-3 ${
          selected
            ? "border-white/30"
            : "border-slate-200"
        }`}
      >
        <div className="h-2 w-full rounded-full bg-slate-950" />
        <div className="mt-3 h-3 w-3/5 rounded bg-slate-800" />
        <div className="mt-3 space-y-2">
          <div className={`h-1.5 w-full rounded ${lineClassName}`} />
          <div className={`h-1.5 w-11/12 rounded ${lineClassName}`} />
          <div className={`h-1.5 w-4/5 rounded ${lineClassName}`} />
          <div className={`h-1.5 w-full rounded ${lineClassName}`} />
        </div>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div
        className={`h-28 rounded-lg border bg-white p-4 ${
          selected
            ? "border-white/30"
            : "border-slate-200"
        }`}
      >
        <div className="h-2.5 w-2/5 rounded bg-slate-700" />
        <div className="mt-4 space-y-2">
          <div className={`h-1.5 w-full rounded ${lineClassName}`} />
          <div className={`h-1.5 w-10/12 rounded ${lineClassName}`} />
          <div className={`h-1.5 w-full rounded ${lineClassName}`} />
          <div className={`h-1.5 w-3/4 rounded ${lineClassName}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-28 rounded-lg border bg-white p-4 ${
        selected
          ? "border-white/30"
          : "border-slate-200"
      }`}
    >
      <div className="mx-auto h-3 w-1/2 rounded bg-slate-800" />
      <div className="mx-auto mt-2 h-1.5 w-1/3 rounded bg-slate-300" />
      <div className="mt-4 border-t border-slate-300 pt-3">
        <div className="space-y-2">
          <div className={`h-1.5 w-full rounded ${lineClassName}`} />
          <div className={`h-1.5 w-11/12 rounded ${lineClassName}`} />
          <div className={`h-1.5 w-4/5 rounded ${lineClassName}`} />
        </div>
      </div>
    </div>
  );
}
