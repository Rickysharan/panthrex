import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";

import { normalizeResumeTailorAnalysis } from "@/lib/resume-tailor/normalize";
import { buildResumeTailorPrompt } from "@/lib/resume-tailor/prompts";

import type {
  ResumeTailorError,
  TailorResumeRequest,
  TailorResumeResponse,
} from "@/lib/resume-tailor/types";

export const runtime = "nodejs";

const FEATURE_KEY = "resume_tailor" as const;
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
): value is TailorResumeRequest {
  if (!isRecord(value)) {
    return false;
  }

  const companyValid =
    value.company === undefined ||
    (typeof value.company === "string" &&
      value.company.trim().length <= 200);

  return (
    typeof value.targetRole === "string" &&
    value.targetRole.trim().length >= 2 &&
    value.targetRole.trim().length <= 200 &&
    companyValid &&
    typeof value.jobDescription === "string" &&
    value.jobDescription.trim().length >= 50 &&
    value.jobDescription.trim().length <= 30000 &&
    isRecord(value.resume)
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

function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit,
): NextResponse<ResumeTailorError> {
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

async function rollbackUsage() {
  try {
    await releaseFeatureUsage(
      FEATURE_KEY,
      "monthly",
    );
  } catch (e) {
    console.error(
      "Unable to restore Resume Tailor quota.",
      e,
    );
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    TailorResumeResponse |
      ResumeTailorError
  >
> {
  let quotaConsumed = false;
  let success = false;

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
        "A target role, resume and job description are required.",
        400,
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return jsonError(
        "Resume Tailor is not configured.",
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

    const input: TailorResumeRequest =
      {
        targetRole:
          body.targetRole.trim(),
        company:
          typeof body.company ===
          "string"
            ? body.company.trim()
            : "",
        jobDescription:
          body.jobDescription.trim(),
        resume: body.resume,
      };

    const prompt =
      buildResumeTailorPrompt(
        input,
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
          temperature: 0.2,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You are an expert ATS resume writer and senior recruiter. Never invent candidate experience.",
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
        "The AI did not return a resume-tailoring analysis.",
        502,
      );
    }

    const parsed =
      extractJsonObject(content);

    const analysis =
      normalizeResumeTailorAnalysis(
        parsed,
      );

    success = true;

    return NextResponse.json(
      {
        success: true,
        analysis,
        tailoredResume:
          input.resume,
      },
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
        "Resume Tailor monthly limit reached.",
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
      !success
    ) {
      await rollbackUsage();
    }
  }
}
