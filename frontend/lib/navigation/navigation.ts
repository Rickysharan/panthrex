import {
  Bot,
  BriefcaseBusiness,
  FilePenLine,
  FileSearch,
  FileText,
  Gauge,
  Gift,
  HelpCircle,
  Import,
  MessageSquareText,
  ScanSearch,
  Search,
  Settings,
  Target,
  UserRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type AppNavigationItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
};

export const appNavigationItems: AppNavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description:
      "View your career workspace, recent activity and progress.",
    href: "/dashboard",
    icon: Gauge,
    keywords: [
      "dashboard",
      "home",
      "workspace",
      "overview",
      "activity",
      "career progress",
    ],
  },
  {
    id: "resume-builder",
    label: "Resume Builder",
    description:
      "Create and edit a professional ATS-friendly resume.",
    href: "/resume-builder",
    icon: FileText,
    keywords: [
      "resume builder",
      "build resume",
      "create resume",
      "make cv",
      "edit resume",
      "cv builder",
    ],
  },
  {
    id: "resume-import",
    label: "Resume Import",
    description:
      "Import an existing resume into Panthrex.",
    href: "/resume-import",
    icon: Import,
    keywords: [
      "resume import",
      "import resume",
      "upload resume",
      "upload cv",
      "existing resume",
    ],
  },
  {
    id: "ats-score",
    label: "ATS Resume Score",
    description:
      "Analyse your resume and identify ATS compatibility issues.",
    href: "/ats-score",
    icon: ScanSearch,
    keywords: [
      "ats",
      "ats score",
      "resume score",
      "cv score",
      "check resume",
      "applicant tracking system",
    ],
  },
  {
    id: "resume-enhancer",
    label: "Resume Enhancer",
    description:
      "Improve weak resume sections with AI recommendations.",
    href: "/resume-enhancer",
    icon: WandSparkles,
    keywords: [
      "resume enhancer",
      "improve resume",
      "rewrite resume",
      "improve cv",
      "resume wording",
      "resume feedback",
    ],
  },
  {
    id: "resume-tailor",
    label: "Resume Tailor",
    description:
      "Tailor your resume to a specific job description.",
    href: "/resume-tailor",
    icon: Target,
    keywords: [
      "resume tailor",
      "tailor resume",
      "tailor cv",
      "job description",
      "match resume",
      "customise resume",
      "customize resume",
    ],
  },
  {
    id: "ai-resume",
    label: "AI Resume Writer",
    description:
      "Generate professional resume content using Panthrex AI.",
    href: "/ai-resume",
    icon: Bot,
    keywords: [
      "ai resume",
      "resume writer",
      "write resume",
      "generate resume",
      "resume content",
      "professional summary",
    ],
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    description:
      "Generate a targeted cover letter for an application.",
    href: "/cover-letter",
    icon: FilePenLine,
    keywords: [
      "cover letter",
      "application letter",
      "write cover letter",
      "generate letter",
      "job letter",
    ],
  },
  {
    id: "job-search",
    label: "AI Job Search",
    description:
      "Search for relevant jobs and career opportunities.",
    href: "/job-search",
    icon: Search,
    keywords: [
      "job search",
      "find jobs",
      "vacancies",
      "roles",
      "employment",
      "sponsored jobs",
      "visa sponsorship",
    ],
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    description:
      "Review jobs you have saved for later.",
    href: "/saved-jobs",
    icon: FileSearch,
    keywords: [
      "saved jobs",
      "bookmarked jobs",
      "favourite jobs",
      "favorite jobs",
      "jobs later",
    ],
  },
  {
    id: "job-tracker",
    label: "Job Tracker",
    description:
      "Track applications, interviews, offers and rejections.",
    href: "/job-tracker",
    icon: BriefcaseBusiness,
    keywords: [
      "job tracker",
      "application tracker",
      "track applications",
      "application status",
      "interviews",
      "offers",
      "rejections",
    ],
  },
  {
    id: "application-agent",
    label: "Application Agent",
    description:
      "Manage assisted job application workflows.",
    href: "/application-agent",
    icon: Bot,
    keywords: [
      "application agent",
      "apply for jobs",
      "job application assistant",
      "automatic applications",
      "application workflow",
    ],
  },
  {
    id: "interview-prep",
    label: "Interview Coach",
    description:
      "Practise technical and behavioural interview questions.",
    href: "/interview-prep",
    icon: MessageSquareText,
    keywords: [
      "interview",
      "interview coach",
      "interview preparation",
      "mock interview",
      "practice interview",
      "interview questions",
    ],
  },
];

export const accountNavigationItems: AppNavigationItem[] = [
  {
    id: "profile",
    label: "Profile",
    description:
      "Manage your career profile and personal information.",
    href: "/profile",
    icon: UserRound,
    keywords: [
      "profile",
      "personal details",
      "account information",
      "career profile",
    ],
  },
  {
    id: "referrals",
    label: "Refer & Earn",
    description:
      "Invite friends to Panthrex and earn rewards.",
    href: "/referrals",
    icon: Gift,
    keywords: [
      "refer",
      "referral",
      "invite",
      "earn",
      "rewards",
      "friends",
    ],
  },

  {
    id: "help",
    label: "Help & Support",
    description:
      "Get help, view FAQs and contact Panthrex support.",
    href: "/help",
    icon: HelpCircle,
    keywords: [
      "help",
      "support",
      "faq",
      "contact",
      "customer support",
      "ticket",
    ],
  },

  {
    id: "settings",
    label: "Settings",
    description:
      "Manage account, preferences and subscription settings.",
    href: "/settings",
    icon: Settings,
    keywords: [
      "settings",
      "account settings",
      "preferences",
      "billing",
      "subscription",
      "plan",
      "password",
    ],
  },
];

export const searchableNavigationItems = [
  ...appNavigationItems,
  ...accountNavigationItems,
];

export function findNavigationItemByPath(
  pathname: string,
): AppNavigationItem | undefined {
  return searchableNavigationItems.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`),
  );
}
