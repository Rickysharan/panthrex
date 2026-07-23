import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
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

export const runtime = "nodejs";

const FEATURE_KEY = "interview_prep" as const;
const FREE_MONTHLY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 150;

type InterviewPrepAction =
  | "generate-questions"
  | "evaluate-answer";

type InterviewPrepRequestBody = {
  action?: InterviewPrepAction;
  payload?: unknown;
};

type UsageContext = {
  limit: number;
  remaining: number;
};

function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse<InterviewPrepError> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...headers,
      },
    },
  );
}

function jsonSuccess(
  body: Record<string, unknown>,
  usage: UsageContext,
): NextResponse {
  return NextResponse.json(
    body,
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": String(
          usage.limit,
        ),
        "X-RateLimit-Remaining": String(
          usage.remaining,
        ),
      },
    },
  );
}

async function safelyReleaseUsage(): Promise<void> {
  try {
    await releaseFeatureUsage(
      FEATURE_KEY,
      "monthly",
    );
  } catch (error) {
    console.error(
      "Unable to restore Interview Prep quota:",
      error,
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  let body: InterviewPrepRequestBody;

  try {
    body =
      (await request.json()) as InterviewPrepRequestBody;
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  if (
    body.action !== "generate-questions" &&
    body.action !== "evaluate-answer"
  ) {
    return jsonError(
      "Invalid interview-preparation action.",
      400,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonError(
      "Interview preparation is not configured on the server.",
      503,
    );
  }

  let quotaConsumed = false;
  let operationSucceeded = false;

  try {
    const access = await requireFeatureAccess({
      featureKey: FEATURE_KEY,
      freeLimit: FREE_MONTHLY_LIMIT,
      premiumLimit: PREMIUM_MONTHLY_LIMIT,
      periodType: "monthly",
    });

    quotaConsumed = true;

    const usage: UsageContext = {
      limit: access.limit,
      remaining: access.usage.remaining,
    };

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 45_000,
      maxRetries: 2,
    });

    let response: NextResponse;

    if (body.action === "generate-questions") {
      response = await generateQuestions(
        openai,
        body.payload,
        usage,
      );
    } else {
      response = await evaluateAnswer(
        openai,
        body.payload,
        usage,
      );
    }

    if (response.status >= 200 && response.status < 300) {
      operationSucceeded = true;
    }

    return response;
  } catch (error) {
    console.error(
      "Interview preparation API error:",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required. Please sign in before using Interview Prep.",
        401,
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "Interview Prep monthly limit reached. Upgrade your plan or wait until your allowance resets.",
        429,
        {
          "X-RateLimit-Limit": String(
            error.limit,
          ),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset":
            error.periodEnd,
        },
      );
    }

    if (error instanceof FeatureUsageError) {
      return jsonError(
        "Unable to verify your Interview Prep allowance. Please try again shortly.",
        503,
      );
    }

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return jsonError(
          "The AI service rejected the configured API key.",
          503,
        );
      }

      if (error.status === 429) {
        return jsonError(
          "The AI service is temporarily rate limited. Please try again shortly.",
          429,
        );
      }

      if (
        error.status !== undefined &&
        error.status >= 500
      ) {
        return jsonError(
          "The AI service is temporarily unavailable.",
          502,
        );
      }
    }

    return jsonError(
      error instanceof Error
        ? error.message
        : "An unexpected interview-preparation error occurred.",
      500,
    );
  } finally {
    if (quotaConsumed && !operationSucceeded) {
      await safelyReleaseUsage();
    }
  }
}

async function generateQuestions(
  openai: OpenAI,
  payload: unknown,
  usage: UsageContext,
): Promise<NextResponse> {
  const input = validateGenerateRequest(payload);

  if (!input) {
    return jsonError(
      "Invalid interview question generation request.",
      400,
    );
  }

  const completion =
    await openai.chat.completions.create({
      model:
        process.env.OPENAI_MODEL ||
        "gpt-4o-mini",
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
    return jsonError(
      "The AI did not return interview questions.",
      502,
    );
  }

  const parsed = parseJsonObject(content);

  const questions =
    normalizeInterviewQuestions(
      parsed.questions,
      input.difficulty,
    ).slice(0, input.questionCount);

  if (questions.length === 0) {
    return jsonError(
      "The AI response did not contain valid interview questions.",
      502,
    );
  }

  return jsonSuccess(
    {
      success: true,
      questions,
    },
    usage,
  );
}

async function evaluateAnswer(
  openai: OpenAI,
  payload: unknown,
  usage: UsageContext,
): Promise<NextResponse> {
  const input = validateEvaluationRequest(payload);

  if (!input) {
    return jsonError(
      "Invalid interview answer evaluation request.",
      400,
    );
  }

  const completion =
    await openai.chat.completions.create({
      model:
        process.env.OPENAI_MODEL ||
        "gpt-4o-mini",
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
    return jsonError(
      "The AI did not return interview feedback.",
      502,
    );
  }

  const parsed = parseJsonObject(content);

  const feedback =
    normalizeInterviewFeedback(
      parsed.feedback,
    );

  return jsonSuccess(
    {
      success: true,
      feedback,
    },
    usage,
  );
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

  if (
    !role ||
    role.length > 200 ||
    company.length > 200 ||
    jobDescription.length > 30_000
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
    question.length > 5_000 ||
    answer.length > 20_000 ||
    role.length > 200 ||
    competency.length > 1_000 ||
    guidance.length > 5_000 ||
    jobDescription.length > 30_000
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
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error(
      "The AI returned an empty response.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmedContent);
  } catch {
    const fencedJsonMatch =
      trimmedContent.match(
        /```(?:json)?\s*([\s\S]*?)```/i,
      );

    if (fencedJsonMatch?.[1]) {
      parsed = JSON.parse(
        fencedJsonMatch[1].trim(),
      );
    } else {
      const firstBraceIndex =
        trimmedContent.indexOf("{");

      const lastBraceIndex =
        trimmedContent.lastIndexOf("}");

      if (
        firstBraceIndex === -1 ||
        lastBraceIndex === -1 ||
        lastBraceIndex <= firstBraceIndex
      ) {
        throw new Error(
          "The AI response did not contain valid JSON.",
        );
      }

      parsed = JSON.parse(
        trimmedContent.slice(
          firstBraceIndex,
          lastBraceIndex + 1,
        ),
      );
    }
  }

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
