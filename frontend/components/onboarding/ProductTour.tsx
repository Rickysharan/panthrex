"use client";

import { useState } from "react";

type ProductTourProps = {
  onComplete: () => void;
};

const tourSteps = [
  {
    title: "Welcome to Panthrex 🚀",
    description:
      "Your AI career platform for resumes, job search, applications and interview preparation.",
  },
  {
    title: "Dashboard",
    description:
      "Track your career progress, profile strength, tasks and recent activity from one place.",
  },
  {
    title: "Resume Tools",
    description:
      "Build ATS-friendly resumes, import existing CVs and improve your content using AI.",
  },
  {
    title: "ATS Score",
    description:
      "Analyse your resume compatibility and discover improvements before applying.",
  },
  {
    title: "AI Job Search",
    description:
      "Find relevant roles and organise your job search workflow.",
  },
  {
    title: "Interview Coach",
    description:
      "Practise technical and behavioural interviews with AI assistance.",
  },
  {
    title: "Referrals & Account",
    description:
      "Invite friends, manage your plan, subscription and account settings.",
  },
];

export default function ProductTour({
  onComplete,
}: ProductTourProps) {
  const [step, setStep] = useState(0);

  const current = tourSteps[step];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0e1d] p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-indigo-300">
          Panthrex Tour {step + 1}/{tourSteps.length}
        </p>

        <h2 className="mt-4 text-2xl font-bold text-white">
          {current.title}
        </h2>

        <p className="mt-4 leading-6 text-white/60">
          {current.description}
        </p>

        <div className="mt-6 flex gap-2">
          {tourSteps.map((_, index) => (
            <span
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index === step
                  ? "bg-indigo-400"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (step === tourSteps.length - 1) {
              onComplete();
              return;
            }

            setStep((value) => value + 1);
          }}
          className="mt-8 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
        >
          {step === tourSteps.length - 1
            ? "Finish Tour"
            : "Continue"}
        </button>
      </div>
    </div>
  );
}
