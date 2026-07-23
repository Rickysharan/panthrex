import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { normalizeAtsScoreResult } from "@/lib/ats-score/normalize";
import { buildAtsScorePrompt } from "@/lib/ats-score/prompt";
import type {
  AtsScoreError,
  AtsScoreRequest,
  AtsScoreResponse,
} from "@/lib/ats-score/types";
import type { ResumeData } from "@/lib/resume/types";

export const runtime = "nodejs";

const FEATURE_KEY = "ats_scan" as const;
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

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string",
    )
  );
}

function isResumeData(
  value: unknown,
): value is ResumeData {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.personalDetails)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.template === "string" &&
    Array.isArray(value.workExperience) &&
    Array.isArray(value.education) &&
    isStringArray(value.skills) &&
    Array.isArray(value.projects) &&
    Array.isArray(value.certifications) &&
    typeof value.personalDetails.fullName ===
      "string" &&
    typeof value.personalDetails.jobTitle ===
      "string" &&
    typeof value.personalDetails.email ===
      "string" &&
    typeof value.personalDetails.phone ===
      "string" &&
    typeof value.personalDetails.location ===
      "string" &&
    typeof value.personalDetails.website ===
      "string" &&
    typeof value.personalDetails.linkedin ===
      "string" &&
    typeof value.personalDetails.github ===
      "string" &&
    typeof value.personalDetails
      .professionalSummary === "string"
  );
}

function isValidRequest(
  value: unknown,
): value is AtsScoreRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isResumeData(value.resume) &&
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
): NextResponse<AtsScoreError> {
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
      "Unable to restore ATS Score quota.",
      error,
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    AtsScoreResponse | AtsScoreError
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
      "A valid resume and a job description of at least 50 characters are required.",
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "ATS Score is not configured on the server.",
      503,
    );
  }

  const normalizedRequest: AtsScoreRequest = {
    resume: body.resume,
    jobDescription:
      body.jobDescription.trim(),
  };

  let quotaConsumed = false;
  let operationSucceeded = false;
  let usageLimit = FREE_MONTHLY_LIMIT;
  let usageRemaining = 0;

  try {
    const access = await requireFeatureAccess({
      featureKey: FEATURE_KEY,
      freeLimit: FREE_MONTHLY_LIMIT,
      premiumLimit: PREMIUM_MONTHLY_LIMIT,
      periodType: "monthly",
    });

    quotaConsumed = true;
    usageLimit = access.limit;
    usageRemaining = access.usage.remaining;

    const prompt =
      buildAtsScorePrompt(
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
        temperature: 0.1,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert Applicant Tracking System analyst and technical recruiter. Return only valid JSON that follows the requested schema. Never invent resume qualifications or experience.",
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
        "The AI did not return an ATS analysis.",
        502,
      );
    }

    const parsedResponse =
      extractJsonObject(content);

    const result =
      normalizeAtsScoreResult(
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
            usageLimit,
          ),
          "X-RateLimit-Remaining": String(
            usageRemaining,
          ),
        },
      },
    );
  } catch (error) {
    console.error(
      "ATS resume analysis failed:",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required. Please sign in before running an ATS scan.",
        401,
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "ATS Score monthly limit reached. Upgrade your plan or wait until your allowance resets.",
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
        "Unable to verify your ATS Score allowance. Please try again shortly.",
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

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return jsonError(
      `Unable to analyse the resume: ${errorMessage}`,
      500,
    );
  } finally {
    if (quotaConsumed && !operationSucceeded) {
      await safelyReleaseUsage();
    }
  }
}
