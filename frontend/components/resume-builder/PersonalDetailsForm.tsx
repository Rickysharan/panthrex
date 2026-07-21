"use client";

import type { PersonalDetails } from "@/lib/resume/types";

type PersonalDetailsFormProps = {
  personalDetails: PersonalDetails;
  onChange: (updates: Partial<PersonalDetails>) => void;
};

const inputClassName =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

const textareaClassName =
  "mt-2 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

export default function PersonalDetailsForm({
  personalDetails,
  onChange,
}: PersonalDetailsFormProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          Resume content
        </p>

        <h2 className="mt-2 text-xl font-semibold">Personal details</h2>

        <p className="mt-2 text-sm leading-6 text-white/40">
          Add the contact and profile information that will appear at the top
          of your resume.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name">
          <input
            type="text"
            value={personalDetails.fullName}
            onChange={(event) =>
              onChange({
                fullName: event.target.value,
              })
            }
            placeholder="Ricky Sharan"
            autoComplete="name"
            className={inputClassName}
          />
        </Field>

        <Field label="Professional title">
          <input
            type="text"
            value={personalDetails.jobTitle}
            onChange={(event) =>
              onChange({
                jobTitle: event.target.value,
              })
            }
            placeholder="Machine Learning Engineer"
            autoComplete="organization-title"
            className={inputClassName}
          />
        </Field>

        <Field label="Email address">
          <input
            type="email"
            value={personalDetails.email}
            onChange={(event) =>
              onChange({
                email: event.target.value,
              })
            }
            placeholder="ricky@example.com"
            autoComplete="email"
            className={inputClassName}
          />
        </Field>

        <Field label="Phone number">
          <input
            type="tel"
            value={personalDetails.phone}
            onChange={(event) =>
              onChange({
                phone: event.target.value,
              })
            }
            placeholder="+44 7700 900000"
            autoComplete="tel"
            className={inputClassName}
          />
        </Field>

        <Field label="Location">
          <input
            type="text"
            value={personalDetails.location}
            onChange={(event) =>
              onChange({
                location: event.target.value,
              })
            }
            placeholder="London, United Kingdom"
            autoComplete="address-level2"
            className={inputClassName}
          />
        </Field>

        <Field label="Portfolio website">
          <input
            type="url"
            value={personalDetails.website}
            onChange={(event) =>
              onChange({
                website: event.target.value,
              })
            }
            placeholder="https://yourportfolio.com"
            autoComplete="url"
            className={inputClassName}
          />
        </Field>

        <Field label="LinkedIn">
          <input
            type="url"
            value={personalDetails.linkedin}
            onChange={(event) =>
              onChange({
                linkedin: event.target.value,
              })
            }
            placeholder="https://linkedin.com/in/your-profile"
            className={inputClassName}
          />
        </Field>

        <Field label="GitHub">
          <input
            type="url"
            value={personalDetails.github}
            onChange={(event) =>
              onChange({
                github: event.target.value,
              })
            }
            placeholder="https://github.com/your-username"
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Professional summary">
          <textarea
            value={personalDetails.professionalSummary}
            onChange={(event) =>
              onChange({
                professionalSummary: event.target.value,
              })
            }
            placeholder="Write a concise summary of your experience, strengths and target role."
            maxLength={800}
            className={textareaClassName}
          />

          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-white/30">
            <span>Recommended length: 3–5 lines</span>
            <span>{personalDetails.professionalSummary.length}/800</span>
          </div>
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-white/70">
      {label}
      {children}
    </label>
  );
}
