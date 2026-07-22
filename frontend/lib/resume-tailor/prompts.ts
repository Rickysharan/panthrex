import type { TailorResumeRequest } from "./types";

export function buildResumeTailorPrompt(
  request: TailorResumeRequest,
): string {
  return `
You are an expert ATS resume writer and senior technical recruiter.

Your task is to optimise the candidate's resume specifically for the provided job description.

Return ONLY valid JSON.

Target Role:
${request.targetRole}

Company:
${request.company || "Not specified"}

Job Description:
${request.jobDescription}

Resume:
${JSON.stringify(request.resume, null, 2)}

Requirements:

1. Calculate:
- original ATS score (0-100)
- improved ATS score (0-100)

2. Provide:
- executive summary
- strengths
- improvements

3. Detect:
- matched keywords
- missing keywords
- partially matched keywords

Each keyword must contain:

{
  "keyword":"",
  "category":"matched|missing|partial",
  "importance":"low|medium|high",
  "explanation":""
}

4. Rewrite every weak resume bullet.

Each rewritten bullet must include:

{
  "id":"",
  "section":"work-experience|projects",
  "sourceItemId":"",
  "original":"",
  "tailored":"",
  "reason":"",
  "keywordsAdded":[]
}

Rules:

- Preserve truthful information.
- Never invent experience.
- Never invent employers.
- Never invent technologies not supported by the resume.
- Improve grammar and impact.
- Use measurable achievements whenever available.
- Maximise ATS compatibility.

5. Suggest:

- professional summary
- headline
- additional technical skills

Finally return JSON using this structure exactly:

{
  "originalScore":0,
  "atsScore":0,
  "scoreImprovement":0,
  "summary":"",
  "matchedKeywords":[],
  "missingKeywords":[],
  "partialKeywords":[],
  "strengths":[],
  "improvements":[],
  "tailoredBullets":[],
  "suggestedSkills":[],
  "suggestedHeadline":"",
  "suggestedSummary":""
}
`;
}