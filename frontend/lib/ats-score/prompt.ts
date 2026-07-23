import type {
  AtsScoreRequest,
} from "@/lib/ats-score/types";

function cleanText(value: string): string {
  return value.trim();
}

function formatResume(
  request: AtsScoreRequest,
): string {
  const { resume } = request;

  const workExperience =
    resume.workExperience.length > 0
      ? resume.workExperience
          .map(
            (experience, index) => `
Work Experience ${index + 1}
Position: ${cleanText(experience.position)}
Company: ${cleanText(experience.company)}
Location: ${cleanText(experience.location)}
Start Date: ${cleanText(experience.startDate)}
End Date: ${
              experience.isCurrent
                ? "Present"
                : cleanText(experience.endDate)
            }
Description:
${cleanText(experience.description)}
`,
          )
          .join("\n")
      : "No work experience provided.";

  const education =
    resume.education.length > 0
      ? resume.education
          .map(
            (item, index) => `
Education ${index + 1}
Institution: ${cleanText(item.institution)}
Qualification: ${cleanText(item.qualification)}
Field of Study: ${cleanText(item.fieldOfStudy)}
Location: ${cleanText(item.location)}
Start Date: ${cleanText(item.startDate)}
End Date: ${cleanText(item.endDate)}
Description:
${cleanText(item.description)}
`,
          )
          .join("\n")
      : "No education provided.";

  const projects =
    resume.projects.length > 0
      ? resume.projects
          .map(
            (project, index) => `
Project ${index + 1}
Name: ${cleanText(project.name)}
Role: ${cleanText(project.role)}
Start Date: ${cleanText(project.startDate)}
End Date: ${cleanText(project.endDate)}
URL: ${cleanText(project.projectUrl)}
Description:
${cleanText(project.description)}
`,
          )
          .join("\n")
      : "No projects provided.";

  const certifications =
    resume.certifications.length > 0
      ? resume.certifications
          .map(
            (certification, index) => `
Certification ${index + 1}
Name: ${cleanText(certification.name)}
Issuer: ${cleanText(certification.issuer)}
Issue Date: ${cleanText(certification.issueDate)}
Credential ID: ${cleanText(
              certification.credentialId,
            )}
Credential URL: ${cleanText(
              certification.credentialUrl,
            )}
`,
          )
          .join("\n")
      : "No certifications provided.";

  return `
RESUME TITLE
${cleanText(resume.title)}

TEMPLATE
${resume.template}

PERSONAL DETAILS
Full Name: ${cleanText(
    resume.personalDetails.fullName,
  )}
Professional Title: ${cleanText(
    resume.personalDetails.jobTitle,
  )}
Email: ${cleanText(resume.personalDetails.email)}
Phone: ${cleanText(resume.personalDetails.phone)}
Location: ${cleanText(
    resume.personalDetails.location,
  )}
Website: ${cleanText(
    resume.personalDetails.website,
  )}
LinkedIn: ${cleanText(
    resume.personalDetails.linkedin,
  )}
GitHub: ${cleanText(
    resume.personalDetails.github,
  )}

PROFESSIONAL SUMMARY
${cleanText(
    resume.personalDetails.professionalSummary,
  )}

WORK EXPERIENCE
${workExperience}

EDUCATION
${education}

SKILLS
${
  resume.skills.length > 0
    ? resume.skills.join(", ")
    : "No skills provided."
}

PROJECTS
${projects}

CERTIFICATIONS
${certifications}
`;
}

