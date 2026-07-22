import type { ResumeData } from "@/lib/resume/types";

export function buildResumeEnhancementPrompt(
  resume: ResumeData,
  targetRole?: string,
  jobDescription?: string,
) {
  const role =
    targetRole?.trim() ||
    resume.personalDetails.jobTitle?.trim() ||
    "the candidate's target role";

  const jobContext = jobDescription?.trim()
    ? `
JOB DESCRIPTION:
${jobDescription.trim()}
`
    : "";

  return `
You are an expert resume writer and ATS optimisation specialist.

Your task is to analyse the supplied resume and produce high-quality improvement suggestions.

TARGET ROLE:
${role}
${jobContext}

RESUME DATA:
${JSON.stringify(resume, null, 2)}

Return valid JSON only.

Use this exact structure:

{
  "targetRole": "string",
  "warnings": ["string"],
  "suggestions": [
    {
      "id": "string",
      "section": "professionalSummary | workExperience | projects | skills",
      "itemId": "string or omitted",
      "field": "string",
      "originalValue": "string",
      "improvedValue": "string",
      "explanation": "string",
      "status": "pending"
    }
  ]
}

Rules:

1. Do not invent employers, qualifications, dates, metrics, certifications, projects, responsibilities, or technologies.
2. Preserve the candidate's factual meaning.
3. Improve clarity, impact, grammar, concision, ATS compatibility, and professional tone.
4. Use strong action verbs.
5. Do not add unsupported numerical achievements.
6. Keep each suggestion independently reviewable.
7. For professional summary suggestions:
   - section must be "professionalSummary"
   - field must be "professionalSummary"
   - itemId must be omitted
8. For work experience suggestions:
   - section must be "workExperience"
   - itemId must match the original work experience item id
   - field should normally be "description"
9. For project suggestions:
   - section must be "projects"
   - itemId must match the original project item id
   - field should normally be "description"
10. For skills suggestions:
   - section must be "skills"
   - itemId must be omitted
   - field must be "skills"
   - originalValue and improvedValue must be comma-separated skill lists
11. Every suggestion status must be "pending".
12. Explanations must be brief and specific.
13. Do not return markdown.
14. Do not wrap the JSON in code fences.
15. If the resume is incomplete, add concise warnings instead of inventing content.
`.trim();
}