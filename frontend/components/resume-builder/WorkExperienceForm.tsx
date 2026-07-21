"use client";

import { BriefcaseBusiness, Plus, Trash2 } from "lucide-react";
import type { WorkExperience } from "@/lib/resume/types";

type Props = {
  experiences: WorkExperience[];
  addExperience: () => void;
  updateExperience: (
    id: string,
    updates: Partial<WorkExperience>,
  ) => void;
  removeExperience: (id: string) => void;
};

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

const textareaClass =
  "mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

export default function WorkExperienceForm({
  experiences,
  addExperience,
  updateExperience,
  removeExperience,
}: Props) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Resume Content
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Work Experience
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Add your employment history in reverse chronological order.
          </p>
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
        >
          <Plus size={18} />
          Add Experience
        </button>
      </div>

      {experiences.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 py-14 text-center">
          <BriefcaseBusiness
            className="mx-auto text-violet-300"
            size={42}
          />

          <h3 className="mt-5 text-lg font-semibold">
            No experience added yet
          </h3>

          <p className="mt-2 text-sm text-white/40">
            Click &quot;Add Experience&quot; to begin building your resume.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold">
                Experience {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeExperience(experience.id)}
                className="rounded-xl p-2 text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Job Title">
                <input
                  className={inputClass}
                  value={experience.position}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      position: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Company">
                <input
                  className={inputClass}
                  value={experience.company}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      company: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Location">
                <input
                  className={inputClass}
                  value={experience.location}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      location: e.target.value,
                    })
                  }
                />
              </Field>

              <div className="flex items-end">
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={experience.isCurrent}
                    onChange={(e) =>
                      updateExperience(experience.id, {
                        isCurrent: e.target.checked,
                      })
                    }
                  />
                  I currently work here
                </label>
              </div>

              <Field label="Start Date">
                <input
                  type="month"
                  className={inputClass}
                  value={experience.startDate}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      startDate: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="End Date">
                <input
                  type="month"
                  disabled={experience.isCurrent}
                  className={`${inputClass} ${
                    experience.isCurrent
                      ? "cursor-not-allowed opacity-40"
                      : ""
                  }`}
                  value={experience.endDate}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      endDate: e.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Responsibilities & Achievements">
                <textarea
                  className={textareaClass}
                  value={experience.description}
                  placeholder={`• Improved model accuracy by 18%
• Reduced processing time by 40%
• Built scalable ML pipelines`}
                  onChange={(e) =>
                    updateExperience(experience.id, {
                      description: e.target.value,
                    })
                  }
                />
              </Field>
            </div>
          </div>
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