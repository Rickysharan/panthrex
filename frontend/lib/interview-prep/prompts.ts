import type {
  EvaluateInterviewAnswerRequest,
  GenerateInterviewRequest,
} from "@/lib/interview-prep/types";

export function buildInterviewQuestionsPrompt({
  role,
  company,
  jobDescription,
  difficulty,
  questionCount,
  resume,
}: GenerateInterviewRequest): string {
  return `
You are an expert interview coach and technical recruiter.

Generate exactly ${questionCount} tailored interview questions for the candidate.

Target role:
${role}

Company:
${company?.trim() || "Not specified"}

Difficulty:
${difficulty}

Job description:
${jobDescription?.trim() || "Not provided"}

Candidate resume:
${JSON.stringify(resume, null, 2)}

Requirements:
- Tailor the questions to the role, job description, and candidate resume.
- Include a balanced mix of behavioural, technical, situational, and role-specific questions.
- Focus on competencies that are genuinely relevant to the vacancy.
- Avoid duplicate or near-duplicate questions.
- Do not ask questions about protected personal characteristics.
- Technical questions should assess reasoning and practical knowledge.
- Behavioural questions should encourage STAR-structured answers.
- Guidance must explain what a strong answer should cover without writing the full answer.
- Difficulty must be one of: beginner, intermediate, advanced.
- Type must be one of: behavioural, technical, situational, role-specific.
- Return valid JSON only.
- Do not include markdown or explanatory text.

Return this exact JSON structure:

{
  "questions": [
    {
      "id": "question-1",
      "question": "Question text",
      "type": "behavioural",
      "difficulty": "${difficulty}",
      "competency": "Competency being assessed",
      "guidance": "What a strong answer should address"
    }
  ]
}
`.trim();
}

export function buildInterviewAnswerEvaluationPrompt({
  question,
  answer,
  role,
  jobDescription,
}: EvaluateInterviewAnswerRequest): string {
  return `
You are an expert interview coach evaluating a candidate's interview response.

Target role:
${role}

Job description:
${jobDescription?.trim() || "Not provided"}

Interview question:
${question.question}

Question type:
${question.type}

Difficulty:
${question.difficulty}

Competency:
${question.competency}

Candidate answer:
${answer}

Evaluate the answer fairly and constructively.

Requirements:
- Score the response from 0 to 100.
- Consider relevance, clarity, evidence, structure, technical accuracy, and role alignment.
- For behavioural answers, assess whether the response follows the STAR framework.
- For technical answers, assess correctness, reasoning, trade-offs, and practical application.
- Do not invent experience that the candidate did not mention.
- Strengths must identify what was done well.
- Improvements must be specific and actionable.
- The suggested answer must be a stronger example response that remains plausible.
- The summary must be concise and recruiter-focused.
- Return valid JSON only.
- Do not include markdown or explanatory text.

Return this exact JSON structure:

{
  "feedback": {
    "score": 75,
    "strengths": [
      "Specific strength"
    ],
    "improvements": [
      "Specific improvement"
    ],
    "suggestedAnswer": "Improved example answer",
    "summary": "Concise evaluation summary"
  }
}
`.trim();
}