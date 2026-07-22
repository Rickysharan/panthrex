import type {
  AiParsedResumeData,
  RawAiParsedResume,
  RawParsedCertification,
  RawParsedEducation,
  RawParsedPersonalDetails,
  RawParsedProject,
  RawParsedWorkExperience,
} from "@/lib/ai-resume-parser/types";

const MAX_FIELD_LENGTH = 6_000;
const MAX_SKILL_LENGTH = 120;
const MAX_ARRAY_ITEMS = 50;

function createId(prefix: string, index: number): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${index}`;
}

function sanitizeString(
  value: unknown,
  maxLength = MAX_FIELD_LENGTH,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function sanitizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizePersonalDetails(
  value: RawParsedPersonalDetails | undefined,
) {
  return {
    fullName: sanitizeString(value?.fullName, 200),
    jobTitle: sanitizeString(value?.jobTitle, 200),
    email: sanitizeString(value?.email, 320),
    phone: sanitizeString(value?.phone, 100),
    location: sanitizeString(value?.location, 300),
    website: sanitizeString(value?.website, 500),
    linkedin: sanitizeString(value?.linkedin, 500),
    github: sanitizeString(value?.github, 500),
    professionalSummary: sanitizeString(
      value?.professionalSummary,
    ),
  };
}

function normalizeWorkExperience(
  values: RawParsedWorkExperience[] | undefined,
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, MAX_ARRAY_ITEMS)
    .map((value, index) => {
      const isCurrent = sanitizeBoolean(
        value?.isCurrent,
      );

      return {
        id: createId("work", index),
        company: sanitizeString(value?.company, 300),
        position: sanitizeString(value?.position, 300),
        location: sanitizeString(value?.location, 300),
        startDate: sanitizeString(value?.startDate, 100),
        endDate: isCurrent
          ? ""
          : sanitizeString(value?.endDate, 100),
        isCurrent,
        description: sanitizeString(
          value?.description,
        ),
      };
    })
    .filter(
      (item) =>
        item.company ||
        item.position ||
        item.description,
    );
}

function normalizeEducation(
  values: RawParsedEducation[] | undefined,
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, MAX_ARRAY_ITEMS)
    .map((value, index) => ({
      id: createId("education", index),
      institution: sanitizeString(
        value?.institution,
        300,
      ),
      qualification: sanitizeString(
        value?.qualification,
        300,
      ),
      fieldOfStudy: sanitizeString(
        value?.fieldOfStudy,
        300,
      ),
      location: sanitizeString(value?.location, 300),
      startDate: sanitizeString(value?.startDate, 100),
      endDate: sanitizeString(value?.endDate, 100),
      description: sanitizeString(
        value?.description,
      ),
    }))
    .filter(
      (item) =>
        item.institution ||
        item.qualification ||
        item.fieldOfStudy,
    );
}

function normalizeSkills(values: unknown[] | undefined) {
  if (!Array.isArray(values)) {
    return [];
  }

  const uniqueSkills = new Map<string, string>();

  for (const value of values.slice(0, MAX_ARRAY_ITEMS)) {
    const skill = sanitizeString(
      value,
      MAX_SKILL_LENGTH,
    );

    if (!skill) {
      continue;
    }

    const normalizedKey = skill.toLowerCase();

    if (!uniqueSkills.has(normalizedKey)) {
      uniqueSkills.set(normalizedKey, skill);
    }
  }

  return Array.from(uniqueSkills.values());
}

function normalizeProjects(
  values: RawParsedProject[] | undefined,
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, MAX_ARRAY_ITEMS)
    .map((value, index) => ({
      id: createId("project", index),
      name: sanitizeString(value?.name, 300),
      role: sanitizeString(value?.role, 300),
      startDate: sanitizeString(value?.startDate, 100),
      endDate: sanitizeString(value?.endDate, 100),
      projectUrl: sanitizeString(
        value?.projectUrl,
        500,
      ),
      description: sanitizeString(
        value?.description,
      ),
    }))
    .filter(
      (item) =>
        item.name ||
        item.role ||
        item.description,
    );
}

function normalizeCertifications(
  values: RawParsedCertification[] | undefined,
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, MAX_ARRAY_ITEMS)
    .map((value, index) => ({
      id: createId("certification", index),
      name: sanitizeString(value?.name, 300),
      issuer: sanitizeString(value?.issuer, 300),
      issueDate: sanitizeString(
        value?.issueDate,
        100,
      ),
      credentialId: sanitizeString(
        value?.credentialId,
        300,
      ),
      credentialUrl: sanitizeString(
        value?.credentialUrl,
        500,
      ),
    }))
    .filter(
      (item) =>
        item.name ||
        item.issuer ||
        item.credentialId,
    );
}

export function normalizeAiParsedResume(
  value: RawAiParsedResume,
): AiParsedResumeData {
  return {
    personalDetails: normalizePersonalDetails(
      value.personalDetails,
    ),
    workExperience: normalizeWorkExperience(
      value.workExperience,
    ),
    education: normalizeEducation(value.education),
    skills: normalizeSkills(value.skills),
    projects: normalizeProjects(value.projects),
    certifications: normalizeCertifications(
      value.certifications,
    ),
  };
}

export function normalizeParserWarnings(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((warning) => sanitizeString(warning, 500))
    .filter(Boolean)
    .slice(0, 20);
}