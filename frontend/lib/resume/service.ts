import { createClient } from "@/lib/supabase/client";

import {
  DEFAULT_RESUME_SECTION_ORDER,
  defaultResumeData,
} from "./default-data";
import type {
  Certification,
  Education,
  Project,
  ResumeData,
  ResumeSectionId,
  ResumeTemplate,
  WorkExperience,
} from "./types";

export type ResumeSummary = {
  id: string;
  title: string;
  template: ResumeTemplate;
  fullName: string;
  jobTitle: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResumeRecord = ResumeSummary & {
  resumeData: ResumeData;
};

type ResumeDatabaseRow = {
  id: string;
  user_id: string;
  title: string | null;
  template: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  job_title: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  education: unknown;
  experience: unknown;
  skills: unknown;
  projects: unknown;
  certifications: unknown;
  section_order: unknown;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
};

const VALID_TEMPLATES: ResumeTemplate[] = [
  "professional",
  "modern",
  "minimal",
  "executive",
  "technical",
  "finance",
  "academic",
  "creative",
];

const VALID_SECTION_IDS: ResumeSectionId[] = [
  "professional-summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isResumeTemplate(
  value: unknown,
): value is ResumeTemplate {
  return (
    typeof value === "string" &&
    VALID_TEMPLATES.includes(value as ResumeTemplate)
  );
}

function isResumeSectionId(
  value: unknown,
): value is ResumeSectionId {
  return (
    typeof value === "string" &&
    VALID_SECTION_IDS.includes(value as ResumeSectionId)
  );
}

function normalizeSectionOrder(
  value: unknown,
): ResumeSectionId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_RESUME_SECTION_ORDER];
  }

  const uniqueSections = value.filter(
    (section, index, sections): section is ResumeSectionId =>
      isResumeSectionId(section) &&
      sections.indexOf(section) === index,
  );

  const missingSections =
    DEFAULT_RESUME_SECTION_ORDER.filter(
      (section) => !uniqueSections.includes(section),
    );

  return [...uniqueSections, ...missingSections];
}

function isWorkExperienceArray(
  value: unknown,
): value is WorkExperience[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string",
    )
  );
}

function isEducationArray(
  value: unknown,
): value is Education[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string",
    )
  );
}

function isProjectArray(
  value: unknown,
): value is Project[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string",
    )
  );
}

