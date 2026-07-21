"use client";

import { GraduationCap, Plus, Trash2 } from "lucide-react";

import type { Education } from "@/lib/resume/types";

type EducationFormProps = {
  educationItems: Education[];
  addEducation: () => void;
  updateEducation: (
    id: string,
    updates: Partial<Education>,
  ) => void;
  removeEducation: (id: string) => void;
};

const inputClassName =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

const textareaClassName =
  "mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

export default function EducationForm({
  educationItems,
  addEducation,
  updateEducation,
  removeEducation,
}: EducationFormProps) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Resume content
          </p>

          <h2 className="mt-2 text-xl font-semibold">Education</h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Add your academic qualifications in reverse chronological order.
          </p>
        </div>

        <button
          type="button"
          onClick={addEducation}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
        >
          <Plus size={18} />
          Add education
        </button>
      </div>

      {educationItems.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <GraduationCap
            className="mx-auto text-violet-300"
            size={42}
          />

          <h3 className="mt-5 text-lg font-semibold">
            No education added yet
          </h3>

          <p className="mt-2 text-sm text-white/40">
            Click &quot;Add education&quot; to add your qualifications.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {educationItems.map((education, index) => (
          <article
            key={education.id}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                  Education {index + 1}
                </p>

                <h3 className="mt-1 font-semibold">
                  {education.qualification ||
                    education.institution ||
                    "New qualification"}
                </h3>
              </div>

              <button
                type="button"
                aria-label={`Remove education ${index + 1}`}
                onClick={() => removeEducation(education.id)}
                className="rounded-xl p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Institution">
                <input
                  type="text"
                  value={education.institution}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      institution: event.target.value,
                    })
                  }
                  placeholder="Queen Mary University of London"
                  autoComplete="organization"
                  className={inputClassName}
                />
              </Field>

              <Field label="Qualification">
                <input
                  type="text"
                  value={education.qualification}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      qualification: event.target.value,
                    })
                  }
                  placeholder="MSc Artificial Intelligence"
                  className={inputClassName}
                />
              </Field>

              <Field label="Field of study">
                <input
                  type="text"
                  value={education.fieldOfStudy}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      fieldOfStudy: event.target.value,
                    })
                  }
                  placeholder="Artificial Intelligence and Data Science"
                  className={inputClassName}
                />
              </Field>

              <Field label="Location">
                <input
                  type="text"
                  value={education.location}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      location: event.target.value,
                    })
                  }
                  placeholder="London, United Kingdom"
                  autoComplete="address-level2"
                  className={inputClassName}
                />
              </Field>

              <Field label="Start date">
                <input
                  type="month"
                  value={education.startDate}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      startDate: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="End date">
                <input
                  type="month"
                  value={education.endDate}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      endDate: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Academic details and achievements">
                <textarea
                  value={education.description}
                  onChange={(event) =>
                    updateEducation(education.id, {
                      description: event.target.value,
                    })
                  }
                  placeholder={`Relevant modules: Machine Learning, Data Mining, Statistics
• Achieved distinction-level performance in Data Mining
• Dissertation focused on graph-based AML and fraud detection`}
                  className={textareaClassName}
                />
              </Field>
            </div>
          </article>
        ))}
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
