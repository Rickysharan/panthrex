import type {
  CareerAssistantIntent,
  CareerAssistantResponse,
  CareerAssistantSuggestedAction,
} from "@/lib/career-assistant/types";

const validIntents = new Set<CareerAssistantIntent>([
  "build_resume",
  "improve_resume",
  "check_ats",
  "find_jobs",
  "tailor_resume",
  "write_cover_letter",
  "prepare_interview",
  "track_applications",
  "general_career_advice",
  "unknown",
]);

const validRoutes = new Set([
  "/dashboard",
  "/resume-builder",
  "/resume-enhancer",
  "/ats-score",
  "/resume-tailor",
  "/cover-letter",
  "/job-search",
  "/saved-jobs",
  "/job-matching",
  "/job-tracker",
  "/interview-prep",
  "/interview",
  "/settings",
]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

function normalizeConfidence(
  value: unknown,
): number {
  if (typeof value !== "number") {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function normalizeRoute(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    !validRoutes.has(value)
  ) {
    return null;
  }

  return value;
}

function normalizeSuggestedActions(
  value: unknown,
): CareerAssistantSuggestedAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const actions: CareerAssistantSuggestedAction[] =
    [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const label = normalizeString(item.label);
    const href = normalizeRoute(item.href);

    if (!label || !href) {
      continue;
    }

    if (
      actions.some(
        (existingAction) =>
          existingAction.href === href,
      )
    ) {
      continue;
    }

    actions.push({
      label,
      href,
    });

    if (actions.length === 3) {
      break;
    }
  }

  return actions;
}

export function normalizeCareerAssistantResponse(
  value: unknown,
): CareerAssistantResponse {
  if (!isRecord(value)) {
    throw new Error(
      "Career Assistant response must be an object.",
    );
  }

  const reply = normalizeString(value.reply);

  if (!reply) {
    throw new Error(
      "Career Assistant response is missing a reply.",
    );
  }

  const intentValue =
    normalizeString(value.intent);

  const intent: CareerAssistantIntent =
    validIntents.has(
      intentValue as CareerAssistantIntent,
    )
      ? (intentValue as CareerAssistantIntent)
      : "unknown";

  const confidence = normalizeConfidence(
    value.confidence,
  );

  const navigateTo =
    confidence >= 0.7
      ? normalizeRoute(value.navigateTo)
      : null;

  return {
    reply,
    intent,
    confidence,
    navigateTo,
    suggestedActions:
      normalizeSuggestedActions(
        value.suggestedActions,
      ),
  };
}
