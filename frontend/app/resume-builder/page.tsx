"use client";

import {
  ArrowLeft,
  Check,
  Eye,
  FileText,
  Menu,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import AiResumeWriterPanel from "@/components/resume-builder/AiResumeWriterPanel";
import CertificationsForm from "@/components/resume-builder/CertificationsForm";
import EducationForm from "@/components/resume-builder/EducationForm";
import ExportPdfButton from "@/components/resume-builder/ExportPdfButton";
import PersonalDetailsForm from "@/components/resume-builder/PersonalDetailsForm";
import ProjectsForm from "@/components/resume-builder/ProjectsForm";
import ResumeVersionHistory from "@/components/resume-builder/ResumeVersionHistory";
import SkillsForm from "@/components/resume-builder/SkillsForm";
import TemplateSelector from "@/components/resume-builder/TemplateSelector";
import WorkExperienceForm from "@/components/resume-builder/WorkExperienceForm";
import type {
  Certification,
  Education,
  Project,
  ResumeData,
  ResumeTemplate,
  WorkExperience,
} from "@/lib/resume/types";
import { useResumeBuilder } from "@/lib/resume/useResumeBuilder";

import "./print.css";

export default function ResumeBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementError, setEnhancementError] =
    useState("");

  const {
    resumeData,
    resumeId,
    lastSavedAt,
    restoreResumeVersion,
    updateTitle,
    updateTemplate,
    updatePersonalDetails,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    importParsedResume,
    applyEnhancementSuggestions,
    resetResume,
  } = useResumeBuilder();

  useEffect(() => {
    const importedResume =
      window.sessionStorage.getItem(
        "panthrex-imported-resume",
      );

    if (!importedResume) {
      return;
    }

    try {
      const parsedResume = JSON.parse(importedResume);

      importParsedResume(parsedResume);

      window.sessionStorage.removeItem(
        "panthrex-imported-resume",
      );
    } catch (error) {
      console.error(
        "Unable to import the parsed resume.",
        error,
      );
    }
  }, [importParsedResume]);

  useEffect(() => {
    const storedSuggestions =
      window.sessionStorage.getItem(
        "panthrex-accepted-enhancements",
      );

    if (!storedSuggestions) {
      return;
    }

    try {
      applyEnhancementSuggestions(
        JSON.parse(storedSuggestions),
      );

      window.sessionStorage.removeItem(
        "panthrex-accepted-enhancements",
      );
    } catch (error) {
      console.error(
        "Unable to apply AI resume enhancements.",
        error,
      );
    }
  }, [applyEnhancementSuggestions]);

  async function handleEnhanceResume() {
    if (isEnhancing) {
      return;
    }

    setIsEnhancing(true);
    setEnhancementError("");

    try {
      const response = await fetch(
        "/api/ai-resume-enhancer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeData,
            targetRole:
              resumeData.personalDetails.jobTitle,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details ||
          data.error ||
          "The resume could not be enhanced.",
        );
      }

      window.sessionStorage.setItem(
        "panthrex-resume-enhancements",
        JSON.stringify(data),
      );

      window.location.href = "/resume-enhancer";
    } catch (error) {
      setEnhancementError(
        error instanceof Error
          ? error.message
          : "The resume could not be enhanced.",
      );
    } finally {
      setIsEnhancing(false);
    }
  }

  const savedStatus = lastSavedAt
    ? `Saved at ${lastSavedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
    : "Draft autosaves locally";

  return (
    <>
      <main className="resume-builder-screen min-h-screen bg-[#050816] text-white">
        <div
          aria-hidden="true"
          className="fixed left-[-160px] top-[-150px] h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="fixed bottom-[-180px] right-[-140px] h-[440px] w-[440px] rounded-full bg-blue-500/10 blur-[150px]"
        />

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#070a18]/95 p-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#050816]">
                <Sparkles size={21} />
              </span>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  Panthrex
                </p>

                <p className="text-xs text-white/35">
                  Career Intelligence
                </p>
              </div>
            </Link>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-10 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.055] hover:text-white"
            >
              <ArrowLeft size={19} />
              Back to dashboard
            </Link>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-[#050816]">
              <FileText size={19} />
              Resume Builder
            </div>
          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
              Resume sections
            </p>

            <div className="mt-3 space-y-2">
              <SectionNavigationItem
                number="01"
                label="Personal details"
                href="#personal-details"
                active
                complete={Boolean(
                  resumeData.personalDetails.fullName &&
                  resumeData.personalDetails.email,
                )}
              />

              <SectionNavigationItem
                number="02"
                label="Work experience"
                href="#work-experience"
                complete={resumeData.workExperience.length > 0}
              />

              <SectionNavigationItem
                number="03"
                label="Education"
                href="#education"
                complete={resumeData.education.length > 0}
              />

              <SectionNavigationItem
                number="04"
                label="Skills"
                href="#skills"
                complete={resumeData.skills.length > 0}
              />

              <SectionNavigationItem
                number="05"
                label="Projects"
                href="#projects"
                complete={resumeData.projects.length > 0}
              />

              <SectionNavigationItem
                number="06"
                label="Certifications"
                href="#certifications"
                complete={resumeData.certifications.length > 0}
              />
            </div>
          </div>

          <div className="mt-auto rounded-3xl border border-violet-400/20 bg-violet-400/[0.075] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300">
                <Sparkles size={19} />
              </span>

              <div>
                <p className="text-sm font-semibold">
                  AI assistance
                </p>

                <p className="text-xs text-white/35">
                  Professional summary writer ready
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="relative z-10 lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/80 px-5 py-4 backdrop-blur-2xl sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open sidebar"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/70 lg:hidden"
                >
                  <Menu size={20} />
                </button>

                <div className="min-w-0">
                  <input
                    type="text"
                    value={resumeData.title}
                    onChange={(event) =>
                      updateTitle(event.target.value)
                    }
                    aria-label="Resume title"
                    className="w-full min-w-0 bg-transparent text-lg font-semibold text-white outline-none placeholder:text-white/30 sm:w-72"
                  />

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-white/35">
                    <Save size={13} />
                    {savedStatus}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetResume}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <RotateCcw size={17} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Eye size={17} />
                  Preview
                </button>

                <button
                  type="button"
                  onClick={handleEnhanceResume}
                  disabled={isEnhancing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles size={17} />

                  <span>
                    {isEnhancing
                      ? "Enhancing..."
                      : "Enhance resume"}
                  </span>
                </button>

                <ExportPdfButton
                  documentTitle={resumeData.title}
                />
              </div>
            </div>
          </header>

          {enhancementError && (
            <div className="mx-5 mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 sm:mx-8 lg:mx-10">
              {enhancementError}
            </div>
          )}

          <div className="px-5 py-8 sm:px-8 lg:px-10">
            <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Resume Builder
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Build your professional resume.
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-white/45">
                  Complete each section and review the live
                  preview as your resume takes shape.
                </p>
              </div>

              <TemplateSelector
                selectedTemplate={resumeData.template}
                onTemplateChange={updateTemplate}
              />
            </section>

            <section className="mt-8 grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_560px]">
              <div className="min-w-0">
                <div
                  id="ai-resume-writer"
                  className="mb-6 scroll-mt-28"
                >
                  <AiResumeWriterPanel
                    resumeData={resumeData}
                    initialSection="professional-summary"
                    lockedSection="professional-summary"
                    existingContent={
                      resumeData.personalDetails.professionalSummary
                    }
                    onApplySuggestion={(content) =>
                      updatePersonalDetails({
                        ...resumeData.personalDetails,
                        professionalSummary: content,
                      })
                    }
                  />
                </div>

                <div
                  id="personal-details"
                  className="scroll-mt-28"
                >
                  <PersonalDetailsForm
                    personalDetails={
                      resumeData.personalDetails
                    }
                    onChange={updatePersonalDetails}
                  />
                </div>

                <div
                  id="work-experience"
                  className="scroll-mt-28"
                >
                  <WorkExperienceForm
                    experiences={
                      resumeData.workExperience
                    }
                    addExperience={addWorkExperience}
                    updateExperience={
                      updateWorkExperience
                    }
                    removeExperience={
                      removeWorkExperience
                    }
                  />
                </div>

                <div
                  id="education"
                  className="scroll-mt-28"
                >
                  <EducationForm
                    educationItems={resumeData.education}
                    addEducation={addEducation}
                    updateEducation={updateEducation}
                    removeEducation={removeEducation}
                  />
                </div>

                <div
                  id="skills"
                  className="scroll-mt-28"
                >
                  <SkillsForm
                    skills={resumeData.skills}
                    addSkill={addSkill}
                    removeSkill={removeSkill}
                  />
                </div>

                <div
                  id="projects"
                  className="scroll-mt-28"
                >
                  <ProjectsForm
                    projects={resumeData.projects}
                    addProject={addProject}
                    updateProject={updateProject}
                    removeProject={removeProject}
                  />
                </div>

                <div
                  id="certifications"
                  className="scroll-mt-28"
                >
                  <CertificationsForm
                    certifications={
                      resumeData.certifications
                    }
                    addCertification={addCertification}
                    updateCertification={
                      updateCertification
                    }
                    removeCertification={
                      removeCertification
                    }
                  />
                </div>
                {resumeId && (
                  <div
                    id="version-history"
                    className="mt-6 scroll-mt-28"
                  >
                    <ResumeVersionHistory
                      resumeId={resumeId}
                      resumeData={resumeData}
                      restoreResumeVersion={
                        restoreResumeVersion
                      }
                    />
                  </div>
                )}
              </div>

              <aside className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 sm:p-6 2xl:sticky 2xl:top-28">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Live preview
                    </h2>

                    <p className="mt-1 text-sm text-white/40">
                      {getTemplateDescription(
                        resumeData.template,
                      )}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    Autosaved
                  </span>
                </div>

                <ResumePreview resumeData={resumeData} />
              </aside>
            </section>
          </div>
        </div>
      </main>

      <div className="resume-print-root">
        <ResumePreview
          resumeData={resumeData}
          printMode
        />
      </div>
    </>
  );
}

function SectionNavigationItem({
  number,
  label,
  href,
  active = false,
  complete = false,
}: {
  number: string;
  label: string;
  href: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${active
        ? "bg-white/[0.07] text-white"
        : "text-white/45 hover:bg-white/[0.045] hover:text-white"
        }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${complete
          ? "bg-emerald-400/10 text-emerald-300"
          : active
            ? "bg-violet-400/15 text-violet-300"
            : "bg-white/[0.05] text-white/30"
          }`}
      >
        {complete ? <Check size={14} /> : number}
      </span>

      <span className="truncate">{label}</span>
    </a>
  );
}

