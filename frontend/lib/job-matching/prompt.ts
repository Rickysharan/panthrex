import type { JobMatchRequest } from "@/lib/job-matching/types";

function formatResumeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatResumeValue(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => {
        const formattedValue = formatResumeValue(entryValue);

        if (!formattedValue) {
          return "";
        }

        return `${key}: ${formattedValue}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function normalizeJobDescription(
  jobDescription: string,
): string {
  return jobDescription
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildJobMatchingPrompt(
  request: JobMatchRequest,
): string {
  const formattedResume = formatResumeValue(
    request.resume,
  );

  const formattedJobDescription =
    normalizeJobDescription(
      request.jobDescription,
    );

  return `
You are an expert ATS analyst, technical recruiter and career coach.

Compare the candidate's resume against the supplied job description.

CANDIDATE RESUME
${formattedResume || "No usable resume content was provided."}

JOB DESCRIPTION
${formattedJobDescription}

ANALYSIS OBJECTIVES
1. Calculate an overall job match score from 0 to 100.
2. Calculate an ATS compatibility score from 0 to 100.
3. Calculate interview readiness from 0 to 100.
4. Identify skills clearly demonstrated by the resume.
5. Identify important skills missing from the resume.
6. Separate required skills from preferred skills.
7. Identify evidence-based strengths.
8. Identify weaknesses or gaps affecting suitability.
9. Recommend relevant ATS keywords.
10. Recommend specific resume improvements.
11. Score major matching categories.
12. Produce a concise professional summary.

SCORING RULES
- Do not inflate scores.
- Base every score on evidence present in the resume.
- Treat explicitly required job criteria as more important than preferred criteria.
- Penalise missing required skills more heavily.
- Do not assume experience, qualifications or achievements that are not stated.
- Transferable experience may receive partial credit when clearly relevant.
- Keyword presence alone is not sufficient evidence of proficiency.
- Scores must be integers between 0 and 100.

SKILL RULES
- Include only genuine skills, technologies, methodologies, qualifications or domain competencies.
- Do not include generic phrases such as "hard-working" unless the job explicitly requires them.
- Avoid duplicate or near-duplicate skills.
- A skill must not appear in both matchedSkills and missingSkills.
- Set importance to "required" or "preferred".
- Set matched to true for matchedSkills.
- Set matched to false for missingSkills.

RESUME IMPROVEMENT RULES
- Each suggestion must be specific and actionable.
- Use priority "high" for changes likely to materially improve ATS or recruiter alignment.
- Use priority "medium" for useful but non-critical changes.
- Use priority "low" for optional polish.
- Do not recommend adding skills or experience the candidate does not possess.
- You may recommend clarifying, quantifying or repositioning existing evidence.

CATEGORY SCORE RULES
Include these categories:
- Skills
- Experience
- Education
- Keywords
- Role Alignment

You may include additional categories when relevant.

OUTPUT RULES
- Return valid JSON only.
- Do not use markdown.
- Do not include commentary outside the JSON object.
- Use concise but meaningful text.
- Ensure all required arrays are present, even when empty.

Return exactly this JSON structure:

{
  "overallScore": 75,
  "atsScore": 72,
  "interviewReadiness": 68,
  "matchedSkills": [
    {
      "name": "Python",
      "matched": true,
      "importance": "required"
    }
  ],
  "missingSkills": [
    {
      "name": "Apache Spark",
      "matched": false,
      "importance": "preferred"
    }
  ],
  "strengths": [
    "Evidence-based candidate strength"
  ],
  "weaknesses": [
    "Evidence-based candidate weakness or gap"
  ],
  "keywordSuggestions": [
    "Relevant ATS keyword"
  ],
  "resumeImprovements": [
    {
      "title": "Clear improvement title",
      "description": "Specific and actionable recommendation.",
      "priority": "high"
    }
  ],
  "categoryScores": [
    {
      "name": "Skills",
      "score": 75
    },
    {
      "name": "Experience",
      "score": 70
    },
    {
      "name": "Education",
      "score": 80
    },
    {
      "name": "Keywords",
      "score": 65
    },
    {
      "name": "Role Alignment",
      "score": 72
    }
  ],
  "summary": "Concise assessment of the candidate's overall suitability and most important next action."
}
`.trim();
}