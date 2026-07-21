"use client";

import {
  FolderKanban,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";

import type { Project } from "@/lib/resume/types";

type ProjectsFormProps = {
  projects: Project[];
  addProject: () => void;
  updateProject: (
    id: string,
    updates: Partial<Project>,
  ) => void;
  removeProject: (id: string) => void;
};

const inputClassName =
  "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

const textareaClassName =
  "mt-2 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]";

export default function ProjectsForm({
  projects,
  addProject,
  updateProject,
  removeProject,
}: ProjectsFormProps) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Resume content
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Projects
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Showcase relevant academic, professional and personal
            projects that demonstrate your technical capabilities
            and measurable impact.
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
        >
          <Plus size={18} />
          Add project
        </button>
      </div>

      {projects.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <FolderKanban
            className="mx-auto text-violet-300"
            size={42}
          />

          <h3 className="mt-5 text-lg font-semibold">
            No projects added yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Click &quot;Add project&quot; to showcase work that
            demonstrates your skills, responsibilities and results.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                  Project {index + 1}
                </p>

                <h3 className="mt-1 truncate font-semibold">
                  {project.name || "New project"}
                </h3>
              </div>

              <button
                type="button"
                aria-label={`Remove project ${index + 1}`}
                onClick={() => removeProject(project.id)}
                className="rounded-xl p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Project name">
                <input
                  type="text"
                  value={project.name}
                  onChange={(event) =>
                    updateProject(project.id, {
                      name: event.target.value,
                    })
                  }
                  placeholder="Graph-Based AML Detection Platform"
                  className={inputClassName}
                />
              </Field>

              <Field label="Your role">
                <input
                  type="text"
                  value={project.role}
                  onChange={(event) =>
                    updateProject(project.id, {
                      role: event.target.value,
                    })
                  }
                  placeholder="Machine Learning Engineer"
                  className={inputClassName}
                />
              </Field>

              <Field label="Start date">
                <input
                  type="month"
                  value={project.startDate}
                  onChange={(event) =>
                    updateProject(project.id, {
                      startDate: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="End date">
                <input
                  type="month"
                  value={project.endDate}
                  onChange={(event) =>
                    updateProject(project.id, {
                      endDate: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Project URL">
                <div className="relative">
                  <Link2
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type="url"
                    value={project.projectUrl}
                    onChange={(event) =>
                      updateProject(project.id, {
                        projectUrl: event.target.value,
                      })
                    }
                    placeholder="https://github.com/username/project"
                    autoComplete="url"
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Project description and achievements">
                <textarea
                  value={project.description}
                  onChange={(event) =>
                    updateProject(project.id, {
                      description: event.target.value,
                    })
                  }
                  placeholder={`• Built a graph-based fraud detection pipeline using Python and PyTorch Geometric
• Applied temporal train-test splitting to prevent data leakage
• Evaluated performance using PR-AUC and Recall@K
• Developed an interactive Streamlit dashboard for suspicious transaction analysis`}
                  className={textareaClassName}
                />
              </Field>

              <p className="mt-3 text-xs leading-5 text-white/30">
                Use one achievement per line. Start with an action
                verb and include technologies, scale or measurable
                outcomes where possible.
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.055] p-4">
        <p className="text-sm font-semibold text-violet-200">
          ATS guidance
        </p>

        <p className="mt-2 text-xs leading-5 text-white/45">
          Prioritise projects that match your target role. Mention
          relevant programming languages, frameworks, architecture,
          datasets, deployment tools and measurable outcomes.
        </p>
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