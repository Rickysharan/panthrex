import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { normalizeResumeEnhancementResponse } from "@/lib/ai-resume-enhancer/normalize";
import { buildResumeEnhancementPrompt } from "@/lib/ai-resume-enhancer/prompt";
import { safelyCreateNotification } from "@/lib/notifications/create-notification";
import type {
  ResumeEnhancementApiError,
  ResumeEnhancementRequest,
} from "@/lib/ai-resume-enhancer/types";

export const runtime = "nodejs";

const MODEL = "gpt-4.1-mini";

const FEATURE_KEY = "ai_resume_enhancer" as const;
const FREE_MONTHLY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 100;

function jsonError(
  error: string,
  status: number,
  details?: string,
  headers?: HeadersInit,
) {
  const response: ResumeEnhancementApiError = {
    error,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

async function safelyReleaseUsage(): Promise<void> {
  try {
    await releaseFeatureUsage(FEATURE_KEY, "monthly");
  } catch (error) {
    console.error(
      "Unable to restore AI Resume Enhancer quota.",
      error,
    );
  }
}

export async function POST(request: Request) {
  let body: Partial<ResumeEnhancementRequest>;

  try {
    body =
      (await request.json()) as Partial<ResumeEnhancementRequest>;
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  if (!body.resume) {
    return jsonError(
      "Resume data is required.",
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "AI Resume Enhancer is not configured.",
      503,
      "The server is missing the OPENAI_API_KEY environment variable.",
    );
  }

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

    const prompt = buildResumeEnhancementPrompt(
      body.resume,
      body.targetRole,
      body.jobDescription,
    );

    const openai = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const completion =
      await openai.chat.completions.create({
        model: MODEL,
        temperature: 0.3,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer and ATS optimisation specialist. Return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      return jsonError(
        "The AI did not return an enhancement response.",
        502,
      );
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(content);
    } catch {
      return jsonError(
        "The AI returned an invalid enhancement response.",
        502,
      );
    }

    const normalizedResponse =
      normalizeResumeEnhancementResponse(
        parsedResponse,
      );

    if (
      normalizedResponse.suggestions.length === 0 &&
      normalizedResponse.warnings.length === 0
    ) {
      normalizedResponse.warnings.push(
        "No resume improvements were generated.",
      );
    }

    await safelyCreateNotification({
      userId: access.userId,
      type: "resume_enhancement",
      title: "Resume enhancement completed",
      description:
        "Your AI resume improvement suggestions are ready to review.",
      href: "/resume-enhancer",
      metadata: {
        suggestionCount:
          normalizedResponse.suggestions.length,
        warningCount:
          normalizedResponse.warnings.length,
      },
    });

    operationSucceeded = true;

    return NextResponse.json(normalizedResponse, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": String(usageLimit),
        "X-RateLimit-Remaining": String(
          usageRemaining,
        ),
      },
    });
  } catch (error) {
    console.error(
      "Unable to enhance the resume.",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required.",
        401,
        "Please sign in before using AI Resume Enhancer.",
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "AI Resume Enhancer monthly limit reached.",
        429,
        "Upgrade your plan or wait until your monthly allowance resets.",
        {
          "X-RateLimit-Limit": String(error.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": error.periodEnd,
        },
      );
    }

    if (error instanceof FeatureUsageError) {
      return jsonError(
        "Unable to verify your feature allowance.",
        503,
        "Please try again shortly.",
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
          "The AI service is temporarily rate limited.",
          429,
          "Please try again shortly.",
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
      "The resume could not be enhanced.",
      500,
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
    );
  } finally {
    if (quotaConsumed && !operationSucceeded) {
      await safelyReleaseUsage();
    }
  }
}
