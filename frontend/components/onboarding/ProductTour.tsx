"use client";

import {
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

type ProductTourProps = {
  onComplete: () => void;
};

const tourSteps = [
  {
    target: "dashboard-nav",
    title: "Your Dashboard 🚀",
    description:
      "Track your career progress, profile strength and recent activity here.",
  },
  {
    target: "resume-builder-nav",
    title: "Build your Resume",
    description:
      "Create ATS-friendly resumes and prepare professional applications.",
  },
  {
    target: "ats-score-nav",
    title: "ATS Resume Score",
    description:
      "Check your resume compatibility before applying.",
  },
  {
    target: "job-search-nav",
    title: "AI Job Search",
    description:
      "Find relevant roles and organise your job search workflow.",
  },
  {
    target: "interview-prep-nav",
    title: "Interview Coach",
    description:
      "Practice technical and behavioural interviews with AI.",
  },
  {
    target: "settings-nav",
    title: "Account & Plans",
    description:
      "Manage your profile, subscription and settings.",
  },
];

export default function ProductTour({
  onComplete,
}: ProductTourProps) {
  const [step, setStep] = useState(0);

  const [position, setPosition] =
    useState({
      top: 300,
      left: 320,
    });

  const current = tourSteps[step];

  useEffect(() => {
    const element =
      document.getElementById(
        current.target,
      );

    if (!element) {
      return;
    }

    element.classList.add(
      "tour-highlight",
    );

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    requestAnimationFrame(() => {
      const rect =
        element.getBoundingClientRect();

      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 20,
      });
    });

    return () => {
      element.classList.remove(
        "tour-highlight",
      );
    };
  }, [current]);

  function next() {
    if (
      step === tourSteps.length - 1
    ) {
      onComplete();
      return;
    }

    setStep((value) => value + 1);
  }

  function previous() {
    setStep((value) =>
      Math.max(0, value - 1),
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/30" />

      <div
        className="fixed z-[120] w-80 rounded-3xl
        border border-indigo-400/30
        bg-[#0b0e1d]/95 p-6 shadow-2xl
        backdrop-blur-xl"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div
          className="absolute -left-3 top-8
          h-6 w-6 rotate-45
          border-l border-b
          border-indigo-400/30
          bg-[#0b0e1d]"
        />

        <button
          onClick={onComplete}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
        >
          <X size={18} />
        </button>

        <p className="text-xs uppercase tracking-widest text-indigo-300">
          Panthrex Tour {step + 1}/{tourSteps.length}
        </p>

        <h2 className="mt-3 text-xl font-bold">
          {current.title}
        </h2>

        <p className="mt-3 text-sm text-white/60">
          {current.description}
        </p>

        <div className="mt-5 flex gap-2">
          {tourSteps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index === step
                  ? "bg-indigo-400"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={previous}
              className="flex-1 rounded-xl border border-white/10 py-3"
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Back
            </button>
          )}

          <button
            onClick={next}
            className="flex-1 rounded-xl bg-indigo-500 py-3 font-semibold"
          >
            {step === tourSteps.length - 1
              ? "Finish"
              : "Next"}

            <ArrowRight
              size={16}
              className="inline ml-2"
            />
          </button>
        </div>
      </div>
    </>
  );
}
