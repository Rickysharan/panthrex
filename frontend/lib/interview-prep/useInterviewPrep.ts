"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  InterviewAnswerFeedback,
  InterviewSession,
} from "@/lib/interview-prep/types";

const STORAGE_KEY = "panthrex-interview-sessions";

export function useInterviewPrep() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] =
    useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load interview sessions",
        error,
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions),
    );
  }, [sessions, isLoaded]);

  const selectedSession = useMemo(
    () =>
      sessions.find(
        (session) =>
          session.id === selectedSessionId,
      ) ?? null,
    [sessions, selectedSessionId],
  );

  function saveSession(
    session: InterviewSession,
  ) {
    setSessions((previous) => [
      session,
      ...previous,
    ]);

    return session;
  }

  function updateSession(
    session: InterviewSession,
  ) {
    setSessions((previous) =>
      previous.map((item) =>
        item.id === session.id
          ? session
          : item,
      ),
    );
  }

  function deleteSession(id: string) {
    setSessions((previous) =>
      previous.filter(
        (item) => item.id !== id,
      ),
    );

    if (selectedSessionId === id) {
      setSelectedSessionId(null);
    }
  }

  function duplicateSession(id: string) {
    const session = sessions.find(
      (item) => item.id === id,
    );

    if (!session) {
      return null;
    }

    const duplicated: InterviewSession = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions((previous) => [
      duplicated,
      ...previous,
    ]);

    return duplicated;
  }

  function clearSessions() {
    setSessions([]);
    setSelectedSessionId(null);
  }

  function updateAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
  ) {
    setSessions((previous) =>
      previous.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        return {
          ...session,
          updatedAt:
            new Date().toISOString(),
          questions:
            session.questions.map(
              (question) =>
                question.id === questionId
                  ? {
                      ...question,
                      answer,
                    }
                  : question,
            ),
        };
      }),
    );
  }

  function saveFeedback(
    sessionId: string,
    questionId: string,
    feedback: InterviewAnswerFeedback,
  ) {
    setSessions((previous) =>
      previous.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        return {
          ...session,
          updatedAt:
            new Date().toISOString(),
          questions:
            session.questions.map(
              (question) =>
                question.id === questionId
                  ? {
                      ...question,
                      completed: true,
                      feedback,
                    }
                  : question,
            ),
        };
      }),
    );
  }

  const completedQuestions =
    selectedSession?.questions.filter(
      (question) => question.completed,
    ).length ?? 0;

  const totalQuestions =
    selectedSession?.questions.length ?? 0;

  const progress =
    totalQuestions === 0
      ? 0
      : Math.round(
          (completedQuestions /
            totalQuestions) *
            100,
        );

  return {
    isLoaded,

    sessions,

    selectedSession,

    selectedSessionId,

    completedQuestions,

    totalQuestions,

    progress,

    setSelectedSessionId,

    saveSession,

    updateSession,

    deleteSession,

    duplicateSession,

    clearSessions,

    updateAnswer,

    saveFeedback,
  };
}