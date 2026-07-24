import { Suspense } from "react";

import InterviewCoach from "@/components/interview-prep/InterviewCoach";

export default function InterviewPrepPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />

            <p className="mt-4 text-sm text-slate-400">
              Loading interview preparation...
            </p>
          </div>
        </main>
      }
    >
      <main className="min-h-screen bg-slate-950">
        <InterviewCoach />
      </main>
    </Suspense>
  );
}
