import type {
  AiExperienceLevel,
  AiResumeSection,
  AiResumeWriterMode,
  AiResumeWriterRequest,
  AiWritingTone,
} from "@/lib/ai-resume/types";
import type { ResumeData } from "@/lib/resume/types";

const MODE_INSTRUCTIONS: Record<AiResumeWriterMode, string> = {
  generate:
    "Create new resume content using the supplied resume information and context.",
  improve:
    "Rewrite the existing content to improve clarity, impact, specificity and ATS compatibility without inventing facts.",
  tailor:
    "Tailor the content to the target role and job description while remaining truthful to the candidate's supplied experience.",
};

const SECTION_INSTRUCTIONS: Record<AiResumeSection, string> = {
  "professional-summary":
    "Write a concise professional summary of approximately 45 to 80 words. Emphasise relevant experience, technical strengths, domain knowledge and career direction.",
  "work-experience":
    "Write three to five resume bullet points. Begin each bullet with a strong action verb and focus on responsibilities, tools, outcomes and measurable impact when supported by the provided information.",
  "project-description":
    "Write three to five project bullet points covering the problem, implementation, technologies, individual contribution and outcome. Prioritise technically specific and recruiter-readable language.",
  skills:
    "Return a focused list of relevant skills. Include only skills supported by the resume or additional context. Group closely related skills where useful and avoid generic filler.",
};

const TONE_INSTRUCTIONS: Record<AiWritingTone, string> = {
  professional:
    "Use polished, credible and formal professional language.",
  confident:
    "Use assertive language that communicates ownership and impact without exaggeration.",
  concise:
    "Use compact wording, remove repetition and prioritise high-information sentences.",
  technical:
    "Use precise technical terminology and clearly identify tools, methods, systems and implementation details.",
  leadership:
    "Emphasise ownership, collaboration, decision-making, coordination and strategic impact where supported.",
};

const EXPERIENCE_LEVEL_INSTRUCTIONS: Record<
  AiExperienceLevel,
  string
> = {
  student:
    "Position academic work, projects, coursework, transferable skills and learning potential appropriately for a student candidate.",
  "entry-level":
    "Emphasise practical capability, projects, foundational experience and readiness to contribute in an entry-level role.",
  "mid-level":
    "Emphasise independent delivery, technical depth, collaboration and demonstrated business impact.",
  senior:
    "Emphasise technical leadership, architecture, mentoring, ownership and cross-functional impact.",
  executive:
    "Emphasise strategy, organisational leadership, transformation, commercial impact and executive-level decision-making.",
};

function sanitizePromptValue(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "Not provided";
  }

  return values.join(", ");
}