export function buildAtsScorePrompt(
  request: AtsScoreRequest,
): string {
  const formattedResume = formatResume(request);
  const jobDescription =
    request.jobDescription.trim();

  return `
You are performing a detailed Applicant Tracking System resume analysis.

Analyse the resume against the supplied job description. Evaluate keyword alignment, skills relevance, section completeness, ATS compatibility, measurable impact, readability, and overall suitability.

Important scoring rules:

1. All scores must be numbers between 0 and 100.
2. Do not award a high score simply because the resume contains many words.
3. Required job-description skills should carry more weight than preferred skills.
4. Missing critical requirements must reduce the keyword and overall scores.
5. The overall score must reflect the full analysis and must not be a simple average.
6. Do not invent resume experience, qualifications, skills, achievements, or keywords.
7. Only mark a keyword as matched when it genuinely appears in the resume or has an unambiguous equivalent.
8. Formatting analysis must be based only on the structured resume information provided.
9. Do not claim that fonts, tables, graphics, columns, headers, footers, or file parsing were checked because the original rendered document was not supplied.
10. Recommendations must be specific, realistic, and based on actual resume content.

Score-level thresholds:

- excellent: 85 to 100
- good: 70 to 84
- needs-improvement: 50 to 69
- poor: 0 to 49

Use these category names exactly where required:

- keywords
- skills
- experience
- education
- formatting
- contact-information
- section-completeness
- impact
- readability

Use these section values exactly:

- personal-details
- professional-summary
- work-experience
- education
- skills
- projects
- certifications

Use these severity values exactly:

- critical
- high
- medium
- low

Return only one valid JSON object using this exact structure:

{
  "overallScore": 0,
  "scoreLevel": "excellent | good | needs-improvement | poor",
  "keywordScore": 0,
  "formattingScore": 0,
  "completenessScore": 0,
  "impactScore": 0,
  "readabilityScore": 0,
  "matchedKeywords": [
    {
      "keyword": "string",
      "matched": true,
      "importance": "required | preferred | general",
      "occurrencesInResume": 0,
      "occurrencesInJobDescription": 0
    }
  ],
  "missingKeywords": [
    {
      "keyword": "string",
      "matched": false,
      "importance": "required | preferred | general",
      "occurrencesInResume": 0,
      "occurrencesInJobDescription": 0
    }
  ],
  "categoryScores": [
    {
      "category": "keywords",
      "label": "Keyword Match",
      "score": 0,
      "maxScore": 100,
      "percentage": 0,
      "summary": "string"
    }
  ],
  "sectionChecks": [
    {
      "section": "personal-details",
      "label": "Personal Details",
      "present": true,
      "complete": true,
      "score": 0,
      "recommendation": "string"
    }
  ],
  "formattingChecks": [
    {
      "id": "formatting-check-1",
      "title": "string",
      "passed": true,
      "description": "string",
      "recommendation": "string"
    }
  ],
  "strengths": [
    "string"
  ],
  "issues": [
    {
      "id": "issue-1",
      "title": "string",
      "description": "string",
      "severity": "critical | high | medium | low",
      "category": "keywords",
      "recommendation": "string"
    }
  ],
  "recommendations": [
    {
      "id": "recommendation-1",
      "title": "string",
      "description": "string",
      "priority": "critical | high | medium | low",
      "category": "keywords",
      "expectedImpact": "string"
    }
  ],
  "statistics": {
    "totalWords": 0,
    "summaryWordCount": 0,
    "experienceEntries": 0,
    "educationEntries": 0,
    "skillCount": 0,
    "projectCount": 0,
    "certificationCount": 0,
    "quantifiedBulletCount": 0,
    "actionVerbCount": 0
  },
  "summary": "string"
}

Additional output requirements:

- Include all nine category-score categories.
- Include all seven section checks.
- Include at least three formatting checks.
- Return no more than 20 matched keywords.
- Return no more than 20 missing keywords.
- Return no more than 8 strengths.
- Return no more than 10 issues.
- Return no more than 10 recommendations.
- Keep summaries concise and actionable.
- Use stable unique IDs such as "issue-1" and "recommendation-1".
- Avoid duplicate keywords, issues, or recommendations.

RESUME
${formattedResume}

JOB DESCRIPTION
${jobDescription}
`;
}