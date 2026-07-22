import type {
  AiResumeParserRequest,
} from "@/lib/ai-resume-parser/types";

type AiResumeParserPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildAiResumeParserPrompt(
  request: AiResumeParserRequest,
): AiResumeParserPrompt {
  const systemPrompt = `
You are a precise resume parsing engine.

Your task is to convert raw resume text into valid structured JSON.

Return only one JSON object.
Do not include markdown.
Do not include code fences.
Do not include commentary.
Do not invent information that is not present in the resume.

Use empty strings for missing scalar fields.
Use empty arrays for missing sections.

Dates should preserve the wording from the resume where possible.
For current employment, set "isCurrent" to true and use an empty string for "endDate".

The JSON must exactly match this structure:

{
  "personalDetails": {
    "fullName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": "",
    "professionalSummary": ""
  },
  "workExperience": [
    {
      "company": "",
      "position": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "qualification": "",
      "fieldOfStudy": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "skills": [],
  "projects": [
    {
      "name": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "projectUrl": "",
      "description": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueDate": "",
      "credentialId": "",
      "credentialUrl": ""
    }
  ],
  "warnings": []
}

Parsing rules:

1. Do not create IDs.
2. Do not duplicate entries.
3. Keep descriptions concise but complete.
4. Preserve measurable achievements.
5. Split distinct jobs, education records, projects, and certifications.
6. Skills must be plain strings.
7. Remove obvious section headings from field values.
8. Add a warning only when important information is ambiguous or appears incomplete.
9. Do not infer private or sensitive information.
10. Do not include fields outside the required structure.
`.trim();

  const userPrompt = `
Parse the following resume text into the required JSON structure.

RESUME TEXT:

${request.resumeText}
`.trim();

  return {
    systemPrompt,
    userPrompt,
  };
}