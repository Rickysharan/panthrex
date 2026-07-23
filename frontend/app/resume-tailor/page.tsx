import { Suspense } from "react";

import ResumeTailor from "@/components/resume-tailor/ResumeTailor";

function ResumeTailorLoading() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading Resume Tailor...
      </div>
    </div>
  );
}

export default function ResumeTailorPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Suspense fallback={<ResumeTailorLoading />}>
        <ResumeTailor />
      </Suspense>
    </main>
  );
}
