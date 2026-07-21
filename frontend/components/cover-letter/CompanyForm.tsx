"use client";

import type {
  CompanyDetails,
  CoverLetterLength,
  CoverLetterTone,
  GenerationOptions,
} from "@/lib/cover-letter/types";

interface CompanyFormProps {
  company: CompanyDetails;
  generation: GenerationOptions;
  onCompanyChange: (
    updates: Partial<CompanyDetails>,
  ) => void;
  onGenerationChange: (
    updates: Partial<GenerationOptions>,
  ) => void;
  disabled?: boolean;
}

const toneOptions: Array<{
  value: CoverLetterTone;
  label: string;
  description: string;
}> = [
  {
    value: "professional",
    label: "Professional",
    description:
      "Formal, polished, and suitable for most roles.",
  },
  {
    value: "confident",
    label: "Confident",
    description:
      "Assertive and achievement-focused without sounding arrogant.",
  },
  {
    value: "friendly",
    label: "Friendly",
    description:
      "Warm, approachable, and conversational.",
  },
  {
    value: "concise",
    label: "Concise",
    description:
      "Direct, compact, and focused on the strongest evidence.",
  },
];

const lengthOptions: Array<{
  value: CoverLetterLength;
  label: string;
  description: string;
}> = [
  {
    value: "short",
    label: "Short",
    description: "Approximately 200–250 words.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Approximately 300–400 words.",
  },
  {
    value: "long",
    label: "Detailed",
    description: "Approximately 450–550 words.",
  },
];

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const sectionClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function CompanyForm({
  company,
  generation,
  onCompanyChange,
  onGenerationChange,
  disabled = false,
}: CompanyFormProps) {
  const jobDescriptionLength =
    company.jobDescription.trim().length;

  return (
    <div className="space-y-5">
      <section className={sectionClassName}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Application details
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Target role
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Add the employer and role information Panthrex
            should use when tailoring your cover letter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="companyName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Company name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              value={company.companyName}
              onChange={(event) =>
                onCompanyChange({
                  companyName: event.target.value,
                })
              }
              placeholder="Example: Monzo"
              autoComplete="organization"
              disabled={disabled}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="jobTitle"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Job title
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={company.jobTitle}
              onChange={(event) =>
                onCompanyChange({
                  jobTitle: event.target.value,
                })
              }
              placeholder="Example: Fraud Data Analyst"
              autoComplete="organization-title"
              disabled={disabled}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="hiringManager"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Hiring manager
              <span className="ml-1 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <input
              id="hiringManager"
              name="hiringManager"
              type="text"
              value={company.hiringManager}
              onChange={(event) =>
                onCompanyChange({
                  hiringManager: event.target.value,
                })
              }
              placeholder="Example: Sarah Ahmed"
              autoComplete="name"
              disabled={disabled}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Job location
              <span className="ml-1 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <input
              id="location"
              name="location"
              type="text"
              value={company.location}
              onChange={(event) =>
                onCompanyChange({
                  location: event.target.value,
                })
              }
              placeholder="Example: London, United Kingdom"
              autoComplete="address-level2"
              disabled={disabled}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="jobDescription"
              className="text-sm font-medium text-slate-800"
            >
              Job description
              <span className="ml-1 text-red-500">*</span>
            </label>

            <span className="text-xs text-slate-500">
              {jobDescriptionLength.toLocaleString()} characters
            </span>
          </div>

          <textarea
            id="jobDescription"
            name="jobDescription"
            value={company.jobDescription}
            onChange={(event) =>
              onCompanyChange({
                jobDescription: event.target.value,
              })
            }
            placeholder="Paste the complete job description here. Include responsibilities, required skills, qualifications, and preferred experience."
            rows={12}
            disabled={disabled}
            className={`${inputClassName} min-h-72 resize-y leading-6`}
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            A detailed job description helps the AI identify
            relevant keywords, responsibilities, and employer
            priorities.
          </p>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Writing preferences
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Tone and length
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Control how the generated cover letter should sound
            and how much detail it should include.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-800">
            Tone
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {toneOptions.map((option) => {
              const selected =
                generation.tone === option.value;

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    selected
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="coverLetterTone"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      onGenerationChange({
                        tone: option.value,
                      })
                    }
                    disabled={disabled}
                    className="sr-only"
                  />

                  <span className="block text-sm font-semibold">
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
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-slate-800">
            Length
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {lengthOptions.map((option) => {
              const selected =
                generation.length === option.value;

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    selected
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="coverLetterLength"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      onGenerationChange({
                        length: option.value,
                      })
                    }
                    disabled={disabled}
                    className="sr-only"
                  />

                  <span className="block text-sm font-semibold">
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
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section className={sectionClassName}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Resume evidence
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Information to include
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Choose which resume sections the generator should
            prioritise.
          </p>
        </div>

        <div className="space-y-3">
          <PreferenceToggle
            id="includeExperience"
            label="Work experience"
            description="Use relevant employment history, responsibilities, and measurable achievements."
            checked={generation.includeExperience}
            disabled={disabled}
            onChange={(checked) =>
              onGenerationChange({
                includeExperience: checked,
              })
            }
          />

          <PreferenceToggle
            id="includeSkills"
            label="Skills"
            description="Match technical and professional skills against the job requirements."
            checked={generation.includeSkills}
            disabled={disabled}
            onChange={(checked) =>
              onGenerationChange({
                includeSkills: checked,
              })
            }
          />

          <PreferenceToggle
            id="includeProjects"
            label="Projects"
            description="Reference relevant academic, professional, or portfolio projects."
            checked={generation.includeProjects}
            disabled={disabled}
            onChange={(checked) =>
              onGenerationChange({
                includeProjects: checked,
              })
            }
          />
        </div>
      </section>
    </div>
  );
}

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function PreferenceToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: PreferenceToggleProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
        checked
          ? "border-slate-400 bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      } ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-slate-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          disabled={disabled}
          className="peer sr-only"
        />

        <span className="block h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-950 peer-focus-visible:ring-4 peer-focus-visible:ring-slate-200" />

        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
