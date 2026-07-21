"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

const VALID_TEMPLATES: ResumeTemplate[] = [
  "professional",
  "modern",
  "minimal",
];

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
      "Unable to load the saved resume draft.",
      error,
    );
  }

  return null;
}

export function useResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(
    () => cloneDefaultResumeData(),
  );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [hasLoadedStorage, setHasLoadedStorage] =
    useState(false);

  useEffect(() => {
    const storedResume = readStoredResumeData();

    if (storedResume) {
      setResumeData(storedResume);
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(resumeData),
        );

        setLastSavedAt(new Date());
      } catch (error) {
        console.error(
          "Unable to save the resume draft.",
          error,
        );
      }
    }, 400);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [hasLoadedStorage, resumeData]);

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

  const resetResume = useCallback(() => {
    setResumeData(cloneDefaultResumeData());
    setLastSavedAt(null);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Unable to remove the saved resume draft.",
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
      resetResume,
    ],
  );
}