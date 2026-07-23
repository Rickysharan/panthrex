export type CareerAssistantRole =
  | "assistant"
  | "user";

export type CareerAssistantMessage = {
  id: string;
  role: CareerAssistantRole;
  content: string;
  createdAt: string;
};

export type CareerAssistantAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
};

export type CareerAssistantConversation = {
  messages: CareerAssistantMessage[];
};

export type CareerAssistantIntent =
  | "build_resume"
  | "improve_resume"
  | "check_ats"
  | "find_jobs"
  | "tailor_resume"
  | "write_cover_letter"
  | "prepare_interview"
  | "track_applications"
  | "general_career_advice"
  | "unknown";

export type CareerAssistantApiMessage = {
  role: CareerAssistantRole;
  content: string;
};

export type CareerAssistantRequest = {
  message: string;
  currentPath?: string;
  history?: CareerAssistantApiMessage[];
};

export type CareerAssistantSuggestedAction = {
  label: string;
  href: string;
};

export type CareerAssistantResponse = {
  reply: string;
  intent: CareerAssistantIntent;
  confidence: number;
  navigateTo: string | null;
  suggestedActions: CareerAssistantSuggestedAction[];
};

export type CareerAssistantApiError = {
  error: string;
  details?: string;
};
