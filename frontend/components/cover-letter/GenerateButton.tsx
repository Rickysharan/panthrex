"use client";

interface GenerateButtonProps {
  onGenerate: () => Promise<void> | void;
  isGenerating: boolean;
  disabled?: boolean;
  error?: string | null;
}

export default function GenerateButton({
  onGenerate,
  isGenerating,
  disabled = false,
  error = null,
}: GenerateButtonProps) {
  const isDisabled = disabled || isGenerating;

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Panthrex AI
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Generate your cover letter
          </h2>

          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
            Panthrex will use the role, employer, job description,
            skills, experience, and selected tone to produce a
            tailored draft.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isDisabled}
          aria-busy={isGenerating}
          className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
        >
          {isGenerating ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Generating...
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span>
              Generate with AI
            </>
          )}
        </button>
      </div>

      {disabled && !isGenerating && !error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Enter the company name and job title before generating.
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-red-800">
            Generation failed
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      ) : null}
    </section>
  );
}