function formatResumeContext(resumeData: ResumeData): string {
  const {
    personalDetails,
    workExperience,
    education,
    skills,
    projects,
    certifications,
  } = resumeData;

  const workExperienceContext =
    workExperience.length > 0
      ? workExperience
          .map((experience, index) => {
            const dateRange = [
              experience.startDate,
              experience.isCurrent
                ? "Present"
                : experience.endDate,
            ]
              .filter(Boolean)
              .join(" to ");

            return [
              `Experience ${index + 1}:`,
              `Position: ${experience.position || "Not provided"}`,
              `Company: ${experience.company || "Not provided"}`,
              `Location: ${experience.location || "Not provided"}`,
              `Dates: ${dateRange || "Not provided"}`,
              `Description: ${
                sanitizePromptValue(experience.description) ||
                "Not provided"
              }`,
            ].join("\n");
          })
          .join("\n\n")
      : "Not provided";

  const educationContext =
    education.length > 0
      ? education
          .map((educationItem, index) => {
            const dateRange = [
              educationItem.startDate,
              educationItem.endDate,
            ]
              .filter(Boolean)
              .join(" to ");

            return [
              `Education ${index + 1}:`,
              `Institution: ${
                educationItem.institution || "Not provided"
              }`,
              `Qualification: ${
                educationItem.qualification || "Not provided"
              }`,
              `Field of study: ${
                educationItem.fieldOfStudy || "Not provided"
              }`,
              `Location: ${
                educationItem.location || "Not provided"
              }`,
              `Dates: ${dateRange || "Not provided"}`,
              `Description: ${
                sanitizePromptValue(educationItem.description) ||
                "Not provided"
              }`,
            ].join("\n");
          })
          .join("\n\n")
      : "Not provided";

  const projectsContext =
    projects.length > 0
      ? projects
          .map((project, index) => {
            const dateRange = [
              project.startDate,
              project.endDate,
            ]
              .filter(Boolean)
              .join(" to ");

            return [
              `Project ${index + 1}:`,
              `Name: ${project.name || "Not provided"}`,
              `Role: ${project.role || "Not provided"}`,
              `Dates: ${dateRange || "Not provided"}`,
              `URL: ${project.projectUrl || "Not provided"}`,
              `Description: ${
                sanitizePromptValue(project.description) ||
                "Not provided"
              }`,
            ].join("\n");
          })
          .join("\n\n")
      : "Not provided";

  const certificationsContext =
    certifications.length > 0
      ? certifications
          .map((certification, index) =>
            [
              `Certification ${index + 1}:`,
              `Name: ${certification.name || "Not provided"}`,
              `Issuer: ${
                certification.issuer || "Not provided"
              }`,
              `Issue date: ${
                certification.issueDate || "Not provided"
              }`,
              `Credential ID: ${
                certification.credentialId || "Not provided"
              }`,
            ].join("\n"),
          )
          .join("\n\n")
      : "Not provided";

  return [
    "CANDIDATE PROFILE",
    `Name: ${personalDetails.fullName || "Not provided"}`,
    `Current title: ${
      personalDetails.jobTitle || "Not provided"
    }`,
    `Location: ${personalDetails.location || "Not provided"}`,
    `Existing professional summary: ${
      sanitizePromptValue(
        personalDetails.professionalSummary,
      ) || "Not provided"
    }`,
    "",
    "CURRENT SKILLS",
    formatList(skills),
    "",
    "WORK EXPERIENCE",
    workExperienceContext,
    "",
    "EDUCATION",
    educationContext,
    "",
    "PROJECTS",
    projectsContext,
    "",
    "CERTIFICATIONS",
    certificationsContext,
  ].join("\n");
}

export type AiResumePrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildAiResumePrompt(
  request: AiResumeWriterRequest,
): AiResumePrompt {
  const systemPrompt = [
    "You are Panthrex AI Resume Writer, an expert UK-focused resume and CV writing assistant.",
    "Produce truthful, ATS-compatible content using only facts supplied by the candidate.",
    "Never invent employers, qualifications, dates, technologies, responsibilities, metrics, achievements or credentials.",
    "Do not claim measurable impact unless the source information supports it.",
    "Avoid first-person pronouns, clichés, vague buzzwords and unsupported superlatives.",
    "Use British English spelling.",
    "Return exactly three distinct suggestions.",
    "Return only valid JSON in this structure:",
    '{"suggestions":[{"content":"..."},{"content":"..."},{"content":"..."}]}',
    "Do not include markdown fences, commentary, headings outside the content, IDs or additional JSON fields.",
  ].join("\n");

  const userPrompt = [
    "WRITING TASK",
    `Mode: ${request.mode}`,
    MODE_INSTRUCTIONS[request.mode],
    "",
    `Section: ${request.section}`,
    SECTION_INSTRUCTIONS[request.section],
    "",
    `Tone: ${request.tone}`,
    TONE_INSTRUCTIONS[request.tone],
    "",
    `Experience level: ${request.experienceLevel}`,
    EXPERIENCE_LEVEL_INSTRUCTIONS[
      request.experienceLevel
    ],
    "",
    "TARGET ROLE",
    sanitizePromptValue(request.targetRole) || "Not provided",
    "",
    "JOB DESCRIPTION",
    sanitizePromptValue(request.jobDescription) ||
      "Not provided",
    "",
    "EXISTING CONTENT",
    sanitizePromptValue(request.existingContent) ||
      "Not provided",
    "",
    "ADDITIONAL CONTEXT",
    sanitizePromptValue(request.additionalContext) ||
      "Not provided",
    "",
    formatResumeContext(request.resumeData),
    "",
    "FINAL REQUIREMENTS",
    "Create three meaningfully different suggestions.",
    "Preserve factual accuracy.",
    "Prioritise relevance, specificity, readability and ATS keyword alignment.",
    "Do not copy sentences directly from the job description.",
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
