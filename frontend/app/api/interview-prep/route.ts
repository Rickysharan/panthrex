import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  normalizeInterviewFeedback,
  normalizeInterviewQuestions,
} from "@/lib/interview-prep/normalize";
import {
  buildInterviewAnswerEvaluationPrompt,
  buildInterviewQuestionsPrompt,
} from "@/lib/interview-prep/prompts";
import type {
  EvaluateInterviewAnswerRequest,
  GenerateInterviewRequest,
  InterviewPrepError,
} from "@/lib/interview-prep/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type InterviewPrepAction =
  | "generate-questions"
  | "evaluate-answer";

type InterviewPrepRequestBody = {
  action?: InterviewPrepAction;
  payload?: unknown;
};

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<InterviewPrepError>(
        {
          success: false,
          error:
            "OPENAI_API_KEY is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      (await request.json()) as InterviewPrepRequestBody;

    if (body.action === "generate-questions") {
      return generateQuestions(body.payload);
    }

    if (body.action === "evaluate-answer") {
      return evaluateAnswer(body.payload);
    }

    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "Invalid interview-preparation action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Interview preparation API error:",
      error,
    );

    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected interview-preparation error occurred.",
      },
      {
        status: 500,
      },
    );
  }
}

async function generateQuestions(
  payload: unknown,
): Promise<NextResponse> {
  const input = validateGenerateRequest(payload);

  if (!input) {
    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "Invalid interview question generation request.",
      },
      {
        status: 400,
      },
    );
  }

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview coach. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            buildInterviewQuestionsPrompt(input),
        },
      ],
    });

  const content =
    completion.choices[0]?.message.content;

  if (!content) {
    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "The AI did not return interview questions.",
      },
      {
        status: 502,
      },
    );
  }

  const parsed = parseJsonObject(content);
  const questions = normalizeInterviewQuestions(
    parsed.questions,
    input.difficulty,
  ).slice(0, input.questionCount);

  if (questions.length === 0) {
    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "The AI response did not contain valid interview questions.",
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json({
    success: true,
    questions,
  });
}

async function evaluateAnswer(
  payload: unknown,
): Promise<NextResponse> {
  const input = validateEvaluationRequest(payload);

  if (!input) {
    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "Invalid interview answer evaluation request.",
      },
      {
        status: 400,
      },
    );
  }

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview evaluator. Return valid JSON only.",
        },
        {
          role: "user",
          content:
            buildInterviewAnswerEvaluationPrompt(
              input,
            ),
        },
      ],
    });

  const content =
    completion.choices[0]?.message.content;

  if (!content) {
    return NextResponse.json<InterviewPrepError>(
      {
        success: false,
        error:
          "The AI did not return interview feedback.",
      },
      {
        status: 502,
      },
    );
  }

  const parsed = parseJsonObject(content);
  const feedback =
    normalizeInterviewFeedback(
      parsed.feedback,
    );

  return NextResponse.json({
    success: true,
    feedback,
  });
}

function validateGenerateRequest(
  payload: unknown,
): GenerateInterviewRequest | null {
  const record = asRecord(payload);

  if (!record) {
    return null;
  }

  const role = normalizeString(record.role);
  const company = normalizeString(
    record.company,
  );
  const jobDescription = normalizeString(
    record.jobDescription,
  );
  const difficulty = record.difficulty;
  const questionCount = Number(
    record.questionCount,
  );

  if (!role) {
    return null;
  }

  if (
    difficulty !== "beginner" &&
    difficulty !== "intermediate" &&
    difficulty !== "advanced"
  ) {
    return null;
  }

  if (
    !Number.isInteger(questionCount) ||
    questionCount < 3 ||
    questionCount > 20
  ) {
    return null;
  }

  return {
    role,
    company,
    jobDescription,
    difficulty,
    questionCount,
    resume: record.resume ?? {},
  };
}

function validateEvaluationRequest(
  payload: unknown,
): EvaluateInterviewAnswerRequest | null {
  const record = asRecord(payload);

  if (!record) {
    return null;
  }

  const questionRecord = asRecord(
    record.question,
  );

  if (!questionRecord) {
    return null;
  }

  const id = normalizeString(
    questionRecord.id,
  );
  const question = normalizeString(
    questionRecord.question,
  );
  const competency = normalizeString(
    questionRecord.competency,
  );
  const guidance = normalizeString(
    questionRecord.guidance,
  );
  const answer = normalizeString(
    record.answer,
  );
  const role = normalizeString(record.role);
  const jobDescription = normalizeString(
    record.jobDescription,
  );

  const type = questionRecord.type;
  const difficulty =
    questionRecord.difficulty;

  if (
    !id ||
    !question ||
    !answer ||
    !role ||
    !competency ||
    !guidance
  ) {
    return null;
  }

  if (
    type !== "behavioural" &&
    type !== "technical" &&
    type !== "situational" &&
    type !== "role-specific"
  ) {
    return null;
  }

  if (
    difficulty !== "beginner" &&
    difficulty !== "intermediate" &&
    difficulty !== "advanced"
  ) {
    return null;
  }

  return {
    question: {
      id,
      question,
      type,
      difficulty,
      competency,
      guidance,
    },
    answer,
    role,
    jobDescription,
  };
}

function parseJsonObject(
  content: string,
): Record<string, unknown> {
  const parsed: unknown = JSON.parse(content);
  const record = asRecord(parsed);

  if (!record) {
    throw new Error(
      "The AI response was not a valid JSON object.",
    );
  }

  return record;
}

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}