"use client";

import {
  Code2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

type SkillsFormProps = {
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
};

export default function SkillsForm({
  skills,
  addSkill,
  removeSkill,
}: SkillsFormProps) {
  const [skillInput, setSkillInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const normalisedSkills = useMemo(
    () =>
      skills.map((skill) => skill.trim().toLowerCase()),
    [skills],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSkill = skillInput.trim();

    if (!trimmedSkill) {
      setErrorMessage("Enter a skill before adding it.");
      return;
    }

    if (
      normalisedSkills.includes(trimmedSkill.toLowerCase())
    ) {
      setErrorMessage("This skill has already been added.");
      return;
    }

    addSkill(trimmedSkill);
    setSkillInput("");
    setErrorMessage("");
  }

  function handleRemoveSkill(skill: string) {
    removeSkill(skill);
    setErrorMessage("");
  }

  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Resume content
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Skills
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Add role-relevant technical, analytical and
            professional skills. Use the exact terminology found
            in your target job descriptions.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
          <Code2 size={22} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-7"
      >
        <label
          htmlFor="skill-input"
          className="block text-sm font-medium text-white/70"
        >
          Add a skill
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="skill-input"
            type="text"
            value={skillInput}
            onChange={(event) => {
              setSkillInput(event.target.value);

              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            placeholder="Example: Python"
            autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.06]"
          />

          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90"
          >
            <Plus size={18} />
            Add skill
          </button>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mt-3 text-sm text-rose-300"
          >
            {errorMessage}
          </p>
        )}

        <p className="mt-3 text-xs leading-5 text-white/30">
          Add skills individually. Prioritise tools, languages,
          frameworks and domain knowledge directly relevant to
          the role.
        </p>
      </form>

      {skills.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <Code2
            className="mx-auto text-violet-300"
            size={42}
          />

          <h3 className="mt-5 text-lg font-semibold">
            No skills added yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Add your strongest job-relevant skills to improve
            resume readability and ATS keyword matching.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-white/70">
              Added skills
            </h3>

            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/45">
              {skills.length}{" "}
              {skills.length === 1 ? "skill" : "skills"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill}
                className="group inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] py-2 pl-4 pr-2 text-sm text-white/75 transition hover:border-violet-400/25 hover:bg-violet-400/[0.07]"
              >
                <span>{skill}</span>

                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() =>
                    handleRemoveSkill(skill)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.055] p-4">
        <p className="text-sm font-semibold text-violet-200">
          ATS guidance
        </p>

        <p className="mt-2 text-xs leading-5 text-white/45">
          Prefer specific keywords such as Python, SQL, PyTorch,
          FastAPI and fraud detection instead of broad phrases
          such as hardworking or computer skills.
        </p>
      </div>
    </section>
  );
}