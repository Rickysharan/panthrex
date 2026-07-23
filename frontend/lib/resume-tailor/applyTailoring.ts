import type { ResumeData } from "@/lib/resume/types";

import type {
  ResumeTailorAnalysis,
  TailoredBullet,
} from "./types";

function normaliseText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return false;
    }

    const normalisedValue = normaliseText(trimmedValue);

    if (seen.has(normalisedValue)) {
      return false;
    }

    seen.add(normalisedValue);

    return true;
  });
}

function splitDescription(description: string): string[] {
  const normalisedDescription = description
    .replace(/\r\n/g, "\n")
    .trim();

  if (!normalisedDescription) {
    return [];
  }

  const lineItems = normalisedDescription
    .split("\n")
    .map((line) =>
      line
        .replace(/^[\s•●▪◦*-]+/, "")
        .trim(),
    )
    .filter(Boolean);

  if (lineItems.length > 1) {
    return lineItems;
  }

  return normalisedDescription
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function joinDescription(items: string[]): string {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `• ${item.replace(/^[•\s]+/, "")}`)
    .join("\n");
}

function findMatchingBulletIndex(
  bullets: string[],
  tailoredBullet: TailoredBullet,
): number {
  const normalisedOriginal = normaliseText(
    tailoredBullet.original,
  );

  if (!normalisedOriginal) {
    return -1;
  }

  const exactIndex = bullets.findIndex(
    (bullet) =>
      normaliseText(bullet) === normalisedOriginal,
  );

  if (exactIndex !== -1) {
    return exactIndex;
  }

  return bullets.findIndex((bullet) => {
    const normalisedBullet = normaliseText(bullet);

    return (
      normalisedBullet.includes(normalisedOriginal) ||
      normalisedOriginal.includes(normalisedBullet)
    );
  });
}

function applyBulletsToDescription(
  description: string,
  tailoredBullets: TailoredBullet[],
): string {
  if (tailoredBullets.length === 0) {
    return description;
  }

  const bullets = splitDescription(description);

  for (const tailoredBullet of tailoredBullets) {
    const tailoredText = tailoredBullet.tailored.trim();

    if (!tailoredText) {
      continue;
    }

    const matchingIndex = findMatchingBulletIndex(
      bullets,
      tailoredBullet,
    );

    if (matchingIndex !== -1) {
      bullets[matchingIndex] = tailoredText;
      continue;
    }

    if (
      tailoredBullet.original.trim() === "" &&
      !bullets.some(
        (bullet) =>
          normaliseText(bullet) ===
          normaliseText(tailoredText),
      )
    ) {
      bullets.push(tailoredText);
    }
  }

  return bullets.length > 0
    ? joinDescription(bullets)
    : description;
}

export function applyResumeTailoring(
  resume: ResumeData,
  analysis: ResumeTailorAnalysis,
): ResumeData {
  const workBulletsByItemId = new Map<
    string,
    TailoredBullet[]
  >();

  const projectBulletsByItemId = new Map<
    string,
    TailoredBullet[]
  >();

  for (const bullet of analysis.tailoredBullets) {
    if (!bullet.sourceItemId.trim()) {
      continue;
    }

    const targetMap =
      bullet.section === "projects"
        ? projectBulletsByItemId
        : workBulletsByItemId;

    const existingBullets =
      targetMap.get(bullet.sourceItemId) ?? [];

    targetMap.set(bullet.sourceItemId, [
      ...existingBullets,
      bullet,
    ]);
  }

  const suggestedHeadline =
    analysis.suggestedHeadline.trim();

  const suggestedSummary =
    analysis.suggestedSummary.trim();

  const suggestedSkills = uniqueStrings([
    ...resume.skills,
    ...analysis.suggestedSkills,
  ]);

  return {
    ...resume,

    title:
      suggestedHeadline ||
      resume.title,

    personalDetails: {
      ...resume.personalDetails,

      jobTitle:
        suggestedHeadline ||
        resume.personalDetails.jobTitle,

      professionalSummary:
        suggestedSummary ||
        resume.personalDetails.professionalSummary,
    },

    skills: suggestedSkills,

    workExperience: resume.workExperience.map(
      (experience) => {
        const tailoredBullets =
          workBulletsByItemId.get(experience.id) ?? [];

        return {
          ...experience,
          description: applyBulletsToDescription(
            experience.description,
            tailoredBullets,
          ),
        };
      },
    ),

    projects: resume.projects.map((project) => {
      const tailoredBullets =
        projectBulletsByItemId.get(project.id) ?? [];

      return {
        ...project,
        description: applyBulletsToDescription(
          project.description,
          tailoredBullets,
        ),
      };
    }),
  };
}