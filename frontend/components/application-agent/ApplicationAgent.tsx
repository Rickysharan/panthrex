"use client";

import {
  CheckCircle2,
  Circle,
  CircleAlert,
  FileText,
  LoaderCircle,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useApplicationAgent } from "@/lib/application-agent/useApplicationAgent";
import type {
  ApplicationAgentStep,
  ApplicationAgentStepStatus,
} from "@/lib/application-agent/types";
import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";

const STATUS_ICON: Record<
  ApplicationAgentStepStatus,
  typeof Circle
> = {
  pending: Circle,
  running: LoaderCircle,
  completed: CheckCircle2,
  failed: CircleAlert,
  skipped: Circle,
};

const STATUS_STYLE: Record<
  ApplicationAgentStepStatus,
  string
> = {
  pending:
    "border-slate-800 bg-slate-900/70 text-slate-400",
  running:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  failed:
    "border-rose-500/30 bg-rose-500/10 text-rose-300",
  skipped:
    "border-slate-800 bg-slate-900/70 text-slate-500",
};

export default function ApplicationAgent() {
  const { resumeData } = useResumeBuilder();

  const {
    stage,
    steps,
    result,
    error,
    isRunning,
    run,
    reset,
    setError,
  } = useApplicationAgent();

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] =
    useState("");
  const [hiringManagerName, setHiringManagerName] =
    useState("");
  const [jobDescription, setJobDescription] =
    useState("");
  const [additionalContext, setAdditionalContext] =
    useState("");

  const canRun = useMemo(() => {
    return (
      jobTitle.trim().length > 0 &&
      companyName.trim().length > 0 &&
      jobDescription.trim().length >= 50 &&
      !isRunning
    );
  }, [
    jobTitle,
    companyName,
    jobDescription,
    isRunning,
  ]);

  async function handleRun(): Promise<void> {
    await run({
      jobTitle,
      companyName,
      hiringManagerName,
      jobDescription,
      additionalContext,
      resume: resumeData,
    });
  }

  function clearWorkspace(): void {
    if (isRunning) {
      return;
    }

    setJobTitle("");
    setCompanyName("");
    setHiringManagerName("");
    setJobDescription("");
    setAdditionalContext("");
    setError("");
    reset();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Sparkles size={22} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
            Panthrex Automation
          </p>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI Application Agent
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          Analyse a vacancy, tailor your resume, run an
          ATS scan and generate a targeted cover letter in
          one guided workflow.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <div className="self-start rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7 xl:sticky xl:top-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Application details
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter the target role and paste the complete
              vacancy description.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="application-agent-job-title"
              label="Job title"
              value={jobTitle}
              placeholder="Machine Learning Engineer"
              disabled={isRunning}
              onChange={(value) => {
                setJobTitle(value);
                setError("");
              }}
            />

            <Field
              id="application-agent-company"
              label="Company"
              value={companyName}
              placeholder="Company name"
              disabled={isRunning}
              onChange={(value) => {
                setCompanyName(value);
                setError("");
              }}
            />
          </div>

          <div className="mt-4">
            <Field
              id="application-agent-manager"
              label="Hiring manager"
              value={hiringManagerName}
              placeholder="Optional"
              disabled={isRunning}
              onChange={(value) => {
                setHiringManagerName(value);
                setError("");
              }}
            />
          </div>

          <label
            htmlFor="application-agent-job-description"
            className="mb-2 mt-5 block text-sm font-medium text-slate-200"
          >
            Job description
          </label>

          <textarea
            id="application-agent-job-description"
            rows={16}
            value={jobDescription}
            disabled={isRunning}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setError("");
            }}
            placeholder="Paste the complete vacancy description here..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="mt-2 flex items-center justify-between gap-4 text-xs">
            <span
              className={
                jobDescription.trim().length >= 50
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              Minimum 50 characters
            </span>

            <span className="text-slate-500">
              {jobDescription.length} characters
            </span>
          </div>

          <label
            htmlFor="application-agent-context"
            className="mb-2 mt-5 block text-sm font-medium text-slate-200"
          >
            Additional context
          </label>

          <textarea
            id="application-agent-context"
            rows={5}
            value={additionalContext}
            disabled={isRunning}
            onChange={(event) => {
              setAdditionalContext(event.target.value);
              setError("");
            }}
            placeholder="Optional achievements, motivation or application context..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {error ? (
            <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={clearWorkspace}
              disabled={isRunning}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear workspace
            </button>

            <button
              type="button"
              onClick={handleRun}
              disabled={!canRun}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <WandSparkles size={18} />
              )}

              {isRunning
                ? "Running agent..."
                : result
                  ? "Run again"
                  : "Run application agent"}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">
              Resume source
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The workflow uses the resume currently stored
              in Panthrex Resume Builder.
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-8">
          <WorkflowPanel
            steps={steps}
            stage={stage}
          />

          {result ? (
            <>
              <section className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Job match"
                  value={`${result.jobMatch.overallScore}%`}
                  icon={Target}
                />

                <MetricCard
                  label="ATS score"
                  value={`${result.atsResult.overallScore}%`}
                  icon={FileText}
                />

                <MetricCard
                  label="Cover letter"
                  value="Generated"
                  icon={CheckCircle2}
                />
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  Application summary
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  {result.jobTitle}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {result.companyName}
                </p>

                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {result.atsResult.summary}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="flex items-center gap-3">
                  <FileText
                    size={20}
                    className="text-violet-300"
                  />

                  <h2 className="text-xl font-semibold">
                    Generated cover letter
                  </h2>
                </div>

                <div className="mt-5 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                  {result.coverLetter.content}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                <h2 className="text-xl font-semibold">
                  Priority ATS recommendations
                </h2>

                <div className="mt-5 space-y-3">
                  {result.atsResult.recommendations
                    .slice(0, 5)
                    .map((recommendation) => (
                      <div
                        key={recommendation.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <p className="font-medium text-white">
                          {recommendation.title}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {recommendation.description}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Sparkles size={24} />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                Ready to build your application package
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Add a vacancy and run the agent to generate
                a tailored resume analysis, ATS score and
                cover letter.
              </p>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

function WorkflowPanel({
  steps,
  stage,
}: {
  steps: ApplicationAgentStep[];
  stage: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
            Workflow
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Application pipeline
          </h2>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-slate-400">
          {stage.replaceAll("-", " ")}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step) => {
          const Icon = STATUS_ICON[step.status];

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-4 ${STATUS_STYLE[step.status]}`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={20}
                  className={
                    step.status === "running"
                      ? "mt-0.5 shrink-0 animate-spin"
                      : "mt-0.5 shrink-0"
                  }
                />

                <div>
                  <p className="font-medium">
                    {step.label}
                  </p>

                  <p className="mt-1 text-sm leading-6 opacity-75">
                    {step.error ||
                      step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>

      <input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Target;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {label}
        </p>

        <Icon
          size={19}
          className="text-violet-300"
        />
      </div>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}
