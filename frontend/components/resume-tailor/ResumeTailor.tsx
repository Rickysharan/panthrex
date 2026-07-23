"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";
import { useResumeTailor } from "@/lib/resume-tailor/useResumeTailor";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";

export default function ResumeTailor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const applicationId =
    searchParams.get("applicationId");

  const { applications, updateApplication } =
    useJobTracker();

  const linkedApplication =
    applications.find(
      (application) =>
        application.id === applicationId,
    ) ?? null;

  const {
    resumeData,
    updateTitle,
    updatePersonalDetails,
    updateWorkExperience,
    updateEducation,
    addSkill,
    updateProject,
    updateCertification,
  } = useResumeBuilder();

  const {
    tailorResume,
    loading,
    error,
    selectedSession,
  } = useResumeTailor();

  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hasAppliedResume, setHasAppliedResume] =
    useState(false);

  const [hasInitialisedApplication, setHasInitialisedApplication] =
    useState(false);

  useEffect(() => {
    if (
      hasInitialisedApplication ||
      !linkedApplication
    ) {
      return;
    }

    setTargetRole(linkedApplication.jobTitle);
    setCompany(linkedApplication.companyName);
    setJobDescription(
      linkedApplication.jobDescription ?? "",
    );
    setHasInitialisedApplication(true);
  }, [
    hasInitialisedApplication,
    linkedApplication,
  ]);

  async function handleSubmit() {
    const normalizedTargetRole = targetRole.trim();
    const normalizedCompany = company.trim();
    const normalizedJobDescription =
      jobDescription.trim();

    if (!normalizedTargetRole) {
      return;
    }

    if (!normalizedJobDescription) {
      return;
    }

    setHasAppliedResume(false);

    const session = await tailorResume({
      targetRole: normalizedTargetRole,
      company: normalizedCompany,
      jobDescription: normalizedJobDescription,
      resume: resumeData,
    });

    if (session && applicationId) {
      updateApplication(applicationId, {
        resumeId: session.id,
        jobDescription: normalizedJobDescription,
      });
    }
  }

  function handleApplyTailoredResume() {
    const tailoredResume =
      selectedSession?.tailoredResume;

    if (!tailoredResume) {
      return;
    }

    updateTitle(tailoredResume.title);

    updatePersonalDetails({
      ...tailoredResume.personalDetails,
    });

    for (const experience of tailoredResume.workExperience) {
      const matchingExperience =
        resumeData.workExperience.find(
          (currentExperience) =>
            currentExperience.id === experience.id,
        );

      if (matchingExperience) {
        updateWorkExperience(
          matchingExperience.id,
          experience,
        );
      }
    }

    for (const education of tailoredResume.education) {
      const matchingEducation =
        resumeData.education.find(
          (currentEducation) =>
            currentEducation.id === education.id,
        );

      if (matchingEducation) {
        updateEducation(
          matchingEducation.id,
          education,
        );
      }
    }

    for (const skill of tailoredResume.skills) {
      addSkill(skill);
    }

    for (const project of tailoredResume.projects) {
      const matchingProject =
        resumeData.projects.find(
          (currentProject) =>
            currentProject.id === project.id,
        );

      if (matchingProject) {
        updateProject(
          matchingProject.id,
          project,
        );
      }
    }

    for (
      const certification of
      tailoredResume.certifications
    ) {
      const matchingCertification =
        resumeData.certifications.find(
          (currentCertification) =>
            currentCertification.id ===
            certification.id,
        );

      if (matchingCertification) {
        updateCertification(
          matchingCertification.id,
          certification,
        );
      }
    }

    setHasAppliedResume(true);
  }

  function handleOpenResumeBuilder() {
    router.push("/resume-builder");
  }

  const analysis = selectedSession?.analysis;
  const tailoredResume =
    selectedSession?.tailoredResume;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Panthrex AI
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          AI Resume Tailor
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Optimise your resume for any job description
          using AI-powered ATS analysis and keyword
          optimisation.
        </p>
      </div>

      {linkedApplication && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <p className="font-semibold text-indigo-300">
            Linked to tracked application
          </p>

          <p className="mt-1 text-sm text-indigo-200/80">
            {linkedApplication.jobTitle} at{" "}
            {linkedApplication.companyName}
          </p>
        </div>
      )}

      {applicationId && !linkedApplication && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          The linked job application could not be found. You
          can still use Resume Tailor as a standalone tool.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {hasAppliedResume && (
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-emerald-300">
              Tailored resume applied successfully
            </p>

            <p className="mt-1 text-sm text-emerald-200/80">
              The optimised content has been sent to the
              Resume Builder and will be saved
              automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenResumeBuilder}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Open Resume Builder
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Job Information
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="target-role"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Target Role
              </label>

              <input
                id="target-role"
                value={targetRole}
                onChange={(event) =>
                  setTargetRole(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Company
              </label>

              <input
                id="company"
                value={company}
                onChange={(event) =>
                  setCompany(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label
                htmlFor="job-description"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Job Description
              </label>

              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                className="min-h-[250px] w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                placeholder="Paste the complete job description..."
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                !targetRole.trim() ||
                !jobDescription.trim()
              }
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Optimising Resume..."
                : "Optimise Resume"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!selectedSession ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <div className="text-6xl">📄</div>

                <h2 className="mt-5 text-2xl font-semibold text-white">
                  No Analysis Yet
                </h2>

                <p className="mt-3 text-slate-400">
                  Paste a job description and let AI
                  optimise your resume.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-indigo-400">
                    ATS Analysis
                  </p>

                  <h2 className="text-3xl font-bold text-white">
                    {analysis?.atsScore ?? 0}/100
                  </h2>
                </div>

                <div className="w-fit rounded-full bg-indigo-600 px-6 py-4 font-semibold text-white">
                  +{analysis?.scoreImprovement ?? 0}
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Summary
                  </h3>

                  <p className="leading-7 text-slate-300">
                    {analysis?.summary}
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Suggested Headline
                  </h3>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                    {analysis?.suggestedHeadline}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Suggested Professional Summary
                  </h3>

                  <div className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 leading-7 text-slate-300">
                    {analysis?.suggestedSummary}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <button
                    type="button"
                    onClick={handleApplyTailoredResume}
                    disabled={
                      !tailoredResume ||
                      hasAppliedResume
                    }
                    className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {hasAppliedResume
                      ? "Tailored Resume Applied"
                      : "Apply Tailored Resume"}
                  </button>

                  <p className="mt-3 text-center text-sm text-slate-500">
                    This updates the matching content in
                    your saved Resume Builder profile.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}