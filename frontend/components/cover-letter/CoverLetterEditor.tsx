"use client";

import type { CoverLetterContent } from "@/lib/cover-letter/types";

interface CoverLetterEditorProps {
  content: CoverLetterContent;
  onContentChange: (
    updates: Partial<CoverLetterContent>,
  ) => void;
  disabled?: boolean;
}

interface EditorSectionProps {
  id: keyof CoverLetterContent;
  label: string;
  description: string;
  placeholder: string;
  value: string;
  rows: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const textareaClassName =
  "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function countWords(value: string): number {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 0;
  }

  return normalizedValue.split(/\s+/).length;
}

function EditorSection({
  id,
  label,
  description,
  placeholder,
  value,
  rows,
  disabled,
  onChange,
  onClear,
}: EditorSectionProps) {
  const wordCount = countWords(value);
  const characterCount = value.length;

  return (
    <section className={sectionClassName}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label
            htmlFor={id}
            className="block text-base font-semibold text-slate-950"
          >
            {label}
          </label>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={disabled || value.length === 0}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear section
        </button>
      </div>

      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={textareaClassName}
      />

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>

        <span>
          {characterCount.toLocaleString()} characters
        </span>
      </div>
    </section>
  );
}

export default function CoverLetterEditor({
  content,
  onContentChange,
  disabled = false,
}: CoverLetterEditorProps) {
  const fullText = [
    content.introduction,
    content.body,
    content.closing,
  ]
    .filter(Boolean)
    .join(" ");

  const totalWordCount = countWords(fullText);
  const totalCharacterCount =
    content.introduction.length +
    content.body.length +
    content.closing.length;

  const hasContent =
    content.introduction.trim().length > 0 ||
    content.body.trim().length > 0 ||
    content.closing.trim().length > 0;

  const clearAllSections = () => {
    onContentChange({
      introduction: "",
      body: "",
      closing: "",
    });
  };

  return (
    <div className="space-y-5">
      <section className={sectionClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cover letter editor
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Review and refine your content
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Edit the generated text or write each section
              manually before exporting your cover letter.
            </p>
          </div>

          <button
            type="button"
            onClick={clearAllSections}
            disabled={disabled || !hasContent}
            className="shrink-0 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total words
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {totalWordCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Characters
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {totalCharacterCount.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <EditorSection
        id="introduction"
        label="Introduction"
        description="Introduce yourself, name the role, and explain why you are interested in the employer."
        placeholder="Example: I am writing to apply for the Fraud Data Analyst position at..."
        value={content.introduction}
        rows={6}
        disabled={disabled}
        onChange={(introduction) =>
          onContentChange({ introduction })
        }
        onClear={() =>
          onContentChange({ introduction: "" })
        }
      />

      <EditorSection
        id="body"
        label="Main body"
        description="Connect your experience, skills, achievements, and projects to the employer's requirements."
        placeholder="Describe your strongest relevant experience and provide specific evidence of your suitability..."
        value={content.body}
        rows={14}
        disabled={disabled}
        onChange={(body) =>
          onContentChange({ body })
        }
        onClear={() =>
          onContentChange({ body: "" })
        }
      />

      <EditorSection
        id="closing"
        label="Closing"
        description="Reinforce your interest, thank the reader, and invite further discussion."
        placeholder="Example: I would welcome the opportunity to discuss how my experience could contribute to..."
        value={content.closing}
        rows={6}
        disabled={disabled}
        onChange={(closing) =>
          onContentChange({ closing })
        }
        onClear={() =>
          onContentChange({ closing: "" })
        }
      />
    </div>
  );
}
