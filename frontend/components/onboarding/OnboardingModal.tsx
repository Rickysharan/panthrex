"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OnboardingModalProps = {
  userId: string;
};

const steps = [
  "Welcome",
  "Career Goal",
  "Target Role",
  "Resume Setup",
  "Complete",
];

export default function OnboardingModal({
  userId,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeOnboarding() {
    setLoading(true);

    const supabase = createClient();

    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
      })
      .eq("id", userId);

    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0e1d] p-8 shadow-2xl">

        <p className="text-xs uppercase tracking-widest text-indigo-300">
          Step {step + 1} of {steps.length}
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          {steps[step]}
        </h2>

        {step === 0 && (
          <p className="mt-4 text-white/60">
            Welcome to Panthrex 🚀
            Your AI career assistant for resumes,
            jobs and interviews.
          </p>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-3">
            {[
              "Find a job",
              "Improve my resume",
              "Career switch",
              "Prepare interviews",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setGoal(item)}
                className={`block w-full rounded-xl border p-3 text-left transition ${
                  goal === item
                    ? "border-indigo-400 bg-indigo-500/20 text-white"
                    : "border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <input
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            placeholder="Example: Machine Learning Engineer"
            className="mt-5 w-full rounded-xl bg-white/5 p-3 text-white outline-none"
          />
        )}

        {step === 3 && (
          <p className="mt-5 text-white/60">
            You can upload your resume anytime from
            Resume Import or create a new ATS resume.
          </p>
        )}

        {step === 4 && (
          <p className="mt-5 text-white/60">
            Your Panthrex workspace is ready.
          </p>
        )}

        <button
          disabled={loading}
          onClick={() =>
            step === steps.length - 1
              ? completeOnboarding()
              : setStep(step + 1)
          }
          className="mt-8 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
        >
          {loading
            ? "Setting up..."
            : step === steps.length - 1
              ? "Start using Panthrex"
              : "Continue"}
        </button>

      </div>
    </div>
  );
}
