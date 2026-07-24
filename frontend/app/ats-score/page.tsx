"use client";

import {
    AlertTriangle,
    BarChart3,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    FileSearch,
    Gauge,
    Lightbulb,
    LoaderCircle,
    RotateCcw,
    ScanSearch,
    Sparkles,
    Target,
    TextSearch,
    X,
    XCircle,
} from "lucide-react";
import {
    Suspense,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useSearchParams } from "next/navigation";

import AtsScoreHistorySection from "@/components/ats-score/AtsScoreHistorySection";
import AppLayout from "@/components/layout/AppLayout";
import type {
    AtsCategoryScore,
    AtsFormattingCheck,
    AtsIssue,
    AtsIssueSeverity,
    AtsKeywordMatch,
    AtsRecommendation,
    AtsScoreLevel,
    AtsScoreResult,
    AtsSectionCheck,
} from "@/lib/ats-score/types";
import { useAtsScore } from "@/lib/ats-score/useAtsScore";
import type { SavedAtsAnalysis } from "@/lib/ats-score/useAtsScoreHistory";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";
import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";

function AtsScorePageContent() {
    const searchParams = useSearchParams();

    const applicationId =
        searchParams.get("applicationId");

    const { resumeData } = useResumeBuilder();

    const {
        applications,
        updateApplication,
        isLoaded: isJobTrackerLoaded,
    } = useJobTracker();

    const linkedApplication = useMemo(
        () =>
            applicationId
                ? applications.find(
                      (application) =>
                          application.id === applicationId,
                  ) ?? null
                : null,
        [applicationId, applications],
    );

    const hasPrefilledApplication = useRef(false);

    const {
        result,
        error,
        isAnalysing,
        hasResult,
        criticalIssueCount,
        highPriorityRecommendationCount,
        passedFormattingChecks,
        totalFormattingChecks,
        analyseResume,
        loadResult,
        clearResult,
    } = useAtsScore();

    const [jobDescription, setJobDescription] =
        useState("");

    useEffect(() => {
        hasPrefilledApplication.current = false;
    }, [applicationId]);

    useEffect(() => {
        if (
            !isJobTrackerLoaded ||
            !linkedApplication ||
            hasPrefilledApplication.current
        ) {
            return;
        }

        setJobDescription(
            linkedApplication.jobDescription ?? "",
        );

        hasPrefilledApplication.current = true;
    }, [
        isJobTrackerLoaded,
        linkedApplication,
    ]);

    const characterCount = jobDescription.length;

    const canAnalyse = useMemo(
        () =>
            jobDescription.trim().length >= 50 &&
            !isAnalysing,
        [jobDescription, isAnalysing],
    );

    const resumeName =
        resumeData.title.trim() ||
        resumeData.personalDetails.fullName.trim() ||
        "Current resume";

    async function handleAnalyse(): Promise<void> {
        await analyseResume({
            resume: resumeData,
            jobDescription,
        });
    }

    function handleClear(): void {
        setJobDescription("");
        clearResult();
    }

    function handleLoadAnalysis(
        analysis: SavedAtsAnalysis,
    ): void {
        setJobDescription(analysis.jobDescription);
        loadResult(analysis.result);
    }

    async function handleAnalysisSaved(
        analysis: SavedAtsAnalysis,
    ): Promise<void> {
        if (!applicationId || !linkedApplication) {
            return;
        }

        await updateApplication(applicationId, {
            jobDescription:
                jobDescription.trim(),
            atsAnalysisId: analysis.id,
        });
    }

    return (
        <AppLayout
            title="ATS Resume Score"
            description="Analyse your resume against a vacancy and identify the changes most likely to improve ATS alignment."
        >
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent p-6 sm:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                                    <Sparkles size={17} />

                                    <span>Panthrex Resume Intelligence</span>
                                </div>

                                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Check your resume before you apply
                                </h2>

                                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                                    Compare your current Panthrex resume with a
                                    complete job description. The analysis reviews
                                    keywords, section quality, measurable impact,
                                    readability and ATS compatibility.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                                    <FileSearch size={24} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                                        Resume source
                                    </p>

                                    <p className="mt-1 max-w-[230px] truncate text-sm font-semibold text-white">
                                        {resumeName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.45fr)]">
                        <div className="self-start rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7 xl:sticky xl:top-28">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                                    <TextSearch size={21} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Job description
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-white/45">
                                        Paste the complete vacancy text for a more
                                        reliable keyword and requirements analysis.
                                    </p>
                                </div>
                            </div>

                            <label
                                htmlFor="ats-job-description"
                                className="mb-2 mt-6 block text-sm font-medium text-white/70"
                            >
                                Vacancy details
                            </label>

                            <textarea
                                id="ats-job-description"
                                rows={19}
                                value={jobDescription}
                                disabled={isAnalysing}
                                onChange={(event) => {
                                    setJobDescription(event.target.value);

                                    if (hasResult) {
                                        clearResult();
                                    }
                                }}
                                placeholder="Paste the full job description here, including responsibilities, required skills, qualifications and preferred experience..."
                                className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/70 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <div className="mt-2 flex items-center justify-between gap-4 text-xs">
                                <span
                                    className={
                                        characterCount >= 50
                                            ? "text-emerald-400"
                                            : "text-white/35"
                                    }
                                >
                                    Minimum 50 characters
                                </span>

                                <span className="text-white/35">
                                    {characterCount.toLocaleString()} characters
                                </span>
                            </div>

                            {error ? (
                                <div
                                    role="alert"
                                    className="mt-5 flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200"
                                >
                                    <CircleAlert
                                        size={19}
                                        className="mt-0.5 shrink-0"
                                    />

                                    <span>{error}</span>
                                </div>
                            ) : null}

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={
                                        isAnalysing ||
                                        (!jobDescription && !hasResult)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <RotateCcw size={17} />

                                    Clear
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAnalyse}
                                    disabled={!canAnalyse}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                    {isAnalysing ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Analysing
                                        </>
                                    ) : (
                                        <>
                                            <ScanSearch size={17} />

                                            {hasResult
                                                ? "Analyse again"
                                                : "Run ATS check"}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-6 rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.07] p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
                                    <Lightbulb size={16} />

                                    Accurate results
                                </p>

                                <p className="mt-2 text-xs leading-6 text-white/45">
                                    Use the original vacancy description rather than
                                    a shortened summary. Only add suggested keywords
                                    that truthfully represent your experience.
                                </p>
                            </div>
                        </div>

                        <div className="min-w-0">
                            {isAnalysing ? (
                                <LoadingResults />
                            ) : result ? (
                                <AtsResults
                                    result={result}
                                    criticalIssueCount={criticalIssueCount}
                                    highPriorityRecommendationCount={
                                        highPriorityRecommendationCount
                                    }
                                    passedFormattingChecks={
                                        passedFormattingChecks
                                    }
                                    totalFormattingChecks={
                                        totalFormattingChecks
                                    }
                                />
                            ) : (
                                <EmptyResults />
                            )}
                        </div>
                    </section>

                    <AtsScoreHistorySection
                        result={result}
                        jobDescription={jobDescription}
                        resumeName={resumeName}
                        onLoadAnalysis={handleLoadAnalysis}
                        onAnalysisSaved={handleAnalysisSaved}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

export default function AtsScorePage() {
    return (
        <Suspense
            fallback={
                <AppLayout
                    title="ATS Resume Score"
                    description="Analyse your resume against a vacancy and identify the changes most likely to improve ATS alignment."
                >
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <LoaderCircle
                            size={28}
                            className="animate-spin text-indigo-300"
                        />
                    </div>
                </AppLayout>
            }
        >
            <AtsScorePageContent />
        </Suspense>
    );
}

function EmptyResults() {
    return (
        <section className="flex min-h-[620px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
            <div className="max-w-xl">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                    <Gauge size={36} />
                </div>

                <h2 className="mt-7 text-2xl font-bold text-white sm:text-3xl">
                    Your ATS analysis will appear here
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/45 sm:text-base">
                    Paste a job description and Panthrex will calculate your
                    ATS score, identify missing keywords, review resume
                    sections and prioritise improvements before you apply.
                </p>

                <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                    <FeaturePreview
                        icon={<Target size={18} />}
                        title="Keyword match"
                    />

                    <FeaturePreview
                        icon={<BarChart3 size={18} />}
                        title="Category scores"
                    />

                    <FeaturePreview
                        icon={<Lightbulb size={18} />}
                        title="Priority actions"
                    />
                </div>
            </div>
        </section>
    );
}

function FeaturePreview({
    icon,
    title,
}: {
    icon: ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className="text-indigo-300">{icon}</span>

            <span className="text-xs font-medium text-white/55">
                {title}
            </span>
        </div>
    );
}

function LoadingResults() {
    return (
        <section className="min-h-[620px] rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                    <LoaderCircle
                        size={24}
                        className="animate-spin"
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Analysing your resume
                    </h2>

                    <p className="mt-1 text-sm text-white/40">
                        Reviewing keywords, sections, impact and readability.
                    </p>
                </div>
            </div>

            <div className="mt-8 animate-pulse space-y-6">
                <div className="h-48 rounded-2xl bg-white/[0.05]" />

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="h-32 rounded-2xl bg-white/[0.05]" />
                    <div className="h-32 rounded-2xl bg-white/[0.05]" />
                    <div className="h-32 rounded-2xl bg-white/[0.05]" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="h-72 rounded-2xl bg-white/[0.05]" />
                    <div className="h-72 rounded-2xl bg-white/[0.05]" />
                </div>
            </div>
        </section>
    );
}

function AtsResults({
    result,
    criticalIssueCount,
    highPriorityRecommendationCount,
    passedFormattingChecks,
    totalFormattingChecks,
}: {
    result: AtsScoreResult;
    criticalIssueCount: number;
    highPriorityRecommendationCount: number;
    passedFormattingChecks: number;
    totalFormattingChecks: number;
}) {
    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <ScoreLevelBadge level={result.scoreLevel} />

                        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                            ATS analysis complete
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-white/60">
                            {result.summary}
                        </p>
                    </div>

                    <ScoreRing
                        score={result.overallScore}
                        label="Overall ATS score"
                        size="large"
                    />
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Critical issues"
                    value={criticalIssueCount}
                    detail="Require immediate attention"
                    icon={<AlertTriangle size={20} />}
                    variant={
                        criticalIssueCount > 0 ? "danger" : "success"
                    }
                />

                <MetricCard
                    label="Priority actions"
                    value={highPriorityRecommendationCount}
                    detail="Critical or high priority"
                    icon={<Lightbulb size={20} />}
                    variant="warning"
                />

                <MetricCard
                    label="Formatting checks"
                    value={`${passedFormattingChecks}/${totalFormattingChecks}`}
                    detail="Checks currently passed"
                    icon={<CheckCircle2 size={20} />}
                    variant="success"
                />

                <MetricCard
                    label="Missing keywords"
                    value={result.missingKeywords.length}
                    detail="Vacancy terms not evidenced"
                    icon={<TextSearch size={20} />}
                    variant="default"
                />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                <ScoreCard
                    title="Keywords"
                    score={result.keywordScore}
                />

                <ScoreCard
                    title="Formatting"
                    score={result.formattingScore}
                />

                <ScoreCard
                    title="Completeness"
                    score={result.completenessScore}
                />

                <ScoreCard
                    title="Impact"
                    score={result.impactScore}
                />

                <ScoreCard
                    title="Readability"
                    score={result.readabilityScore}
                />
            </section>

            <Panel
                title="Category breakdown"
                description="Detailed assessment across the principal ATS and recruiter evaluation criteria."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {result.categoryScores.map((category) => (
                        <CategoryScore
                            key={category.category}
                            category={category}
                        />
                    ))}
                </div>
            </Panel>

            <section className="grid gap-6 lg:grid-cols-2">
                <KeywordPanel
                    title="Matched keywords"
                    description="Relevant vacancy terms supported by your resume."
                    keywords={result.matchedKeywords}
                    matched
                />

                <KeywordPanel
                    title="Missing keywords"
                    description="Important terms not currently evidenced in your resume."
                    keywords={result.missingKeywords}
                    matched={false}
                />
            </section>

            <Panel
                title="Resume section review"
                description="Checks whether each core ATS section is present and sufficiently complete."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {result.sectionChecks.map((section) => (
                        <SectionCheckCard
                            key={section.section}
                            section={section}
                        />
                    ))}
                </div>
            </Panel>

            <Panel
                title="ATS formatting checks"
                description="Structural checks based on the resume information available to Panthrex."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {result.formattingChecks.map((check) => (
                        <FormattingCheckCard
                            key={check.id}
                            check={check}
                        />
                    ))}
                </div>
            </Panel>

            <section className="grid gap-6 lg:grid-cols-2">
                <Panel
                    title="Resume strengths"
                    description="Evidence that positively supports this application."
                >
                    <TextList
                        items={result.strengths}
                        emptyMessage="No specific strengths were returned."
                    />
                </Panel>

                <Panel
                    title="Resume statistics"
                    description="A structural snapshot of the resume submitted for analysis."
                >
                    <StatisticsGrid result={result} />
                </Panel>
            </section>

            <Panel
                title="Issues reducing your score"
                description="Problems that may lower ATS ranking or recruiter confidence."
            >
                {result.issues.length > 0 ? (
                    <div className="space-y-4">
                        {result.issues.map((issue) => (
                            <IssueCard
                                key={issue.id}
                                issue={issue}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyPanelMessage>
                        No material ATS issues were identified.
                    </EmptyPanelMessage>
                )}
            </Panel>

            <Panel
                title="Prioritised recommendations"
                description="Specific actions to improve your resume before submitting the application."
            >
                {result.recommendations.length > 0 ? (
                    <div className="space-y-4">
                        {result.recommendations.map(
                            (recommendation, index) => (
                                <RecommendationCard
                                    key={recommendation.id}
                                    recommendation={recommendation}
                                    index={index}
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <EmptyPanelMessage>
                        No additional recommendations were returned.
                    </EmptyPanelMessage>
                )}
            </Panel>
        </div>
    );
}

function ScoreLevelBadge({
    level,
}: {
    level: AtsScoreLevel;
}) {
    const configuration: Record<
        AtsScoreLevel,
        {
            label: string;
            className: string;
        }
    > = {
        excellent: {
            label: "Excellent ATS alignment",
            className:
                "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        },
        good: {
            label: "Good ATS alignment",
            className:
                "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
        },
        "needs-improvement": {
            label: "Needs improvement",
            className:
                "border-amber-400/20 bg-amber-500/10 text-amber-300",
        },
        poor: {
            label: "Poor ATS alignment",
            className:
                "border-red-400/20 bg-red-500/10 text-red-300",
        },
    };

    const selected = configuration[level];

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${selected.className}`}
        >
            <Gauge size={14} />

            {selected.label}
        </span>
    );
}

function ScoreRing({
    score,
    label,
    size,
}: {
    score: number;
    label: string;
    size: "small" | "large";
}) {
    const safeScore = Math.max(
        0,
        Math.min(100, Math.round(score)),
    );

    const diameter = size === "large" ? 150 : 74;
    const strokeWidth = size === "large" ? 11 : 7;
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference -
        (safeScore / 100) * circumference;

    return (
        <div
            className="relative shrink-0"
            style={{
                width: diameter,
                height: diameter,
            }}
            aria-label={`${label}: ${safeScore}%`}
        >
            <svg
                width={diameter}
                height={diameter}
                className="-rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-white/[0.07]"
                />

                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-indigo-400 transition-all duration-700"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className={
                        size === "large"
                            ? "text-4xl font-bold text-white"
                            : "text-lg font-bold text-white"
                    }
                >
                    {safeScore}
                    <span
                        className={
                            size === "large"
                                ? "text-base text-white/35"
                                : "text-xs text-white/35"
                        }
                    >
                        %
                    </span>
                </span>

                {size === "large" ? (
                    <span className="mt-1 text-xs font-medium text-white/35">
                        ATS score
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function ScoreCard({
    title,
    score,
}: {
    title: string;
    score: number;
}) {
    return (
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex flex-col items-center gap-4 text-center">
                <ScoreRing
                    score={score}
                    label={title}
                    size="small"
                />

                <p className="w-full break-words text-sm font-semibold leading-5 text-white/70">
                    {title}
                </p>
            </div>
        </article>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon,
    variant,
}: {
    label: string;
    value: number | string;
    detail: string;
    icon: ReactNode;
    variant: "default" | "danger" | "warning" | "success";
}) {
    const classes = {
        default: "bg-indigo-500/10 text-indigo-300",
        danger: "bg-red-500/10 text-red-300",
        warning: "bg-amber-500/10 text-amber-300",
        success: "bg-emerald-500/10 text-emerald-300",
    };

    return (
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes[variant]}`}
            >
                {icon}
            </div>

            <p className="mt-5 text-2xl font-bold text-white">
                {value}
            </p>

            <p className="mt-1 text-sm font-semibold text-white/65">
                {label}
            </p>

            <p className="mt-1 text-xs text-white/35">
                {detail}
            </p>
        </article>
    );
}

function Panel({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/40">
                    {description}
                </p>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
}

function CategoryScore({
    category,
}: {
    category: AtsCategoryScore;
}) {
    const safePercentage = Math.max(
        0,
        Math.min(100, Math.round(category.percentage)),
    );

    return (
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {category.label}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/40">
                        {category.summary}
                    </p>
                </div>

                <span className="shrink-0 text-sm font-bold text-indigo-300">
                    {safePercentage}%
                </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                    style={{
                        width: `${safePercentage}%`,
                    }}
                />
            </div>
        </article>
    );
}

function KeywordPanel({
    title,
    description,
    keywords,
    matched,
}: {
    title: string;
    description: string;
    keywords: AtsKeywordMatch[];
    matched: boolean;
}) {
    return (
        <Panel
            title={title}
            description={description}
        >
            {keywords.length > 0 ? (
                <div className="space-y-3">
                    {keywords.map((keyword) => (
                        <div
                            key={`${title}-${keyword.keyword}`}
                            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className={
                                        matched
                                            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300"
                                            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-300"
                                    }
                                >
                                    {matched ? (
                                        <Check size={15} />
                                    ) : (
                                        <X size={15} />
                                    )}
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white/75">
                                        {keyword.keyword}
                                    </p>

                                    <p className="mt-0.5 text-xs text-white/30">
                                        Resume:{" "}
                                        {keyword.occurrencesInResume} · Job:{" "}
                                        {
                                            keyword.occurrencesInJobDescription
                                        }
                                    </p>
                                </div>
                            </div>

                            <ImportanceBadge
                                importance={keyword.importance}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyPanelMessage>
                    {matched
                        ? "No directly matched keywords were identified."
                        : "No significant missing keywords were identified."}
                </EmptyPanelMessage>
            )}
        </Panel>
    );
}

function ImportanceBadge({
    importance,
}: {
    importance: AtsKeywordMatch["importance"];
}) {
    const className =
        importance === "required"
            ? "border-red-400/20 bg-red-500/10 text-red-300"
            : importance === "preferred"
                ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/[0.05] text-white/45";

    return (
        <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${className}`}
        >
            {importance}
        </span>
    );
}

function SectionCheckCard({
    section,
}: {
    section: AtsSectionCheck;
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-3">
                <span
                    className={
                        section.complete
                            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"
                            : section.present
                                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"
                                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300"
                    }
                >
                    {section.complete ? (
                        <CheckCircle2 size={18} />
                    ) : section.present ? (
                        <AlertTriangle size={18} />
                    ) : (
                        <XCircle size={18} />
                    )}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">
                            {section.label}
                        </h3>

                        <span className="text-sm font-bold text-indigo-300">
                            {section.score}%
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-white/40">
                        {section.recommendation}
                    </p>
                </div>
            </div>
        </article>
    );
}

function FormattingCheckCard({
    check,
}: {
    check: AtsFormattingCheck;
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-3">
                <span
                    className={
                        check.passed
                            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"
                            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"
                    }
                >
                    {check.passed ? (
                        <Check size={18} />
                    ) : (
                        <AlertTriangle size={18} />
                    )}
                </span>

                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {check.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/40">
                        {check.description}
                    </p>

                    {!check.passed ? (
                        <p className="mt-3 text-xs leading-5 text-amber-200/70">
                            {check.recommendation}
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function TextList({
    items,
    emptyMessage,
}: {
    items: string[];
    emptyMessage: string;
}) {
    if (items.length === 0) {
        return (
            <EmptyPanelMessage>
                {emptyMessage}
            </EmptyPanelMessage>
        );
    }

    return (
        <ul className="space-y-4">
            {items.map((item, index) => (
                <li
                    key={`${item}-${index}`}
                    className="flex gap-3 text-sm leading-7 text-white/60"
                >
                    <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                        <Check size={12} />
                    </span>

                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function StatisticsGrid({
    result,
}: {
    result: AtsScoreResult;
}) {
    const items = [
        {
            label: "Total words",
            value: result.statistics.totalWords,
        },
        {
            label: "Summary words",
            value: result.statistics.summaryWordCount,
        },
        {
            label: "Experience entries",
            value: result.statistics.experienceEntries,
        },
        {
            label: "Education entries",
            value: result.statistics.educationEntries,
        },
        {
            label: "Skills",
            value: result.statistics.skillCount,
        },
        {
            label: "Projects",
            value: result.statistics.projectCount,
        },
        {
            label: "Certifications",
            value: result.statistics.certificationCount,
        },
        {
            label: "Quantified bullets",
            value: result.statistics.quantifiedBulletCount,
        },
        {
            label: "Action verbs",
            value: result.statistics.actionVerbCount,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-black/20 p-3"
                >
                    <p className="text-lg font-bold text-white">
                        {item.value}
                    </p>

                    <p className="mt-1 text-xs text-white/35">
                        {item.label}
                    </p>
                </div>
            ))}
        </div>
    );
}

function IssueCard({
    issue,
}: {
    issue: AtsIssue;
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                        <AlertTriangle size={20} />
                    </span>

                    <div>
                        <h3 className="font-semibold text-white">
                            {issue.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-white/45">
                            {issue.description}
                        </p>

                        <div className="mt-4 flex gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                            <ChevronRight
                                size={17}
                                className="mt-0.5 shrink-0 text-indigo-300"
                            />

                            <p className="text-xs leading-6 text-white/55">
                                {issue.recommendation}
                            </p>
                        </div>
                    </div>
                </div>

                <SeverityBadge severity={issue.severity} />
            </div>
        </article>
    );
}

function RecommendationCard({
    recommendation,
    index,
}: {
    recommendation: AtsRecommendation;
    index: number;
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-bold text-indigo-300">
                        {index + 1}
                    </span>

                    <div>
                        <h3 className="font-semibold text-white">
                            {recommendation.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-white/45">
                            {recommendation.description}
                        </p>

                        <p className="mt-3 text-xs leading-6 text-indigo-200/70">
                            Expected impact:{" "}
                            {recommendation.expectedImpact}
                        </p>
                    </div>
                </div>

                <SeverityBadge
                    severity={recommendation.priority}
                />
            </div>
        </article>
    );
}

function SeverityBadge({
    severity,
}: {
    severity: AtsIssueSeverity;
}) {
    const className =
        severity === "critical"
            ? "border-red-400/20 bg-red-500/10 text-red-300"
            : severity === "high"
                ? "border-orange-400/20 bg-orange-500/10 text-orange-300"
                : severity === "medium"
                    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                    : "border-white/10 bg-white/[0.05] text-white/45";

    return (
        <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}
        >
            {severity}
        </span>
    );
}

function EmptyPanelMessage({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/35">
            {children}
        </div>
    );
}