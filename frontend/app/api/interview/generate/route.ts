import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";

import { normalizeInterviewQuestions } from "@/lib/interview/normalize";
import { buildInterviewGenerationPrompt } from "@/lib/interview/prompt";

import type {
  InterviewGenerationError,
  InterviewGenerationRequest,
  InterviewGenerationResponse,
} from "@/lib/interview/types";

export const runtime = "nodejs";

const FEATURE_KEY = "interview_generate" as const;
const FREE_MONTHLY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 150;

function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse<InterviewGenerationError> {
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

async function safelyReleaseUsage() {
  try {
    await releaseFeatureUsage(
      FEATURE_KEY,
      "monthly",
    );
  } catch (error) {
    console.error(
      "Unable to restore Interview Generate quota.",
      error,
    );
  }
}

function isValidRequest(
  value: unknown,
): value is InterviewGenerationRequest {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const request =
    value as Partial<InterviewGenerationRequest>;

  return (
    typeof request.role === "string" &&
    request.role.trim().length > 0 &&
    request.role.trim().length <= 200 &&
    typeof request.category === "string" &&
    typeof request.difficulty === "string" &&
    typeof request.questionCount === "number" &&
    Number.isInteger(request.questionCount) &&
    request.questionCount > 0 &&
    request.questionCount <= 20
  );
}

function extractJsonObject(
  content: string,
): unknown {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error(
      "The AI returned an empty response.",
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced =
      trimmed.match(
        /```(?:json)?\s*([\s\S]*?)```/i,
      );

    if (fenced?.[1]) {
      return JSON.parse(
        fenced[1].trim(),
      );
    }

    const first =
      trimmed.indexOf("{");

    const last =
      trimmed.lastIndexOf("}");

    if (
      first !== -1 &&
      last !== -1 &&
      last > first
    ) {
      return JSON.parse(
        trimmed.slice(first, last + 1),
      );
    }

    throw new Error(
      "The AI response did not contain valid JSON.",
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    InterviewGenerationResponse |
      InterviewGenerationError
  >
> {
  let quotaConsumed = false;
  let operationSucceeded = false;

  try {
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
        "A role, category, difficulty and valid question count are required.",
        400,
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return jsonError(
        "Interview generation is not configured.",
        503,
      );
    }

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

    const normalizedRequest: InterviewGenerationRequest =
      {
        role: body.role.trim(),
        company:
          body.company?.trim() ||
          undefined,
        jobDescription:
          body.jobDescription?.trim() ||
          undefined,
        category: body.category,
        difficulty:
          body.difficulty,
        questionCount:
          body.questionCount,
        skills: Array.isArray(
          body.skills,
        )
          ? body.skills
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      };

    const prompt =
      buildInterviewGenerationPrompt(
        normalizedRequest,
      );

    const openai = new OpenAI({
      apiKey:
        process.env.OPENAI_API_KEY,
      timeout: 45000,
      maxRetries: 2,
    });

    const completion =
      await openai.chat.completions.create(
        {
          model:
            process.env
              .OPENAI_MODEL ??
            "gpt-4o-mini",
          temperature: 0.7,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You are an expert interview coach. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
      );

    const content =
      completion.choices[0]
        ?.message?.content;

    if (!content) {
      return jsonError(
        "The AI did not return any interview questions.",
        502,
      );
    }

    const parsed =
      extractJsonObject(content);

    const result =
      normalizeInterviewQuestions(
        parsed,
      );

    if (
      result.questions.length === 0
    ) {
      return jsonError(
        "The AI response did not contain usable interview questions.",
        502,
      );
    }

    operationSucceeded = true;

    return NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control":
            "no-store",
          "X-RateLimit-Limit":
            String(access.limit),
          "X-RateLimit-Remaining":
            String(
              access.usage.remaining,
            ),
        },
      },
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof
      AuthenticationError
    ) {
      return jsonError(
        "Authentication required.",
        401,
      );
    }

    if (
      error instanceof
      FeatureLimitError
    ) {
      return jsonError(
        "Interview generation monthly limit reached.",
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
        "Unable to verify feature usage.",
        503,
      );
    }

    if (
      error instanceof
      OpenAI.APIError
    ) {
      return jsonError(
        "OpenAI service temporarily unavailable.",
        502,
      );
    }

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unexpected error.",
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
