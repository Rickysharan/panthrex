"use client";

import { useState } from "react";

import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_DIFFICULTIES,
  type InterviewAnswerEvaluation,
  type InterviewCategory,
  type InterviewDifficulty,
  type InterviewGenerationResponse,
  type InterviewQuestion,
} from "@/lib/interview/types";
import { useInterview } from "@/lib/interview/useInterview";

type AnswerState = Record<string, string>;
type EvaluationState = Record<string, InterviewAnswerEvaluation>;
type LoadingState = Record<string, boolean>;
type ErrorState = Record<string, string>;

export default function InterviewPage() {
  const { stats } = useInterview();

  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [category, setCategory] =
    useState<InterviewCategory>("general");
  const [difficulty, setDifficulty] =
    useState<InterviewDifficulty>("beginner");
  const [questionCount, setQuestionCount] = useState(10);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [evaluations, setEvaluations] = useState<EvaluationState>({});
  const [evaluationLoading, setEvaluationLoading] =
    useState<LoadingState>({});
  const [evaluationErrors, setEvaluationErrors] =
    useState<ErrorState>({});

  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationError, setGenerationError] = useState("");

  async function generateQuestions(): Promise<void> {
    if (!role.trim()) {
      setGenerationError("Please enter a target role.");
      return;
    }

    if (questionCount < 1 || questionCount > 20) {
      setGenerationError(
        "Question count must be between 1 and 20.",
      );
      return;
    }

    setGenerationLoading(true);
    setGenerationError("");

    try {
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role.trim(),
          company: company.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
          category,
          difficulty,
          questionCount,
        }),
      });

      const data = (await response.json()) as
        | InterviewGenerationResponse
        | {
            success: false;
            error: string;
          };

      if (!response.ok || !data.success) {
        throw new Error(
          "error" in data
            ? data.error
            : "Failed to generate interview questions.",
        );
      }

      setQuestions(data.questions);
      setAnswers({});
      setEvaluations({});
      setEvaluationLoading({});
      setEvaluationErrors({});
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setGenerationLoading(false);
    }
  }

  function updateAnswer(
    questionId: string,
    value: string,
  ): void {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));

    setEvaluationErrors((currentErrors) => ({
      ...currentErrors,
      [questionId]: "",
    }));
  }

  async function evaluateAnswer(
    question: InterviewQuestion,
  ): Promise<void> {
    const answer = answers[question.id]?.trim();

    if (!answer) {
      setEvaluationErrors((currentErrors) => ({
        ...currentErrors,
        [question.id]:
          "Enter an answer before requesting an evaluation.",
      }));

      return;
    }

    setEvaluationLoading((currentLoading) => ({
      ...currentLoading,
      [question.id]: true,
    }));

    setEvaluationErrors((currentErrors) => ({
      ...currentErrors,
      [question.id]: "",
    }));

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          role: role.trim(),
          company: company.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      const data = (await response.json()) as
        | {
            success: true;
            evaluation: InterviewAnswerEvaluation;
          }
        | {
            success: false;
            error: string;
          };

      if (!response.ok || !data.success) {
        throw new Error(
          "error" in data
            ? data.error
            : "Failed to evaluate the answer.",
        );
      }

      setEvaluations((currentEvaluations) => ({
        ...currentEvaluations,
        [question.id]: data.evaluation,
      }));
    } catch (error) {
      setEvaluationErrors((currentErrors) => ({
        ...currentErrors,
        [question.id]:
          error instanceof Error
            ? error.message
            : "An unexpected evaluation error occurred.",
      }));
    } finally {
      setEvaluationLoading((currentLoading) => ({
        ...currentLoading,
        [question.id]: false,
      }));
    }
  }

  function clearInterview(): void {
    setQuestions([]);
    setAnswers({});
    setEvaluations({});
    setEvaluationLoading({});
    setEvaluationErrors({});
    setGenerationError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Panthrex Interview Coach
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Interview Preparation
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Generate realistic interview questions, practise your
            responses and receive structured AI feedback.
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total sessions"
            value={stats.totalSessions}
          />

          <StatCard
            label="Completed"
            value={stats.completedSessions}
          />

          <StatCard
            label="Answers evaluated"
            value={stats.totalQuestionsAnswered}
          />

          <StatCard
            label="Average score"
            value={
              stats.averageScore > 0
                ? `${stats.averageScore}%`
                : "—"
            }
          />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Configure your interview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Add role and vacancy details to improve question
              relevance.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Target role" required>
                <input
                  type="text"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  placeholder="Example: Fraud Data Analyst"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </FormField>

              <FormField label="Company">
                <input
                  type="text"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="Example: Barclays"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </FormField>
            </div>

            <FormField label="Job description">
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                placeholder="Paste the job description, responsibilities and requirements."
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />
            </FormField>

            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Interview category">
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as InterviewCategory,
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                >
                  {INTERVIEW_CATEGORIES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target.value as InterviewDifficulty,
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                >
                  {INTERVIEW_DIFFICULTIES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Question count">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(
                      Number(event.target.value),
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </FormField>
            </div>

            {generationError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {generationError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {questions.length > 0 ? (
                <button
                  type="button"
                  onClick={clearInterview}
                  disabled={generationLoading}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear interview
                </button>
              ) : null}

              <button
                type="button"
                onClick={generateQuestions}
                disabled={generationLoading}
                className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generationLoading
                  ? "Generating questions..."
                  : questions.length > 0
                    ? "Generate new questions"
                    : "Generate interview questions"}
              </button>
            </div>
          </div>
        </section>

        {questions.length > 0 ? (
          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Interview questions
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Answer each question and request individual AI
                  feedback.
                </p>
              </div>

              <div className="text-sm text-slate-400">
                {questions.length} question
                {questions.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => {
                const evaluation =
                  evaluations[question.id];

                const isEvaluating =
                  evaluationLoading[question.id] ?? false;

                const evaluationError =
                  evaluationErrors[question.id];

                return (
                  <article
                    key={question.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
                  >
                    <div className="border-b border-slate-800 p-5 sm:p-7">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-4xl">
                          <p className="mb-3 text-sm font-semibold text-cyan-400">
                            Question {index + 1}
                          </p>

                          <h3 className="text-lg font-semibold leading-7 text-white">
                            {question.question}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge value={question.category} />
                          <Badge value={question.difficulty} />
                          <Badge value={question.type} />
                        </div>
                      </div>

                      {question.expectedSkills.length > 0 ? (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Expected skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {question.expectedSkills.map(
                              (skill) => (
                                <span
                                  key={`${question.id}-${skill}`}
                                  className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null}

                      {question.guidance ? (
                        <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                            Answer guidance
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {question.guidance}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5 sm:p-7">
                      <label
                        htmlFor={`answer-${question.id}`}
                        className="mb-2 block text-sm font-medium text-slate-200"
                      >
                        Your answer
                      </label>

                      <textarea
                        id={`answer-${question.id}`}
                        rows={7}
                        value={answers[question.id] ?? ""}
                        onChange={(event) =>
                          updateAnswer(
                            question.id,
                            event.target.value,
                          )
                        }
                        placeholder="Write your interview answer here. Include specific examples, actions and measurable results where relevant."
                        className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                      />

                      {evaluationError ? (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {evaluationError}
                        </div>
                      ) : null}

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            evaluateAnswer(question)
                          }
                          disabled={isEvaluating}
                          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isEvaluating
                            ? "Evaluating answer..."
                            : evaluation
                              ? "Evaluate again"
                              : "Evaluate answer"}
                        </button>
                      </div>

                      {evaluation ? (
                        <EvaluationPanel
                          evaluation={evaluation}
                        />
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}

        {required ? (
          <span className="ml-1 text-cyan-400">*</span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function Badge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs capitalize text-slate-300">
      {value.replaceAll("-", " ")}
    </span>
  );
}

function EvaluationPanel({
  evaluation,
}: {
  evaluation: InterviewAnswerEvaluation;
}) {
  return (
    <div className="mt-7 border-t border-slate-800 pt-7">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Overall evaluation
          </p>

          <p className="mt-1 text-lg font-semibold capitalize text-white">
            {evaluation.rating.replaceAll("-", " ")}
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-400 bg-slate-950">
          <span className="text-2xl font-bold text-white">
            {evaluation.score}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard
          label="Clarity"
          score={evaluation.clarityScore}
        />

        <ScoreCard
          label="Relevance"
          score={evaluation.relevanceScore}
        />

        <ScoreCard
          label="Structure"
          score={evaluation.structureScore}
        />

        <ScoreCard
          label="Confidence"
          score={evaluation.confidenceScore}
        />

        {evaluation.technicalAccuracyScore !== undefined ? (
          <ScoreCard
            label="Technical accuracy"
            score={evaluation.technicalAccuracyScore}
          />
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <FeedbackList
          title="Strengths"
          items={evaluation.strengths}
          emptyMessage="No strengths were identified."
        />

        <FeedbackList
          title="Weaknesses"
          items={evaluation.weaknesses}
          emptyMessage="No weaknesses were identified."
        />

        <FeedbackList
          title="Improvements"
          items={evaluation.improvements}
          emptyMessage="No improvements were provided."
        />
      </div>

      {evaluation.suggestedAnswer ? (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
            Suggested answer
          </h4>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {evaluation.suggestedAnswer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ScoreCard({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, Math.round(score)),
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">
          {label}
        </span>

        <span className="text-sm font-semibold text-white">
          {safeScore}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <h4 className="font-semibold text-white">
        {title}
      </h4>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}