"use client";

import { Clock, History, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ResumeVersion = {
    id: string;
    version_number: number;
    created_at: string;
    snapshot: unknown;
};

import type { ResumeData } from "@/lib/resume/types";

type Props = {
    resumeId: string;
    resumeData: ResumeData;
    restoreResumeVersion: (snapshot: unknown) => boolean;
};

export default function ResumeVersionHistory({
    resumeId,
    resumeData,
    restoreResumeVersion,
}: Props) {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadVersions = useCallback(async () => {
        if (!resumeId) {
            setVersions([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `/api/resume-versions?resumeId=${encodeURIComponent(
                    resumeId,
                )}`,
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load resume versions.",
                );
            }

            setVersions(data.versions ?? []);
            setError("");
        } catch (loadError) {
            setVersions([]);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Unable to load resume versions.",
            );
        } finally {
            setLoading(false);
        }
    }, [resumeId]);

    async function saveVersion() {
        if (!resumeId || saving) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await fetch("/api/resume-versions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resumeId,
                    snapshot: resumeData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save the resume version.",
                );
            }

            await loadVersions();
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Unable to save the resume version.",
            );
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        const loadTimer = window.setTimeout(() => {
            void loadVersions();
        }, 0);

        return () => {
            window.clearTimeout(loadTimer);
        };
    }, [loadVersions]);

    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <History className="h-5 w-5 text-violet-400" />

                    <div>
                        <h3 className="font-semibold text-white">
                            Version History
                        </h3>

                        <p className="text-xs text-white/45">
                            Save important resume milestones.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={saveVersion}
                    disabled={saving || !resumeId}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />

                    {saving ? "Saving..." : "Save Version"}
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="mt-6 space-y-3">
                {loading ? (
                    <p className="text-sm text-white/40">
                        Loading versions...
                    </p>
                ) : versions.length === 0 ? (
                    <p className="text-sm text-white/40">
                        No saved versions yet.
                    </p>
                ) : (
                    versions.map((version) => (
                        <div
                            key={version.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                        >
                            <div>
                                <p className="font-medium text-white">
                                    Version {version.version_number}
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                                    <Clock className="h-3.5 w-3.5" />

                                    {new Date(
                                        version.created_at,
                                    ).toLocaleString()}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const restored = restoreResumeVersion(
                                        version.snapshot,
                                    );

                                    if (restored) {
                                        setError("");
                                    } else {
                                        setError(
                                            "Unable to restore this resume version.",
                                        );
                                    }
                                }}
                                className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-sm font-medium text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-400/20"
                            >
                                Restore
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}