function ResumePreview({
  resumeData,
  printMode = false,
}: {
  resumeData: ResumeData;
  printMode?: boolean;
}) {
  const {
    personalDetails,
    workExperience,
    education,
    skills,
    projects,
    certifications,
    template,
  } = resumeData;

  const contactDetails = [
    personalDetails.email,
    personalDetails.phone,
    personalDetails.location,
  ].filter(Boolean);

  const links = [
    personalDetails.website,
    personalDetails.linkedin,
    personalDetails.github,
  ].filter(Boolean);

  const templateStyles = getTemplateStyles(template);

  return (
    <div
      className={
        printMode
          ? `resume-print-document text-[#161616] ${templateStyles.document}`
          : `mt-6 overflow-hidden text-[#161616] shadow-2xl shadow-black/30 ${templateStyles.document}`
      }
    >
      <div
        className={
          printMode
            ? `resume-print-page ${templateStyles.page}`
            : `aspect-[1/1.414] min-h-[700px] ${templateStyles.page}`
        }
      >
        <header className={templateStyles.header}>
          <h3 className={templateStyles.name}>
            {personalDetails.fullName || "Your Name"}
          </h3>

          <p className={templateStyles.jobTitle}>
            {personalDetails.jobTitle ||
              "Professional Title"}
          </p>

          {contactDetails.length > 0 ? (
            <p className={templateStyles.contact}>
              {contactDetails.join(" • ")}
            </p>
          ) : (
            <p className={templateStyles.placeholderContact}>
              Email • Phone • Location
            </p>
          )}

          {links.length > 0 && (
            <p className={templateStyles.links}>
              {links.join(" • ")}
            </p>
          )}
        </header>

        <div className={templateStyles.content}>
          {(personalDetails.professionalSummary ||
            workExperience.length === 0) && (
              <PreviewSection
                title="Professional Summary"
                template={template}
              >
                <p
                  className={`whitespace-pre-line leading-6 ${template === "minimal"
                    ? "text-xs"
                    : "text-sm"
                    } ${personalDetails.professionalSummary
                      ? "text-black/75"
                      : "text-black/35"
                    }`}
                >
                  {personalDetails.professionalSummary ||
                    "Your professional summary will appear here as you complete the form."}
                </p>
              </PreviewSection>
            )}

          <PreviewSection
            title="Experience"
            template={template}
          >
            {workExperience.length > 0 ? (
              <div className={templateStyles.itemSpacing}>
                {workExperience.map((experience) => (
                  <ExperiencePreview
                    key={experience.id}
                    experience={experience}
                  />
                ))}
              </div>
            ) : (
              <PreviewPlaceholder text="Add your work experience to build this section." />
            )}
          </PreviewSection>

          <PreviewSection
            title="Education"
            template={template}
          >
            {education.length > 0 ? (
              <div className={templateStyles.itemSpacing}>
                {education.map((educationItem) => (
                  <EducationPreview
                    key={educationItem.id}
                    education={educationItem}
                  />
                ))}
              </div>
            ) : (
              <PreviewPlaceholder text="Add your education history to build this section." />
            )}
          </PreviewSection>

          <PreviewSection
            title="Skills"
            template={template}
          >
            {skills.length > 0 ? (
              <SkillsPreview
                skills={skills}
                template={template}
              />
            ) : (
              <PreviewPlaceholder text="Your key technical and professional skills will appear here." />
            )}
          </PreviewSection>

          <PreviewSection
            title="Projects"
            template={template}
          >
            {projects.length > 0 ? (
              <div className={templateStyles.itemSpacing}>
                {projects.map((project) => (
                  <ProjectPreview
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            ) : (
              <PreviewPlaceholder text="Add relevant technical, academic or professional projects." />
            )}
          </PreviewSection>

          <PreviewSection
            title="Certifications"
            template={template}
          >
            {certifications.length > 0 ? (
              <div
                className={
                  template === "minimal"
                    ? "space-y-3"
                    : "space-y-4"
                }
              >
                {certifications.map((certification) => (
                  <CertificationPreview
                    key={certification.id}
                    certification={certification}
                  />
                ))}
              </div>
            ) : (
              <PreviewPlaceholder text="Add relevant certifications and professional credentials." />
            )}
          </PreviewSection>
        </div>
      </div>
    </div>
  );
}

function ExperiencePreview({
  experience,
}: {
  experience: WorkExperience;
}) {
  const dateRange = formatDateRange(
    experience.startDate,
    experience.endDate,
    experience.isCurrent,
  );

  return (
    <article className="resume-print-item">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h5 className="text-sm font-bold">
            {experience.position || "Job Title"}
          </h5>

          <p className="mt-1 text-xs font-semibold text-black/65">
            {experience.company || "Company"}
            {experience.location
              ? ` — ${experience.location}`
              : ""}
          </p>
        </div>

        <p className="shrink-0 text-right text-[11px] font-medium text-black/50">
          {dateRange}
        </p>
      </div>

      {experience.description ? (
        <DescriptionList
          description={experience.description}
        />
      ) : (
        <p className="mt-3 text-xs italic leading-5 text-black/35">
          Add responsibilities and measurable achievements.
        </p>
      )}
    </article>
  );
}

function EducationPreview({
  education,
}: {
  education: Education;
}) {
  const dateRange = formatDateRange(
    education.startDate,
    education.endDate,
  );

  const qualification = [
    education.qualification,
    education.fieldOfStudy,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <article className="resume-print-item">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h5 className="text-sm font-bold">
            {qualification || "Qualification"}
          </h5>

          <p className="mt-1 text-xs font-semibold text-black/65">
            {education.institution || "Institution"}
            {education.location
              ? ` — ${education.location}`
              : ""}
          </p>
        </div>

        <p className="shrink-0 text-right text-[11px] font-medium text-black/50">
          {dateRange}
        </p>
      </div>

      {education.description ? (
        <DescriptionList
          description={education.description}
        />
      ) : (
        <p className="mt-3 text-xs italic leading-5 text-black/35">
          Add relevant modules, grades and academic achievements.
        </p>
      )}
    </article>
  );
}

function SkillsPreview({
  skills,
  template,
}: {
  skills: string[];
  template: ResumeTemplate;
}) {
  if (template === "modern") {
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }

  return (
    <p
      className={
        template === "minimal"
          ? "text-[11px] leading-5 text-black/75"
          : "text-xs leading-6 text-black/75"
      }
    >
      {skills.join(" • ")}
    </p>
  );
}

function ProjectPreview({
  project,
}: {
  project: Project;
}) {
  const dateRange = formatDateRange(
    project.startDate,
    project.endDate,
  );

  return (
    <article className="resume-print-item">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h5 className="text-sm font-bold">
            {project.name || "Project Name"}
          </h5>

          <p className="mt-1 text-xs font-semibold text-black/65">
            {project.role || "Project Role"}
          </p>

          {project.projectUrl && (
            <p className="mt-1 break-all text-[11px] text-black/50">
              {project.projectUrl}
            </p>
          )}
        </div>

        <p className="shrink-0 text-right text-[11px] font-medium text-black/50">
          {dateRange}
        </p>
      </div>

      {project.description ? (
        <DescriptionList
          description={project.description}
        />
      ) : (
        <p className="mt-3 text-xs italic leading-5 text-black/35">
          Add technologies, responsibilities and measurable outcomes.
        </p>
      )}
    </article>
  );
}

function CertificationPreview({
  certification,
}: {
  certification: Certification;
}) {
  const issueDate = formatMonth(certification.issueDate);

  return (
    <article className="resume-print-item">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h5 className="text-sm font-bold">
            {certification.name ||
              "Certification Name"}
          </h5>

          <p className="mt-1 text-xs font-semibold text-black/65">
            {certification.issuer ||
              "Issuing Organisation"}
          </p>

          {certification.credentialId && (
            <p className="mt-1 text-[11px] text-black/50">
              Credential ID:{" "}
              {certification.credentialId}
            </p>
          )}

          {certification.credentialUrl && (
            <p className="mt-1 break-all text-[11px] text-black/50">
              {certification.credentialUrl}
            </p>
          )}
        </div>

        <p className="shrink-0 text-right text-[11px] font-medium text-black/50">
          {issueDate || "Issue date"}
        </p>
      </div>
    </article>
  );
}

function DescriptionList({
  description,
}: {
  description: string;
}) {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-1.5 text-xs leading-5 text-black/70">
      {lines.map((line, index) => (
        <li
          key={`${line}-${index}`}
          className="flex items-start gap-2"
        >
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-black/55" />

          <span>{removeBulletPrefix(line)}</span>
        </li>
      ))}
    </ul>
  );
}

function PreviewSection({
  title,
  children,
  template,
}: {
  title: string;
  children: React.ReactNode;
  template: ResumeTemplate;
}) {
  const sectionClassName =
    template === "minimal" ? "mt-5" : "mt-7";

  const headingClassName =
    template === "modern"
      ? "border-l-4 border-slate-900 pl-3 text-xs font-extrabold uppercase tracking-[0.16em]"
      : template === "minimal"
        ? "border-b border-black/20 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
        : "border-b border-black/15 pb-2 text-xs font-bold uppercase tracking-[0.18em]";

  return (
    <section
      className={`resume-print-section ${sectionClassName}`}
    >
      <h4
        className={`resume-print-heading ${headingClassName}`}
      >
        {title}
      </h4>

      <div
        className={
          template === "minimal" ? "mt-2.5" : "mt-3"
        }
      >
        {children}
      </div>
    </section>
  );
}

function PreviewPlaceholder({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 px-4 py-4 text-xs leading-5 text-black/35">
      {text}
    </div>
  );
}

function getTemplateStyles(
  template: ResumeTemplate,
) {
  switch (template) {
    case "modern":
      return {
        document: "rounded-2xl bg-white",
        page: "bg-white px-8 pb-10 pt-0 sm:px-10",
        header:
          "-mx-8 bg-slate-900 px-8 py-9 text-white sm:-mx-10 sm:px-10",
        name:
          "text-4xl font-black tracking-[-0.04em]",
        jobTitle:
          "mt-2 text-sm font-bold uppercase tracking-[0.18em] text-white/65",
        contact:
          "mt-5 text-xs leading-5 text-white/70",
        placeholderContact:
          "mt-5 text-xs text-white/40",
        links:
          "mt-1 break-all text-xs leading-5 text-white/60",
        content: "pt-1",
        itemSpacing: "space-y-6",
      };

    case "minimal":
      return {
        document: "rounded-none bg-white",
        page: "bg-white p-7 sm:p-8",
        header: "border-b border-black/25 pb-4",
        name:
          "text-2xl font-semibold tracking-[-0.025em]",
        jobTitle:
          "mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-black/55",
        contact:
          "mt-3 text-[11px] leading-5 text-black/60",
        placeholderContact:
          "mt-3 text-[11px] text-black/35",
        links:
          "mt-1 break-all text-[11px] leading-5 text-black/55",
        content: "",
        itemSpacing: "space-y-4",
      };

    case "executive":
      return {
        document:
          "rounded-2xl bg-[#f8f5ee] font-serif",
        page:
          "bg-[#f8f5ee] px-9 pb-11 pt-9 sm:px-12",
        header:
          "border-b-2 border-[#9a7b4f] pb-6 text-center",
        name:
          "text-4xl font-semibold tracking-[0.01em] text-[#241d16]",
        jobTitle:
          "mt-2 text-xs font-bold uppercase tracking-[0.24em] text-[#755f42]",
        contact:
          "mt-4 text-xs leading-5 text-black/60",
        placeholderContact:
          "mt-4 text-xs text-black/35",
        links:
          "mt-1 break-all text-xs leading-5 text-black/55",
        content: "",
        itemSpacing: "space-y-6",
      };

    case "technical":
      return {
        document:
          "rounded-2xl bg-[#f7fafc]",
        page:
          "bg-[#f7fafc] p-8 sm:p-10",
        header:
          "border-l-[6px] border-[#2563eb] bg-[#eaf2ff] px-6 py-6",
        name:
          "font-mono text-3xl font-bold tracking-[-0.04em] text-[#111827]",
        jobTitle:
          "mt-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#2563eb]",
        contact:
          "mt-4 font-mono text-[11px] leading-5 text-black/60",
        placeholderContact:
          "mt-4 font-mono text-[11px] text-black/35",
        links:
          "mt-1 break-all font-mono text-[11px] leading-5 text-black/55",
        content: "",
        itemSpacing: "space-y-5",
      };

    case "finance":
      return {
        document:
          "rounded-2xl bg-white",
        page:
          "bg-white px-9 pb-11 pt-0 sm:px-11",
        header:
          "-mx-9 bg-[#10233f] px-9 py-8 text-white sm:-mx-11 sm:px-11",
        name:
          "text-3xl font-bold tracking-[-0.025em]",
        jobTitle:
          "mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c6d6ec]",
        contact:
          "mt-4 text-xs leading-5 text-white/70",
        placeholderContact:
          "mt-4 text-xs text-white/40",
        links:
          "mt-1 break-all text-xs leading-5 text-white/60",
        content: "pt-1",
        itemSpacing: "space-y-5",
      };

    case "academic":
      return {
        document:
          "rounded-none bg-white font-serif",
        page:
          "bg-white px-8 py-8 sm:px-10",
        header:
          "border-b border-black pb-5 text-center",
        name:
          "text-3xl font-bold tracking-normal",
        jobTitle:
          "mt-1.5 text-sm font-medium text-black/65",
        contact:
          "mt-3 text-[11px] leading-5 text-black/65",
        placeholderContact:
          "mt-3 text-[11px] text-black/35",
        links:
          "mt-1 break-all text-[11px] leading-5 text-black/55",
        content: "",
        itemSpacing: "space-y-4",
      };

    case "creative":
      return {
        document:
          "rounded-2xl bg-[#fffaf7]",
        page:
          "bg-[#fffaf7] px-8 pb-10 pt-0 sm:px-10",
        header:
          "-mx-8 bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] px-8 py-9 text-white sm:-mx-10 sm:px-10",
        name:
          "text-4xl font-black tracking-[-0.045em]",
        jobTitle:
          "mt-2 text-sm font-bold uppercase tracking-[0.17em] text-white/75",
        contact:
          "mt-5 text-xs leading-5 text-white/75",
        placeholderContact:
          "mt-5 text-xs text-white/40",
        links:
          "mt-1 break-all text-xs leading-5 text-white/65",
        content: "pt-1",
        itemSpacing: "space-y-6",
      };

    case "professional":
    default:
      return {
        document:
          "rounded-2xl bg-[#f7f7f4]",
        page:
          "bg-[#f7f7f4] p-8 sm:p-10",
        header:
          "border-b border-black/15 pb-6",
        name:
          "text-3xl font-bold tracking-tight",
        jobTitle:
          "mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-black/55",
        contact:
          "mt-4 text-xs leading-5 text-black/60",
        placeholderContact:
          "mt-4 text-xs text-black/35",
        links:
          "mt-1 break-all text-xs leading-5 text-black/55",
        content: "",
        itemSpacing: "space-y-6",
      };
  }
}

function getTemplateDescription(
  template: ResumeTemplate,
): string {
  switch (template) {
    case "modern":
      return "Modern layout with stronger visual hierarchy";

    case "minimal":
      return "Compact layout focused on essential content";

    case "executive":
      return "Refined layout for leadership and senior roles";

    case "technical":
      return "Structured layout for software and engineering roles";

    case "finance":
      return "Conservative layout for finance and consulting";

    case "academic":
      return "Content-dense layout for research and education";

    case "creative":
      return "Distinctive layout with stronger personal branding";

    case "professional":
    default:
      return "Professional ATS-friendly layout";
  }
}

function formatDateRange(
  startDateValue: string,
  endDateValue: string,
  isCurrent = false,
): string {
  const startDate = formatMonth(startDateValue);

  const endDate = isCurrent
    ? "Present"
    : formatMonth(endDateValue);

  if (!startDate && !endDate) {
    return "Dates";
  }

  if (startDate && endDate) {
    return `${startDate} – ${endDate}`;
  }

  return startDate || endDate;
}

function formatMonth(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month] = value.split("-");
  const numericYear = Number(year);
  const numericMonth = Number(month);

  if (
    !Number.isInteger(numericYear) ||
    !Number.isInteger(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(
      Date.UTC(numericYear, numericMonth - 1, 1),
    ),
  );
}

function removeBulletPrefix(value: string): string {
  return value.replace(
    /^([•\-–—*]|\d+[.)])\s*/,
    "",
  );
}