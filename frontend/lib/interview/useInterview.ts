"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  InterviewAnswer,
  InterviewQuestion,
  InterviewSession,
  InterviewSessionStats,
} from "@/lib/interview/types";

const STORAGE_KEY = "panthrex-interview-sessions";

export function useInterview() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, loading]);

  const createSession = useCallback(
    (session: InterviewSession) => {
      setSessions((previous) => [session, ...previous]);
    },
    [],
  );

  const updateSession = useCallback(
    (updated: InterviewSession) => {
      setSessions((previous) =>
        previous.map((session) =>
          session.id === updated.id ? updated : session,
        ),
      );
    },
    [],
  );

  const deleteSession = useCallback((id: string) => {
    setSessions((previous) =>
      previous.filter((session) => session.id !== id),
    );
  }, []);

  const addAnswer = useCallback(
    (
      sessionId: string,
      answer: InterviewAnswer,
    ) => {
      setSessions((previous) =>
        previous.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          return {
            ...session,
            answers: [...session.answers, answer],
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const updateQuestions = useCallback(
    (
      sessionId: string,
      questions: InterviewQuestion[],
    ) => {
      setSessions((previous) =>
        previous.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                questions,
                updatedAt: new Date().toISOString(),
              }
            : session,
        ),
      );
    },
    [],
  );

  const stats = useMemo<InterviewSessionStats>(() => {
    const completed = sessions.filter(
      (session) => session.status === "completed",
    );

    const evaluations = sessions.flatMap((session) =>
      session.answers
        .map((answer) => answer.evaluation)
        .filter(Boolean),
    );

    const averageScore =
      evaluations.length === 0
        ? 0
        : evaluations.reduce(
            (sum, evaluation) => sum + evaluation!.score,
            0,
          ) / evaluations.length;

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      totalQuestionsAnswered: sessions.reduce(
        (sum, session) => sum + session.answers.length,
        0,
      ),
      averageScore: Number(averageScore.toFixed(1)),
    };
  }, [sessions]);

  return {
    loading,
    sessions,
    stats,
    createSession,
    updateSession,
    deleteSession,
    addAnswer,
    updateQuestions,
  };
}