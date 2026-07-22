import type {
  InterviewEvaluationRequest,
  InterviewGenerationRequest,
} from "@/lib/interview/types";

function formatSkills(skills?: string[]): string {
  if (!skills || skills.length === 0) {
    return "No specific skills were provided.";
  }

  return skills
    .map((skill, index) => `${index + 1}. ${skill.trim()}`)
    .join("\n");
}

function formatOptionalValue(value?: string): string {
  const normalizedValue = value?.trim();

  return normalizedValue || "Not provided.";
}

export function buildInterviewGenerationPrompt(
  request: InterviewGenerationRequest,
): string {
  const {
    role,
    company,
    jobDescription,
    category,
    difficulty,
    questionCount,
    skills,
  } = request;

  return `
You are an expert interview coach and hiring specialist.

Generate exactly ${questionCount} realistic interview questions for the candidate.

CANDIDATE TARGET
Role: ${role.trim()}
Company: ${formatOptionalValue(company)}
Interview category: ${category}
Difficulty: ${difficulty}

JOB DESCRIPTION
${formatOptionalValue(jobDescription)}

IMPORTANT SKILLS
${formatSkills(skills)}

REQUIREMENTS
1. Generate exactly ${questionCount} questions.
2. Tailor every question to the role, company, job description and skills where available.
3. Avoid duplicate or overly similar questions.
4. Use realistic wording that an interviewer would use.
5. Match the requested category and difficulty.
6. Include a mix of direct, analytical and practical questions when appropriate.
7. For behavioral questions, encourage STAR-structured answers.
8. For technical questions, test practical understanding rather than trivia.
9. Do not include markdown.
10. Do not include explanations outside the JSON response.

Return valid JSON using exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "type": "short-answer",
      "expectedSkills": ["Skill 1", "Skill 2"],
      "guidance": "Brief guidance for answering",
      "sampleAnswer": "Optional concise sample answer"
    }
  ]
}

Allowed type values:
- short-answer
- long-answer
- coding
- system-design
- star

Use "star" for behavioral questions where appropriate.
Use "coding" only when the question genuinely requires code.
Use "system-design" only for architecture or design questions.
`.trim();
}

export function buildInterviewEvaluationPrompt(
  request: InterviewEvaluationRequest,
): string {
  const {
    question,
    answer,
    role,
    company,
    jobDescription,
  } = request;

  return `
You are an expert interview evaluator and hiring manager.

Evaluate the candidate's answer fairly and constructively.

TARGET ROLE
Role: ${role.trim()}
Company: ${formatOptionalValue(company)}

JOB DESCRIPTION
${formatOptionalValue(jobDescription)}

INTERVIEW QUESTION
${question.question}

QUESTION CATEGORY
${question.category}

QUESTION DIFFICULTY
${question.difficulty}

QUESTION TYPE
${question.type}

EXPECTED SKILLS
${formatSkills(question.expectedSkills)}

QUESTION GUIDANCE
${formatOptionalValue(question.guidance)}

CANDIDATE ANSWER
${answer.trim()}

EVALUATION RULES
1. Score the answer from 0 to 100.
2. Use evidence from the candidate's answer.
3. Be constructive, specific and concise.
4. Do not invent experience or achievements not mentioned by the candidate.
5. Evaluate clarity, relevance, structure and confidence separately.
6. Include technical accuracy only when the question is technical.
7. Strengths, weaknesses and improvements must contain actionable points.
8. Suggested answer must improve the candidate's answer without falsely adding facts.
9. Do not include markdown.
10. Do not include text outside the JSON response.

Rating rules:
- 0 to 39: poor
- 40 to 54: needs-improvement
- 55 to 69: good
- 70 to 84: very-good
- 85 to 100: excellent

Return valid JSON using exactly this structure:

{
  "score": 75,
  "rating": "very-good",
  "strengths": [
    "Specific strength"
  ],
  "weaknesses": [
    "Specific weakness"
  ],
  "improvements": [
    "Actionable improvement"
  ],
  "suggestedAnswer": "Improved answer based only on the candidate's provided information",
  "clarityScore": 75,
  "relevanceScore": 75,
  "structureScore": 75,
  "confidenceScore": 75,
  "technicalAccuracyScore": 75
}

Omit "technicalAccuracyScore" when the question is not technical.
`.trim();
}
