import type {
  CareerAssistantAction,
  CareerAssistantMessage,
} from "@/lib/career-assistant/types";

export const careerAssistantActions: CareerAssistantAction[] = [
  {
    id: "build-resume",
    label: "Build my resume",
    description:
      "Create or update your professional resume.",
    href: "/resume-builder",
    keywords: [
      "build resume",
      "create resume",
      "edit resume",
      "update resume",
      "cv",
    ],
  },
  {
    id: "improve-resume",
    label: "Improve my resume",
    description:
      "Enhance weak sections and strengthen your wording.",
    href: "/resume-enhancer",
    keywords: [
      "improve resume",
      "enhance resume",
      "rewrite resume",
      "resume better",
      "improve cv",
    ],
  },
  {
    id: "ats-score",
    label: "Check my ATS score",
    description:
      "Analyse your resume against applicant tracking systems.",
    href: "/ats-score",
    keywords: [
      "ats",
      "ats score",
      "resume score",
      "check score",
      "increase ats",
    ],
  },
  {
    id: "find-jobs",
    label: "Find jobs",
    description:
      "Search for relevant roles and opportunities.",
    href: "/job-search",
    keywords: [
      "find jobs",
      "search jobs",
      "job search",
      "vacancies",
      "roles",
      "sponsored jobs",
      "visa sponsorship",
    ],
  },
  {
    id: "tailor-resume",
    label: "Tailor my resume",
    description:
      "Adapt your resume for a specific job description.",
    href: "/resume-tailor",
    keywords: [
      "tailor resume",
      "tailor cv",
      "match resume",
      "customise resume",
      "job description",
    ],
  },
  {
    id: "cover-letter",
    label: "Write a cover letter",
    description:
      "Generate a targeted cover letter for an application.",
    href: "/cover-letter",
    keywords: [
      "cover letter",
      "write letter",
      "application letter",
      "generate cover letter",
    ],
  },
  {
    id: "interview",
    label: "Prepare for an interview",
    description:
      "Practise role-specific interview questions.",
    href: "/interview-prep",
    keywords: [
      "interview",
      "prepare interview",
      "practice interview",
      "mock interview",
      "interview questions",
    ],
  },
  {
    id: "track-applications",
    label: "Track my applications",
    description:
      "Review application progress, tasks and deadlines.",
    href: "/job-tracker",
    keywords: [
      "track applications",
      "applications",
      "application status",
      "job tracker",
      "follow up",
    ],
  },
];

export function createAssistantMessage(
  content: string,
): CareerAssistantMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createUserMessage(
  content: string,
): CareerAssistantMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function findCareerAssistantAction(
  query: string,
): CareerAssistantAction | null {
  const normalizedQuery = query
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  const exactMatch = careerAssistantActions.find(
    (action) =>
      action.label.toLowerCase() ===
      normalizedQuery,
  );

  if (exactMatch) {
    return exactMatch;
  }

  return (
    careerAssistantActions.find((action) =>
      action.keywords.some((keyword) =>
        normalizedQuery.includes(keyword),
      ),
    ) ?? null
  );
}

export const initialCareerAssistantMessage =
  createAssistantMessage(
    "Hi — I’m your Panthrex Career Assistant. Choose an action below or tell me what you want to do.",
  );
