import type {
  CoverLetterLength,
  CoverLetterRequest,
  CoverLetterTone,
} from "./types";

const TONE_INSTRUCTIONS: Record<CoverLetterTone, string> = {
  professional:
    "Use a polished, formal and credible professional tone.",
  confident:
    "Use a confident and persuasive tone without sounding arrogant.",
  concise:
    "Use a direct, efficient tone with minimal repetition.",
  enthusiastic:
    "Use an energetic and genuinely enthusiastic tone while remaining professional.",
  technical:
    "Use a technically precise tone that highlights relevant tools, systems, methods and measurable impact.",
};

const LENGTH_INSTRUCTIONS: Record<CoverLetterLength, string> = {
  short:
    "Keep the letter between 180 and 250 words.",
  standard:
    "Keep the letter between 300 and 400 words.",
  detailed:
    "Keep the letter between 450 and 600 words.",
};

function formatResume(request: CoverLetterRequest): string {
  const { resume } = request;

  const workExperience = resume.workExperience
    .map(
      (experience, index) => `
Work Experience ${index + 1}
Position: ${experience.position}
Company: ${experience.company}
Location: ${experience.location}
Start Date: ${experience.startDate}
End Date: ${experience.isCurrent ? "Present" : experience.endDate}
Description: ${experience.description}
`,
    )
    .join("\n");

  const education = resume.education
    .map(
      (item, index) => `
Education ${index + 1}
Institution: ${item.institution}
Qualification: ${item.qualification}
Field of Study: ${item.fieldOfStudy}
Location: ${item.location}
Start Date: ${item.startDate}
End Date: ${item.endDate}
Description: ${item.description}
`,
    )
    .join("\n");

  const projects = resume.projects
    .map(
      (project, index) => `
Project ${index + 1}
Name: ${project.name}
Role: ${project.role}
Start Date: ${project.startDate}
End Date: ${project.endDate}
URL: ${project.projectUrl}
Description: ${project.description}
`,
    )
    .join("\n");

  const certifications = resume.certifications
    .map(
      (certification, index) => `
Certification ${index + 1}
Name: ${certification.name}
Issuer: ${certification.issuer}
Issue Date: ${certification.issueDate}
Credential ID: ${certification.credentialId}
Credential URL: ${certification.credentialUrl}
`,
    )
    .join("\n");

  return `
Candidate Name: ${resume.personalDetails.fullName}
Current Job Title: ${resume.personalDetails.jobTitle}
Location: ${resume.personalDetails.location}
Email: ${resume.personalDetails.email}
Phone: ${resume.personalDetails.phone}
Website: ${resume.personalDetails.website}
LinkedIn: ${resume.personalDetails.linkedin}
GitHub: ${resume.personalDetails.github}

Professional Summary:
${resume.personalDetails.professionalSummary}

Skills:
${resume.skills.join(", ")}

Work Experience:
${workExperience || "No work experience provided."}

Education:
${education || "No education provided."}

Projects:
${projects || "No projects provided."}

Certifications:
${certifications || "No certifications provided."}
`;
}

export function buildCoverLetterPrompt(
  request: CoverLetterRequest,
): string {
  const hiringManager = request.hiringManagerName?.trim()
    ? request.hiringManagerName.trim()
    : "Hiring Manager";

  const additionalContext = request.additionalContext?.trim()
    ? request.additionalContext.trim()
    : "No additional context provided.";

  return `
You are an expert UK career consultant and professional cover letter writer.

Write a tailored cover letter for the candidate using the resume and job information below.

Writing requirements:
- Address the letter to "${hiringManager}".
- Target the role "${request.jobTitle}" at "${request.companyName}".
- ${TONE_INSTRUCTIONS[request.tone]}
- ${LENGTH_INSTRUCTIONS[request.length]}
- Use UK English spelling and conventions.
- Make the letter specific to the supplied job description.
- Connect the candidate's strongest relevant experience, projects, education and skills to the employer's requirements.
- Highlight measurable outcomes only when they are explicitly present in the resume.
- Do not invent qualifications, responsibilities, employers, achievements, technologies or metrics.
- Avoid generic clichés and excessive flattery.
- Avoid repeating the resume word-for-word.
- Do not use bullet points.
- Do not include markdown.
- Do not include a subject line.
- Do not include placeholders such as "[Your Name]".
- End with an appropriate professional closing.
- Return only the finished cover letter text.

Company:
${request.companyName}

Target Job Title:
${request.jobTitle}

Hiring Manager:
${hiringManager}

Job Description:
${request.jobDescription}

Additional Context:
${additionalContext}

Candidate Resume:
${formatResume(request)}
`.trim();
}