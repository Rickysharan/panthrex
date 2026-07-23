import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { normalizeCoverLetterResponse } from "@/lib/ai-cover-letter/normalize";
import { buildCoverLetterPrompt } from "@/lib/ai-cover-letter/prompt";
import type {
  CoverLetterApiError,
  CoverLetterRequest,
} from "@/lib/ai-cover-letter/types";

export const runtime = "nodejs";

const MODEL =
  process.env.OPENAI_COVER_LETTER_MODEL ||
  "gpt-4.1-mini";

const FEATURE_KEY = "cover_letter" as const;
const FREE_MONTHLY_LIMIT = 3;
const PREMIUM_MONTHLY_LIMIT = 100;

function isValidRequest(
  value: unknown,
): value is CoverLetterRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request =
    value as Partial<CoverLetterRequest>;

  return Boolean(
    request.resume &&
      typeof request.companyName === "string" &&
      request.companyName.trim() &&
      typeof request.jobTitle === "string" &&
      request.jobTitle.trim() &&
      typeof request.jobDescription === "string" &&
      request.jobDescription.trim() &&
      typeof request.tone === "string" &&
      typeof request.length === "string",
  );
}

function jsonError(
  error: string,
  status: number,
  details?: string,
  headers?: HeadersInit,
) {
  const response: CoverLetterApiError = {
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
    await releaseFeatureUsage(
      FEATURE_KEY,
      "monthly",
    );
  } catch (error) {
    console.error(
      "Unable to restore Cover Letter quota.",
      error,
    );
  }
}

export async function POST(
  request: NextRequest,
) {
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
      "Invalid cover letter request.",
      400,
      "Company name, job title, job description, tone, length and resume data are required.",
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Cover Letter Generator is not configured.",
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

    const prompt = buildCoverLetterPrompt(body);

    const client = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const completion =
      await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You write accurate, tailored and professional UK cover letters. Never invent candidate information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const rawContent =
      completion.choices[0]?.message?.content;

    const result =
      normalizeCoverLetterResponse({
        rawContent,
        companyName: body.companyName,
        hiringManagerName:
          body.hiringManagerName,
        jobTitle: body.jobTitle,
        tone: body.tone,
        length: body.length,
      });

    if (
      !result.coverLetter.content ||
      !result.coverLetter.content.trim()
    ) {
      return jsonError(
        "The AI did not return a cover letter.",
        502,
      );
    }

    operationSucceeded = true;

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit":
          String(usageLimit),
        "X-RateLimit-Remaining":
          String(usageRemaining),
      },
    });
  } catch (error) {
    console.error(
      "AI cover letter generation failed:",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required.",
        401,
        "Please sign in before generating a cover letter.",
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "Cover Letter monthly limit reached.",
        429,
        "Upgrade your plan or wait until your monthly allowance resets.",
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
      "Failed to generate the cover letter.",
      500,
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred.",
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
