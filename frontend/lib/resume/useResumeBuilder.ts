"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { AiParsedResumeData } from "@/lib/ai-resume-parser/types";
import type { ResumeEnhancementSuggestion } from "@/lib/ai-resume-enhancer/types";

import { defaultResumeData } from "./default-data";
import type {
  Certification,
  Education,
  PersonalDetails,
  Project,
  ResumeData,
  ResumeTemplate,
  WorkExperience,
} from "./types";

const STORAGE_KEY = "panthrex-resume-draft";
const AUTOSAVE_DELAY = 700;

const VALID_TEMPLATES: ResumeTemplate[] = [
  "professional",
  "modern",
  "minimal",
];

type ResumeRow = {
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
  created_at: string;
  updated_at: string;
};

function createId(prefix: string) {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cloneDefaultResumeData(): ResumeData {
  return {
    ...defaultResumeData,
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

function isResumeTemplate(
  value: unknown,
): value is ResumeTemplate {
  return (
    typeof value === "string" &&
    VALID_TEMPLATES.includes(value as ResumeTemplate)
  );
}

function isStoredResumeData(
  value: unknown,
): value is Partial<ResumeData> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const resume = value as Partial<ResumeData>;

  return (
    typeof resume.title === "string" &&
    Boolean(resume.personalDetails) &&
    typeof resume.personalDetails === "object" &&
    Array.isArray(resume.workExperience) &&
    Array.isArray(resume.education) &&
    Array.isArray(resume.skills) &&
    Array.isArray(resume.projects) &&
    Array.isArray(resume.certifications)
  );
}

function normalizeResumeData(
  storedResume: Partial<ResumeData>,
): ResumeData {
  return {
    ...cloneDefaultResumeData(),
    ...storedResume,
    template: isResumeTemplate(storedResume.template)
      ? storedResume.template
      : "professional",
    personalDetails: {
      ...defaultResumeData.personalDetails,
      ...storedResume.personalDetails,
    },
    workExperience: Array.isArray(
      storedResume.workExperience,
    )
      ? storedResume.workExperience
      : [],
    education: Array.isArray(storedResume.education)
      ? storedResume.education
      : [],
    skills: Array.isArray(storedResume.skills)
      ? storedResume.skills
      : [],
    projects: Array.isArray(storedResume.projects)
      ? storedResume.projects
      : [],
    certifications: Array.isArray(
      storedResume.certifications,
    )
      ? storedResume.certifications
      : [],
  };
}

function readStoredResumeData(): ResumeData | null {
  try {
    const storedResume =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedResume) {
      return null;
    }

    const parsedResume: unknown =
      JSON.parse(storedResume);

    if (isStoredResumeData(parsedResume)) {
      return normalizeResumeData(parsedResume);
    }
  } catch (error) {
    console.error(
      "Unable to load the locally saved resume draft.",
      error,
    );
  }

  return null;
}

function writeStoredResumeData(resumeData: ResumeData) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(resumeData),
    );
  } catch (error) {
    console.error(
      "Unable to save the resume draft locally.",
      error,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function resumeRowToResumeData(
  row: ResumeRow,
): ResumeData {
  return normalizeResumeData({
    title: row.title ?? "Untitled Resume",
    template: isResumeTemplate(row.template)
      ? row.template
      : "professional",
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
    workExperience: isWorkExperienceArray(row.experience)
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
  });
}

function createResumePayload(
  resumeData: ResumeData,
  userId: string,
) {
  return {
    user_id: userId,
    title: resumeData.title.trim() || "Untitled Resume",
    template: resumeData.template,
    full_name:
      resumeData.personalDetails.fullName || null,
    email: resumeData.personalDetails.email || null,
    phone: resumeData.personalDetails.phone || null,
    location:
      resumeData.personalDetails.location || null,
    summary:
      resumeData.personalDetails.professionalSummary ||
      null,
    job_title:
      resumeData.personalDetails.jobTitle || null,
    website:
      resumeData.personalDetails.website || null,
    linkedin:
      resumeData.personalDetails.linkedin || null,
    github:
      resumeData.personalDetails.github || null,
    experience: resumeData.workExperience,
    education: resumeData.education,
    skills: resumeData.skills,
    projects: resumeData.projects,
    certifications: resumeData.certifications,
    updated_at: new Date().toISOString(),
  };
}

export function useResumeBuilder() {
  const supabase = useMemo(() => createClient(), []);

  const [resumeData, setResumeData] = useState<ResumeData>(
    () => cloneDefaultResumeData(),
  );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [resumeId, setResumeId] =
    useState<string | null>(null);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [hasLoadedResume, setHasLoadedResume] =
    useState(false);

  const isMountedRef = useRef(true);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      const localResume = readStoredResumeData();

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (cancelled) {
          return;
        }

        if (!user) {
          if (localResume) {
            setResumeData(localResume);
          }

          setHasLoadedResume(true);
          return;
        }

        setUserId(user.id);

        const {
          data: existingResume,
          error: loadError,
        } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (loadError) {
          throw loadError;
        }

        if (cancelled) {
          return;
        }

        if (existingResume) {
          const remoteResume =
            resumeRowToResumeData(
              existingResume as ResumeRow,
            );

          setResumeId(existingResume.id);
          setResumeData(remoteResume);
          writeStoredResumeData(remoteResume);

          const savedDate = new Date(
            existingResume.updated_at,
          );

          if (!Number.isNaN(savedDate.getTime())) {
            setLastSavedAt(savedDate);
          }

          setHasLoadedResume(true);
          return;
        }

        const initialResume =
          localResume ?? cloneDefaultResumeData();

        setResumeData(initialResume);

        const {
          data: createdResume,
          error: createError,
        } = await supabase
          .from("resumes")
          .insert(
            createResumePayload(
              initialResume,
              user.id,
            ),
          )
          .select("id, updated_at")
          .single();

        if (createError) {
          throw createError;
        }

        if (cancelled) {
          return;
        }

        setResumeId(createdResume.id);
        writeStoredResumeData(initialResume);

        const savedDate = new Date(
          createdResume.updated_at,
        );

        setLastSavedAt(
          Number.isNaN(savedDate.getTime())
            ? new Date()
            : savedDate,
        );
      } catch (error) {
        console.error(
          "Unable to load the resume from Supabase.",
          error,
        );

        if (!cancelled && localResume) {
          setResumeData(localResume);
        }
      } finally {
        if (!cancelled) {
          setHasLoadedResume(true);
        }
      }
    }

    void loadResume();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!hasLoadedResume) {
      return;
    }

    const requestId = ++saveRequestIdRef.current;

    const saveTimer = window.setTimeout(async () => {
      writeStoredResumeData(resumeData);

      if (!userId) {
        if (
          isMountedRef.current &&
          requestId === saveRequestIdRef.current
        ) {
          setLastSavedAt(new Date());
        }

        return;
      }

      try {
        const payload = createResumePayload(
          resumeData,
          userId,
        );

        if (resumeId) {
          const { error: updateError } = await supabase
            .from("resumes")
            .update(payload)
            .eq("id", resumeId)
            .eq("user_id", userId);

          if (updateError) {
            throw updateError;
          }
        } else {
          const {
            data: createdResume,
            error: createError,
          } = await supabase
            .from("resumes")
            .insert(payload)
            .select("id")
            .single();

          if (createError) {
            throw createError;
          }

          if (isMountedRef.current) {
            setResumeId(createdResume.id);
          }
        }

        if (
          isMountedRef.current &&
          requestId === saveRequestIdRef.current
        ) {
          setLastSavedAt(new Date());
        }
      } catch (error) {
        console.error(
          "Unable to save the resume to Supabase.",
          error,
        );
      }
    }, AUTOSAVE_DELAY);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [
    hasLoadedResume,
    resumeData,
    resumeId,
    supabase,
    userId,
  ]);

  const updateTitle = useCallback((title: string) => {
    setResumeData((currentResume) => ({
      ...currentResume,
      title,
    }));
  }, []);

  const updateTemplate = useCallback(
    (template: ResumeTemplate) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        template,
      }));
    },
    [],
  );

  const updatePersonalDetails = useCallback(
    (updates: Partial<PersonalDetails>) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        personalDetails: {
          ...currentResume.personalDetails,
          ...updates,
        },
      }));
    },
    [],
  );

  const addWorkExperience = useCallback(() => {
    const workExperience: WorkExperience = {
      id: createId("experience"),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    };

    setResumeData((currentResume) => ({
      ...currentResume,
      workExperience: [
        ...currentResume.workExperience,
        workExperience,
      ],
    }));
  }, []);

  const updateWorkExperience = useCallback(
    (
      id: string,
      updates: Partial<WorkExperience>,
    ) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        workExperience:
          currentResume.workExperience.map(
            (experience) =>
              experience.id === id
                ? {
                    ...experience,
                    ...updates,
                  }
                : experience,
          ),
      }));
    },
    [],
  );

  const removeWorkExperience = useCallback(
    (id: string) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        workExperience:
          currentResume.workExperience.filter(
            (experience) => experience.id !== id,
          ),
      }));
    },
    [],
  );

  const addEducation = useCallback(() => {
    const education: Education = {
      id: createId("education"),
      institution: "",
      qualification: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };

    setResumeData((currentResume) => ({
      ...currentResume,
      education: [
        ...currentResume.education,
        education,
      ],
    }));
  }, []);

  const updateEducation = useCallback(
    (id: string, updates: Partial<Education>) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        education: currentResume.education.map(
          (education) =>
            education.id === id
              ? {
                  ...education,
                  ...updates,
                }
              : education,
        ),
      }));
    },
    [],
  );

  const removeEducation = useCallback(
    (id: string) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        education:
          currentResume.education.filter(
            (education) => education.id !== id,
          ),
      }));
    },
    [],
  );

  const addSkill = useCallback((skill: string) => {
    const normalizedSkill = skill.trim();

    if (!normalizedSkill) {
      return;
    }

    setResumeData((currentResume) => {
      const skillAlreadyExists =
        currentResume.skills.some(
          (existingSkill) =>
            existingSkill.toLowerCase() ===
            normalizedSkill.toLowerCase(),
        );

      if (skillAlreadyExists) {
        return currentResume;
      }

      return {
        ...currentResume,
        skills: [
          ...currentResume.skills,
          normalizedSkill,
        ],
      };
    });
  }, []);

  const removeSkill = useCallback((skill: string) => {
    setResumeData((currentResume) => ({
      ...currentResume,
      skills: currentResume.skills.filter(
        (existingSkill) => existingSkill !== skill,
      ),
    }));
  }, []);

  const addProject = useCallback(() => {
    const project: Project = {
      id: createId("project"),
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      projectUrl: "",
      description: "",
    };

    setResumeData((currentResume) => ({
      ...currentResume,
      projects: [
        ...currentResume.projects,
        project,
      ],
    }));
  }, []);

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        projects: currentResume.projects.map(
          (project) =>
            project.id === id
              ? {
                  ...project,
                  ...updates,
                }
              : project,
        ),
      }));
    },
    [],
  );

  const removeProject = useCallback((id: string) => {
    setResumeData((currentResume) => ({
      ...currentResume,
      projects: currentResume.projects.filter(
        (project) => project.id !== id,
      ),
    }));
  }, []);

  const addCertification = useCallback(() => {
    const certification: Certification = {
      id: createId("certification"),
      name: "",
      issuer: "",
      issueDate: "",
      credentialId: "",
      credentialUrl: "",
    };

    setResumeData((currentResume) => ({
      ...currentResume,
      certifications: [
        ...currentResume.certifications,
        certification,
      ],
    }));
  }, []);

  const updateCertification = useCallback(
    (
      id: string,
      updates: Partial<Certification>,
    ) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        certifications:
          currentResume.certifications.map(
            (certification) =>
              certification.id === id
                ? {
                    ...certification,
                    ...updates,
                  }
                : certification,
          ),
      }));
    },
    [],
  );

  const removeCertification = useCallback(
    (id: string) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        certifications:
          currentResume.certifications.filter(
            (certification) =>
              certification.id !== id,
          ),
      }));
    },
    [],
  );

    const importParsedResume = useCallback(
    (parsedResume: AiParsedResumeData) => {
      setResumeData((currentResume) => ({
        ...currentResume,
        personalDetails: {
          ...defaultResumeData.personalDetails,
          ...parsedResume.personalDetails,
        },
        workExperience: parsedResume.workExperience.map(
          (experience) => ({
            ...experience,
          }),
        ),
        education: parsedResume.education.map(
          (education) => ({
            ...education,
          }),
        ),
        skills: [...parsedResume.skills],
        projects: parsedResume.projects.map(
          (project) => ({
            ...project,
          }),
        ),
        certifications: parsedResume.certifications.map(
          (certification) => ({
            ...certification,
          }),
        ),
      }));
    },
    [],
  );
  const applyEnhancementSuggestions = useCallback(
    (suggestions: ResumeEnhancementSuggestion[]) => {
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        return;
      }

      setResumeData((currentResume) => {
        let updatedResume = currentResume;

        for (const suggestion of suggestions) {
          if (
            !suggestion ||
            suggestion.status !== "accepted" ||
            typeof suggestion.improvedValue !== "string"
          ) {
            continue;
          }

          const originalValue =
            typeof suggestion.originalValue === "string"
              ? suggestion.originalValue
              : "";

          const improvedValue = suggestion.improvedValue;

          const replaceMatchingValue = (value: string) =>
            value === originalValue ? improvedValue : value;

          const normalizedField = suggestion.field
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, "");

          const personalDetails = {
            ...updatedResume.personalDetails,
            fullName:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.fullName,
                  )
                : normalizedField === "fullname" ||
                    normalizedField === "name"
                  ? improvedValue
                  : updatedResume.personalDetails.fullName,
            email:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.email,
                  )
                : normalizedField === "email"
                  ? improvedValue
                  : updatedResume.personalDetails.email,
            phone:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.phone,
                  )
                : normalizedField === "phone" ||
                    normalizedField === "phonenumber"
                  ? improvedValue
                  : updatedResume.personalDetails.phone,
            location:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.location,
                  )
                : normalizedField === "location"
                  ? improvedValue
                  : updatedResume.personalDetails.location,
            professionalSummary:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.professionalSummary,
                  )
                : normalizedField === "professionalsummary" ||
                    normalizedField === "summary"
                  ? improvedValue
                  : updatedResume.personalDetails
                      .professionalSummary,
            jobTitle:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.jobTitle,
                  )
                : normalizedField === "jobtitle" ||
                    normalizedField === "professionaltitle"
                  ? improvedValue
                  : updatedResume.personalDetails.jobTitle,
            website:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.website,
                  )
                : normalizedField === "website"
                  ? improvedValue
                  : updatedResume.personalDetails.website,
            linkedin:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.linkedin,
                  )
                : normalizedField === "linkedin"
                  ? improvedValue
                  : updatedResume.personalDetails.linkedin,
            github:
              originalValue
                ? replaceMatchingValue(
                    updatedResume.personalDetails.github,
                  )
                : normalizedField === "github"
                  ? improvedValue
                  : updatedResume.personalDetails.github,
          };

          updatedResume = {
            ...updatedResume,
            personalDetails,
            workExperience: updatedResume.workExperience.map(
              (experience) => ({
                ...experience,
                company: originalValue
                  ? replaceMatchingValue(experience.company)
                  : experience.company,
                position: originalValue
                  ? replaceMatchingValue(experience.position)
                  : experience.position,
                location: originalValue
                  ? replaceMatchingValue(experience.location)
                  : experience.location,
                description: originalValue
                  ? replaceMatchingValue(experience.description)
                  : experience.description,
              }),
            ),
            education: updatedResume.education.map(
              (education) => ({
                ...education,
                institution: originalValue
                  ? replaceMatchingValue(education.institution)
                  : education.institution,
                qualification: originalValue
                  ? replaceMatchingValue(education.qualification)
                  : education.qualification,
                fieldOfStudy: originalValue
                  ? replaceMatchingValue(education.fieldOfStudy)
                  : education.fieldOfStudy,
                location: originalValue
                  ? replaceMatchingValue(education.location)
                  : education.location,
                description: originalValue
                  ? replaceMatchingValue(education.description)
                  : education.description,
              }),
            ),
            skills: updatedResume.skills.map((skill) =>
              originalValue
                ? replaceMatchingValue(skill)
                : skill,
            ),
            projects: updatedResume.projects.map((project) => ({
              ...project,
              name: originalValue
                ? replaceMatchingValue(project.name)
                : project.name,
              role: originalValue
                ? replaceMatchingValue(project.role)
                : project.role,
              projectUrl: originalValue
                ? replaceMatchingValue(project.projectUrl)
                : project.projectUrl,
              description: originalValue
                ? replaceMatchingValue(project.description)
                : project.description,
            })),
            certifications: updatedResume.certifications.map(
              (certification) => ({
                ...certification,
                name: originalValue
                  ? replaceMatchingValue(certification.name)
                  : certification.name,
                issuer: originalValue
                  ? replaceMatchingValue(certification.issuer)
                  : certification.issuer,
                credentialId: originalValue
                  ? replaceMatchingValue(
                      certification.credentialId,
                    )
                  : certification.credentialId,
                credentialUrl: originalValue
                  ? replaceMatchingValue(
                      certification.credentialUrl,
                    )
                  : certification.credentialUrl,
              }),
            ),
          };
        }

        return updatedResume;
      });
    },
    [],
  );

  const resetResume = useCallback(() => {
    const emptyResume = cloneDefaultResumeData();

    setResumeData(emptyResume);
    setLastSavedAt(null);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Unable to remove the locally saved resume draft.",
        error,
      );
    }
  }, []);

  return useMemo(
    () => ({
      resumeData,
      lastSavedAt,
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
    }),
    [
      resumeData,
      lastSavedAt,
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
    ],
  );
}