function isCertificationArray(
  value: unknown,
): value is Certification[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string",
    )
  );
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function cloneDefaultResumeData(
  title = "Untitled Resume",
): ResumeData {
  return {
    ...defaultResumeData,
    title,
    sectionOrder: [...DEFAULT_RESUME_SECTION_ORDER],
    personalDetails: {
      ...defaultResumeData.personalDetails,
    },
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

function normalizeTitle(title: string): string {
  return title.trim() || "Untitled Resume";
}

function rowToResumeData(
  row: ResumeDatabaseRow,
): ResumeData {
  return {
    title: row.title ?? "Untitled Resume",
    template: isResumeTemplate(row.template)
      ? row.template
      : "professional",
    sectionOrder: normalizeSectionOrder(
      row.section_order,
    ),
    personalDetails: {
      ...defaultResumeData.personalDetails,
      fullName: row.full_name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      location: row.location ?? "",
      professionalSummary: row.summary ?? "",
      jobTitle: row.job_title ?? "",
      website: row.website ?? "",
      linkedin: row.linkedin ?? "",
      github: row.github ?? "",
    },
    workExperience: isWorkExperienceArray(
      row.experience,
    )
      ? row.experience
      : [],
    education: isEducationArray(row.education)
      ? row.education
      : [],
    skills: isStringArray(row.skills)
      ? row.skills
      : [],
    projects: isProjectArray(row.projects)
      ? row.projects
      : [],
    certifications: isCertificationArray(
      row.certifications,
    )
      ? row.certifications
      : [],
  };
}

function rowToSummary(
  row: ResumeDatabaseRow,
): ResumeSummary {
  return {
    id: row.id,
    title: row.title ?? "Untitled Resume",
    template: isResumeTemplate(row.template)
      ? row.template
      : "professional",
    fullName: row.full_name ?? "",
    jobTitle: row.job_title ?? "",
    isDefault: row.is_default ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createDatabasePayload(
  resumeData: ResumeData,
  userId: string,
  isDefault: boolean,
) {
  return {
    user_id: userId,
    title: normalizeTitle(resumeData.title),
    template: resumeData.template,
    section_order: resumeData.sectionOrder,
    full_name:
      resumeData.personalDetails.fullName || null,
    email: resumeData.personalDetails.email || null,
    phone: resumeData.personalDetails.phone || null,
    location:
      resumeData.personalDetails.location || null,
    summary:
      resumeData.personalDetails
        .professionalSummary || null,
    job_title:
      resumeData.personalDetails.jobTitle || null,
    website:
      resumeData.personalDetails.website || null,
    linkedin:
      resumeData.personalDetails.linkedin || null,
    github:
      resumeData.personalDetails.github || null,
    education: resumeData.education,
    experience: resumeData.workExperience,
    skills: resumeData.skills,
    projects: resumeData.projects,
    certifications: resumeData.certifications,
    is_default: isDefault,
    updated_at: new Date().toISOString(),
  };
}

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Unable to verify the current user: ${error.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to manage resumes.",
    );
  }

  return user.id;
}

export async function getResumes(): Promise<
  ResumeSummary[]
> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("resumes")
    .select(
      [
        "id",
        "user_id",
        "title",
        "template",
        "full_name",
        "email",
        "phone",
        "location",
        "summary",
        "job_title",
        "website",
        "linkedin",
        "github",
        "education",
        "experience",
        "skills",
        "projects",
        "certifications",
        "section_order",
        "is_default",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .eq("user_id", userId)
    .order("is_default", {
      ascending: false,
    })
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Unable to load resumes: ${error.message}`,
    );
  }

  const rows =
    (data ?? []) as unknown as ResumeDatabaseRow[];

  return rows.map(rowToSummary);
}

export async function getResumeById(
  resumeId: string,
): Promise<ResumeRecord> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(
      `Unable to load the resume: ${error.message}`,
    );
  }

  const row = data as ResumeDatabaseRow;

  return {
    ...rowToSummary(row),
    resumeData: rowToResumeData(row),
  };
}

export async function createResume(
  title = "Untitled Resume",
): Promise<ResumeSummary> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { count, error: countError } = await supabase
    .from("resumes")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId);

  if (countError) {
    throw new Error(
      `Unable to prepare the new resume: ${countError.message}`,
    );
  }

  const shouldBeDefault = (count ?? 0) === 0;
  const resumeData = cloneDefaultResumeData(
    normalizeTitle(title),
  );

  const { data, error } = await supabase
    .from("resumes")
    .insert(
      createDatabasePayload(
        resumeData,
        userId,
        shouldBeDefault,
      ),
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to create the resume: ${error.message}`,
    );
  }

  return rowToSummary(data as ResumeDatabaseRow);
}

export async function renameResume(
  resumeId: string,
  title: string,
): Promise<ResumeSummary> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const normalizedTitle = normalizeTitle(title);

  const { data, error } = await supabase
    .from("resumes")
    .update({
      title: normalizedTitle,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to rename the resume: ${error.message}`,
    );
  }

  return rowToSummary(data as ResumeDatabaseRow);
}

export async function duplicateResume(
  resumeId: string,
): Promise<ResumeSummary> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const originalResume =
    await getResumeById(resumeId);

  const duplicateTitle = `${originalResume.title} Copy`;

  const duplicateData: ResumeData = {
    ...originalResume.resumeData,
    title: duplicateTitle,
    sectionOrder: [
      ...originalResume.resumeData.sectionOrder,
    ],
    personalDetails: {
      ...originalResume.resumeData.personalDetails,
    },
    workExperience:
      originalResume.resumeData.workExperience.map(
        (experience) => ({
          ...experience,
        }),
      ),
    education:
      originalResume.resumeData.education.map(
        (education) => ({
          ...education,
        }),
      ),
    skills: [...originalResume.resumeData.skills],
    projects:
      originalResume.resumeData.projects.map(
        (project) => ({
          ...project,
        }),
      ),
    certifications:
      originalResume.resumeData.certifications.map(
        (certification) => ({
          ...certification,
        }),
      ),
  };

  const { data, error } = await supabase
    .from("resumes")
    .insert(
      createDatabasePayload(
        duplicateData,
        userId,
        false,
      ),
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Unable to duplicate the resume: ${error.message}`,
    );
  }

  return rowToSummary(data as ResumeDatabaseRow);
}

export async function setDefaultResume(
  resumeId: string,
): Promise<void> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data: targetResume, error: targetError } =
    await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .maybeSingle();

  if (targetError) {
    throw new Error(
      `Unable to verify the resume: ${targetError.message}`,
    );
  }

  if (!targetResume) {
    throw new Error("Resume not found.");
  }

  const { error: clearError } = await supabase
    .from("resumes")
    .update({
      is_default: false,
    })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (clearError) {
    throw new Error(
      `Unable to update the default resume: ${clearError.message}`,
    );
  }

  const { error: setError } = await supabase
    .from("resumes")
    .update({
      is_default: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (setError) {
    throw new Error(
      `Unable to set the default resume: ${setError.message}`,
    );
  }
}

export async function deleteResume(
  resumeId: string,
): Promise<void> {
  const supabase = createClient();
  const userId = await getAuthenticatedUserId();

  const { data: resumeToDelete, error: loadError } =
    await supabase
      .from("resumes")
      .select("id, is_default")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .maybeSingle();

  if (loadError) {
    throw new Error(
      `Unable to verify the resume: ${loadError.message}`,
    );
  }

  if (!resumeToDelete) {
    throw new Error("Resume not found.");
  }

  const { error: deleteError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(
      `Unable to delete the resume: ${deleteError.message}`,
    );
  }

  if (!resumeToDelete.is_default) {
    return;
  }

  const { data: replacement, error: replacementError } =
    await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (replacementError) {
    throw new Error(
      `Resume deleted, but a new default could not be selected: ${replacementError.message}`,
    );
  }

  if (!replacement) {
    return;
  }

  const { error: defaultError } = await supabase
    .from("resumes")
    .update({
      is_default: true,
    })
    .eq("id", replacement.id)
    .eq("user_id", userId);

  if (defaultError) {
    throw new Error(
      `Resume deleted, but the replacement default could not be saved: ${defaultError.message}`,
    );
  }
}
