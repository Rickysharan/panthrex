import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { normalizeInterviewEvaluation } from "@/lib/interview/normalize";
import { buildInterviewEvaluationPrompt } from "@/lib/interview/prompt";
import type {
  InterviewEvaluationError,
  InterviewEvaluationRequest,
  InterviewEvaluationResponse,
} from "@/lib/interview/types";

export const runtime = "nodejs";

const FEATURE_KEY = "interview_evaluate" as const;
const FREE_MONTHLY_LIMIT = 10;
const PREMIUM_MONTHLY_LIMIT = 300;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidRequest(
  value: unknown,
): value is InterviewEvaluationRequest {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.question)) {
    return false;
  }

  return (
    typeof value.role === "string" &&
    value.role.trim().length > 0 &&
    value.role.trim().length <= 200 &&
    typeof value.answer === "string" &&
    value.answer.trim().length > 0 &&
    value.answer.trim().length <= 20_000 &&
    typeof value.question.id === "string" &&
    value.question.id.trim().length > 0 &&
    typeof value.question.question === "string" &&
    value.question.question.trim().length > 0 &&
    value.question.question.trim().length <= 5_000 &&
    (
      value.company === undefined ||
      (
        typeof value.company === "string" &&
        value.company.trim().length <= 200
      )
    ) &&
    (
      value.jobDescription === undefined ||
      (
        typeof value.jobDescription === "string" &&
        value.jobDescription.trim().length <= 30_000
      )
    )
  );
}

function extractJsonObject(
  content: string,
): unknown {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error(
      "The AI returned an empty response.",
    );
  }

  try {
    return JSON.parse(trimmedContent);
  } catch {
    const fencedJsonMatch =
      trimmedContent.match(
        /```(?:json)?\s*([\s\S]*?)```/i,
      );

    if (fencedJsonMatch?.[1]) {
      return JSON.parse(
        fencedJsonMatch[1].trim(),
      );
    }

    const firstBraceIndex =
      trimmedContent.indexOf("{");

    const lastBraceIndex =
      trimmedContent.lastIndexOf("}");

    if (
      firstBraceIndex !== -1 &&
      lastBraceIndex !== -1 &&
      lastBraceIndex > firstBraceIndex
    ) {
      return JSON.parse(
        trimmedContent.slice(
          firstBraceIndex,
          lastBraceIndex + 1,
        ),
      );
    }

    throw new Error(
      "The AI response did not contain valid JSON.",
    );
  }
}

function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse<InterviewEvaluationError> {
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

async function safelyReleaseUsage(): Promise<void> {
  try {
    await releaseFeatureUsage(
      FEATURE_KEY,
      "monthly",
    );
  } catch (error) {
    console.error(
      "Unable to restore Interview Evaluate quota:",
      error,
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    InterviewEvaluationResponse |
      InterviewEvaluationError
  >
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  if (!isValidRequest(body)) {
    return jsonError(
      "A valid question, answer and target role are required.",
      400,
    );
  }

  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Interview evaluation is not configured on the server.",
      503,
    );
  }

  const normalizedRequest: InterviewEvaluationRequest =
    {
      question: body.question,
      answer: body.answer.trim(),
      role: body.role.trim(),
      company:
        body.company?.trim() ||
        undefined,
      jobDescription:
        body.jobDescription?.trim() ||
        undefined,
    };

  let quotaConsumed = false;
  let operationSucceeded = false;

  try {
    const access =
      await requireFeatureAccess({
        featureKey: FEATURE_KEY,
        freeLimit:
          FREE_MONTHLY_LIMIT,
        premiumLimit:
          PREMIUM_MONTHLY_LIMIT,
        periodType: "monthly",
      });

    quotaConsumed = true;

    const prompt =
      buildInterviewEvaluationPrompt(
        normalizedRequest,
      );

    const openai = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const completion =
      await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL ||
          "gpt-4o-mini",
        temperature: 0.3,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert interview evaluator. Return only valid JSON that follows the requested schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const content =
      completion.choices[0]?.message
        ?.content;

    if (!content) {
      return jsonError(
        "The AI did not return an interview evaluation.",
        502,
      );
    }

    const parsedResponse =
      extractJsonObject(content);

    const answerId =
      crypto.randomUUID();

    const evaluation =
      normalizeInterviewEvaluation(
        parsedResponse,
        normalizedRequest.question.id,
        answerId,
      );

    operationSucceeded = true;

    return NextResponse.json(
      {
        success: true,
        evaluation,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Limit": String(
            access.limit,
          ),
          "X-RateLimit-Remaining": String(
            access.usage.remaining,
          ),
        },
      },
    );
  } catch (error) {
    console.error(
      "Interview answer evaluation failed:",
      error,
    );

    if (
      error instanceof
      AuthenticationError
    ) {
      return jsonError(
        "Authentication required. Please sign in before evaluating interview answers.",
        401,
      );
    }

    if (
      error instanceof
      FeatureLimitError
    ) {
      return jsonError(
        "Interview evaluation monthly limit reached. Upgrade your plan or wait until your allowance resets.",
        429,
        {
          "X-RateLimit-Limit":
            String(error.limit),
          "X-RateLimit-Remaining":
            "0",
          "X-RateLimit-Reset":
            error.periodEnd,
        },
      );
    }

    if (
      error instanceof
      FeatureUsageError
    ) {
      return jsonError(
        "Unable to verify your Interview Evaluation allowance. Please try again shortly.",
        503,
      );
    }

    if (
      error instanceof
      OpenAI.APIError
    ) {
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

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return jsonError(
      `Unable to evaluate the interview answer: ${errorMessage}`,
      500,
    );
  } finally {
    if (
      quotaConsumed &&
      !operationSucceeded
    ) {
      await safelyReleaseUsage();
    }
  }
}
