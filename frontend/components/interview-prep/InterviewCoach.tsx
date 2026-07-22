"use client";

import { useMemo, useState } from "react";

import type {
  EvaluateInterviewAnswerResponse,
  InterviewDifficulty,
  InterviewPrepError,
  InterviewQuestion,
  InterviewSession,
} from "@/lib/interview-prep/types";
import { useInterviewPrep } from "@/lib/interview-prep/useInterviewPrep";

export default function InterviewCoach() {
  const {
    sessions,
    selectedSession,
    selectedSessionId,
    progress,
    completedQuestions,
    totalQuestions,
    saveSession,
    setSelectedSessionId,
    deleteSession,
    duplicateSession,
    clearSessions,
    updateAnswer,
    saveFeedback,
  } = useInterviewPrep();

  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] =
    useState<InterviewDifficulty>("intermediate");
  const [questionCount, setQuestionCount] = useState(5);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<
    string | null
  >(null);
  const [error, setError] = useState("");



  const activeQuestion =
    selectedSession?.questions[activeQuestionIndex] ?? null;

  const analytics = useMemo(() => {
    const scores = sessions.flatMap((session) =>
      session.questions
        .map((question) => question.feedback?.score)
        .filter((score): score is number => typeof score === "number"),
    );

    const totalCompleted = sessions.reduce(
      (total, session) =>
        total +
        session.questions.filter((question) => question.completed).length,
      0,
    );

    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(
          scores.reduce((total, score) => total + score, 0) /
          scores.length,
        );

    const bestScore = scores.length === 0 ? 0 : Math.max(...scores);

    return {
      averageScore,
      bestScore,
      totalCompleted,
      evaluatedAnswers: scores.length,
    };
  }, [sessions]);
  function handleSelectSession(sessionId: string) {
    setSelectedSessionId(sessionId);
    setActiveQuestionIndex(0);
    setError("");
  }

  async function generateInterview() {
    if (!role.trim()) {
      setError("Enter a target role before generating an interview.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate-questions",
          payload: {
            role: role.trim(),
            company: company.trim(),
            jobDescription: jobDescription.trim(),
            difficulty,
            questionCount,
            resume: {},
          },
        }),
      });

      const data = (await response.json()) as
        | {
          success: true;
          questions: InterviewQuestion[];
        }
        | InterviewPrepError;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success
            ? "Unable to generate interview questions."
            : data.error,
        );
      }

      const questions = data.questions.map((question) => ({
        ...question,
        answer: "",
        feedback: null,
        completed: false,
      }));

      const now = new Date().toISOString();

      const session: InterviewSession = {
        id: crypto.randomUUID(),
        role: role.trim(),
        company: company.trim(),
        jobDescription: jobDescription.trim(),
        difficulty,
        questions,
        createdAt: now,
        updatedAt: now,
      };

      saveSession(session);
      handleSelectSession(session.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while generating the interview.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function evaluateAnswer() {
    if (!selectedSession || !activeQuestion) {
      return;
    }

    if (!activeQuestion.answer.trim()) {
      setError("Write an answer before requesting AI feedback.");
      return;
    }

    setEvaluatingQuestionId(activeQuestion.id);
    setError("");

    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "evaluate-answer",
          payload: {
            question: {
              id: activeQuestion.id,
              question: activeQuestion.question,
              type: activeQuestion.type,
              difficulty: activeQuestion.difficulty,
              competency: activeQuestion.competency,
              guidance: activeQuestion.guidance,
            },
            answer: activeQuestion.answer.trim(),
            role: selectedSession.role,
            jobDescription: selectedSession.jobDescription,
          },
        }),
      });

      const data = (await response.json()) as
        | EvaluateInterviewAnswerResponse
        | InterviewPrepError;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success
            ? "Unable to evaluate the interview answer."
            : data.error,
        );
      }

      saveFeedback(
        selectedSession.id,
        activeQuestion.id,
        data.feedback,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while evaluating the answer.",
      );
    } finally {
      setEvaluatingQuestionId(null);
    }
  }

  function handleDuplicateSession(sessionId: string) {
    const duplicated = duplicateSession(sessionId);

    if (!duplicated) {
      setError("The interview session could not be duplicated.");
      return;
    }

    handleSelectSession(duplicated.id);
  }

  function handleDeleteSession(sessionId: string) {
    const shouldDelete = window.confirm(
      "Delete this interview session? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    deleteSession(sessionId);
    setActiveQuestionIndex(0);
    setError("");
  }

  function handleClearSessions() {
    const shouldClear = window.confirm(
      "Clear all interview history? This action cannot be undone.",
    );

    if (!shouldClear) {
      return;
    }

    clearSessions();
    setActiveQuestionIndex(0);
    setError("");
  }

  function selectPreviousQuestion() {
    setActiveQuestionIndex((current) => Math.max(0, current - 1));
    setError("");
  }

  function selectNextQuestion() {
    if (!selectedSession) {
      return;
    }

    setActiveQuestionIndex((current) =>
      Math.min(selectedSession.questions.length - 1, current + 1),
    );
    setError("");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Panthrex Interview Preparation
        </p>

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          AI Interview Coach
        </h1>

        <p className="mt-2 max-w-3xl text-slate-400">
          Generate role-specific questions, practise structured answers and
          receive detailed AI feedback.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          label="Average Score"
          value={
            analytics.evaluatedAnswers === 0
              ? "—"
              : `${analytics.averageScore}/100`
          }
          description={`${analytics.evaluatedAnswers} evaluated answers`}
        />

        <AnalyticsCard
          label="Best Score"
          value={
            analytics.evaluatedAnswers === 0
              ? "—"
              : `${analytics.bestScore}/100`
          }
          description="Highest answer evaluation"
        />

        <AnalyticsCard
          label="Completed"
          value={String(analytics.totalCompleted)}
          description="Questions completed"
        />

        <AnalyticsCard
          label="Sessions"
          value={String(sessions.length)}
          description="Saved practice interviews"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">
              Interview Setup
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Target role
                </span>

                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  placeholder="Example: Software Engineer"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Company
                </span>

                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  placeholder="Optional"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Job description
                </span>

                <textarea
                  className="min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  placeholder="Paste the vacancy description for better tailoring."
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(event.target.value)
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Difficulty
                </span>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target.value as InterviewDifficulty,
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Number of questions
                </span>

                <input
                  type="number"
                  min={3}
                  max={20}
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(
                      Math.max(
                        3,
                        Math.min(
                          20,
                          Number(event.target.value) || 3,
                        ),
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </label>

              <button
                type="button"
                onClick={generateInterview}
                disabled={isGenerating || !role.trim()}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating
                  ? "Generating interview..."
                  : "Generate Interview"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Current Progress
              </h2>

              <span className="text-sm font-semibold text-indigo-300">
                {progress}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-400">
              {completedQuestions} of {totalQuestions} questions completed
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Previous Sessions
              </h2>

              {sessions.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearSessions}
                  className="text-xs font-semibold text-red-400 transition hover:text-red-300"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No interview sessions yet.
              </p>
            ) : (
              <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
                {sessions.map((session) => {
                  const isSelected =
                    session.id === selectedSessionId;

                  const completed = session.questions.filter(
                    (question) => question.completed,
                  ).length;

                  const sessionScores = session.questions
                    .map((question) => question.feedback?.score)
                    .filter(
                      (score): score is number =>
                        typeof score === "number",
                    );

                  const sessionAverage =
                    sessionScores.length === 0
                      ? null
                      : Math.round(
                        sessionScores.reduce(
                          (total, score) => total + score,
                          0,
                        ) / sessionScores.length,
                      );

                  return (
                    <article
                      key={session.id}
                      className={`rounded-xl border p-4 transition ${isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSession(session.id)}
                        className="w-full text-left"
                      >
                        <p className="font-semibold text-white">
                          {session.role}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {session.company || "Company not specified"}
                        </p>

                        <p className="mt-2 text-xs capitalize text-slate-500">
                          {completed}/{session.questions.length} completed ·{" "}
                          {session.difficulty}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Average score:{" "}
                          {sessionAverage === null
                            ? "Not evaluated"
                            : `${sessionAverage}/100`}
                        </p>
                      </button>

                      <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleDuplicateSession(session.id)
                          }
                          className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
                        >
                          Duplicate
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSession(session.id)
                          }
                          className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </aside>

        <main>
          {!selectedSession || !activeQuestion ? (
            <section className="flex min-h-[620px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  🎯
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-white">
                  Start an interview session
                </h2>

                <p className="mt-3 text-slate-400">
                  Enter the role details and generate questions. Your
                  interview workspace will appear here.
                </p>
              </div>
            </section>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-400">
                      {selectedSession.company || "Practice interview"}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {selectedSession.role}
                    </h2>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
                    Question {activeQuestionIndex + 1} of{" "}
                    {selectedSession.questions.length}
                  </div>
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                  {selectedSession.questions.map((question, index) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionIndex(index);
                        setError("");
                      }}
                      aria-label={`Open question ${index + 1}`}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${index === activeQuestionIndex
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : question.completed
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold capitalize text-indigo-300">
                    {activeQuestion.type.replace("-", " ")}
                  </span>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                    {activeQuestion.difficulty}
                  </span>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    {activeQuestion.competency}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold leading-relaxed text-white">
                  {activeQuestion.question}
                </h3>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                    Answer guidance
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {activeQuestion.guidance}
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Your answer
                  </span>

                  <textarea
                    value={activeQuestion.answer}
                    onChange={(event) =>
                      updateAnswer(
                        selectedSession.id,
                        activeQuestion.id,
                        event.target.value,
                      )
                    }
                    className="min-h-56 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    placeholder="Write your interview answer here. For behavioural questions, use Situation, Task, Action and Result."
                  />
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={selectPreviousQuestion}
                      disabled={activeQuestionIndex === 0}
                      className="rounded-lg border border-slate-700 px-4 py-2.5 font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={selectNextQuestion}
                      disabled={
                        activeQuestionIndex ===
                        selectedSession.questions.length - 1
                      }
                      className="rounded-lg border border-slate-700 px-4 py-2.5 font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={evaluateAnswer}
                    disabled={
                      !activeQuestion.answer.trim() ||
                      evaluatingQuestionId === activeQuestion.id
                    }
                    className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {evaluatingQuestionId === activeQuestion.id
                      ? "Evaluating answer..."
                      : activeQuestion.feedback
                        ? "Evaluate Again"
                        : "Evaluate Answer"}
                  </button>
                </div>
              </section>

              {activeQuestion.feedback ? (
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-indigo-400">
                        AI Evaluation
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-white">
                        Interview feedback
                      </h3>
                    </div>

                    <ScoreBadge score={activeQuestion.feedback.score} />
                  </div>

                  <p className="mt-5 leading-7 text-slate-300">
                    {activeQuestion.feedback.summary}
                  </p>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <FeedbackList
                      title="Strengths"
                      items={activeQuestion.feedback.strengths}
                      emptyMessage="No specific strengths were returned."
                      variant="strength"
                    />

                    <FeedbackList
                      title="Improvements"
                      items={activeQuestion.feedback.improvements}
                      emptyMessage="No specific improvements were returned."
                      variant="improvement"
                    />
                  </div>

                  <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                    <h4 className="font-semibold text-indigo-300">
                      Suggested stronger answer
                    </h4>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                      {activeQuestion.feedback.suggestedAnswer}
                    </p>
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

type AnalyticsCardProps = {
  label: string;
  value: string;
  description: string;
};

function AnalyticsCard({
  label,
  value,
  description,
}: AnalyticsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>

      <p className="mt-2 text-2xl font-bold text-white">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </article>
  );
}

type FeedbackListProps = {
  title: string;
  items: string[];
  emptyMessage: string;
  variant: "strength" | "improvement";
};

function FeedbackList({
  title,
  items,
  emptyMessage,
  variant,
}: FeedbackListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
      <h4
        className={`font-semibold ${variant === "strength"
            ? "text-emerald-300"
            : "text-amber-300"
          }`}
      >
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span aria-hidden="true">
                {variant === "strength" ? "✓" : "→"}
              </span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let scoreClasses =
    "border-red-500/30 bg-red-500/10 text-red-300";

  if (score >= 80) {
    scoreClasses =
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  } else if (score >= 60) {
    scoreClasses =
      "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return (
    <div
      className={`flex h-20 w-20 items-center justify-center rounded-full border text-xl font-bold ${scoreClasses}`}
    >
      {score}
      <span className="ml-0.5 text-xs">/100</span>
    </div>
  );
}