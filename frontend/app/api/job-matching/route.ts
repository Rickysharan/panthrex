import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { normalizeJobMatchResult } from "@/lib/job-matching/normalize";
import { buildJobMatchingPrompt } from "@/lib/job-matching/prompt";
import type {
  JobMatchError,
  JobMatchRequest,
  JobMatchResponse,
} from "@/lib/job-matching/types";

export const runtime = "nodejs";

const FEATURE_KEY = "job_matching" as const;
const FREE_MONTHLY_LIMIT = 3;
const PREMIUM_MONTHLY_LIMIT = 100;

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
): value is JobMatchRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.resume !== null &&
    value.resume !== undefined &&
    typeof value.jobDescription === "string" &&
    value.jobDescription.trim().length >= 50 &&
    value.jobDescription.trim().length <= 30_000
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
): NextResponse<JobMatchError> {
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
      "Unable to restore Job Matching quota:",
      error,
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<JobMatchResponse | JobMatchError>
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
      "A resume and a job description of at least 50 characters are required.",
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Job Matching is not configured on the server.",
      503,
    );
  }

  const normalizedRequest: JobMatchRequest = {
    resume: body.resume,
    jobDescription:
      body.jobDescription.trim(),
  };

  let quotaConsumed = false;
  let operationSucceeded = false;

  try {
    const access =
      await requireFeatureAccess({
        featureKey: FEATURE_KEY,
        freeLimit: FREE_MONTHLY_LIMIT,
        premiumLimit:
          PREMIUM_MONTHLY_LIMIT,
        periodType: "monthly",
      });

    quotaConsumed = true;

    const prompt =
      buildJobMatchingPrompt(
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
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert ATS analyst and recruiter. Return only valid JSON that follows the requested schema. Base every conclusion only on the supplied resume and job description.",
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
        "The AI did not return a job-match analysis.",
        502,
      );
    }

    const parsedResponse =
      extractJsonObject(content);

    const result =
      normalizeJobMatchResult(
        parsedResponse,
      );

    operationSucceeded = true;

    return NextResponse.json(
      {
        success: true,
        result,
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
      "Job matching analysis failed:",
      error,
    );

    if (
      error instanceof
      AuthenticationError
    ) {
      return jsonError(
        "Authentication required. Please sign in before using Job Matching.",
        401,
      );
    }

    if (
      error instanceof
      FeatureLimitError
    ) {
      return jsonError(
        "Job Matching monthly limit reached. Upgrade your plan or wait until your allowance resets.",
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
        "Unable to verify your Job Matching allowance. Please try again shortly.",
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
      `Unable to analyse the job match: ${errorMessage}`,
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
