"use client";

import JobMatchCard from "@/components/dashboard/JobMatchCard";
import { useJobMatching } from "@/lib/job-matching/useJobMatching";

export default function DashboardJobMatchCard() {
  const {
    isLoaded,
    savedMatches,
    averageScore,
    bestMatch,
  } = useJobMatching();

  return (
    <JobMatchCard
      savedAnalyses={
        isLoaded ? savedMatches.length : 0
      }
      averageScore={
        isLoaded ? averageScore : 0
      }
      bestScore={
        isLoaded
          ? bestMatch?.result.overallScore ?? 0
          : 0
      }
    />
  );
}