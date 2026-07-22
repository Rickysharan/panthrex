"use client";

import { useEffect, useMemo, useState } from "react";

import type { ResumeData } from "@/lib/resume/types";
import type {
  ResumeTailorAnalysis,
  ResumeTailorSession,
  TailorResumeRequest,
  TailorResumeResponse,
} from "./types";

const STORAGE_KEY = "panthrex.resume-tailor.sessions";

function loadStoredSessions(): ResumeTailorSession[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as ResumeTailorSession[])
      : [];
  } catch {
    console.error("Unable to load resume tailor sessions.");
    return [];
  }
}

export function useResumeTailor() {
  const [sessions, setSessions] =
    useState<ResumeTailorSession[]>(loadStoredSessions);

  const [selectedSessionId, setSelectedSessionId] =
    useState<string | null>(() => {
      const sessions = loadStoredSessions();
      return sessions.length > 0 ? sessions[0].id : null;
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const selectedSession = useMemo(
    () =>
      sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId],
  );

  async function tailorResume(request: TailorResumeRequest) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resume-tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = (await response.json()) as TailorResumeResponse;

      if (!response.ok || !data.success) {
        throw new Error("Unable to tailor resume.");
      }

      const session: ResumeTailorSession = {
        id: crypto.randomUUID(),
        name: `${request.targetRole} Resume`,
        targetRole: request.targetRole,
        company: request.company ?? "",
        jobDescription: request.jobDescription,
        originalResume: request.resume,
        tailoredResume: data.tailoredResume,
        analysis: data.analysis,
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSessions((previous) => [session, ...previous]);
      setSelectedSessionId(session.id);

      return session;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to tailor resume.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  function deleteSession(id: string) {
    setSessions((previous) => previous.filter((item) => item.id !== id));

    if (selectedSessionId === id) {
      const remaining = sessions.filter((item) => item.id !== id);

      setSelectedSessionId(
        remaining.length > 0 ? remaining[0].id : null,
      );
    }
  }

  function clearSessions() {
    setSessions([]);
    setSelectedSessionId(null);
  }

  function duplicateSession(id: string) {
    const existing = sessions.find((session) => session.id === id);

    if (!existing) return null;

    const duplicated: ResumeTailorSession = {
      ...existing,
      id: crypto.randomUUID(),
      name: `${existing.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions((previous) => [duplicated, ...previous]);
    setSelectedSessionId(duplicated.id);

    return duplicated;
  }

  function updateAnalysis(
    sessionId: string,
    analysis: ResumeTailorAnalysis,
    tailoredResume: ResumeData,
  ) {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              analysis,
              tailoredResume,
              updatedAt: new Date().toISOString(),
            }
          : session,
      ),
    );
  }

  return {
    sessions,
    selectedSession,
    selectedSessionId,
    loading,
    error,
    tailorResume,
    deleteSession,
    duplicateSession,
    clearSessions,
    updateAnalysis,
    setSelectedSessionId,
    setError,
  };
}