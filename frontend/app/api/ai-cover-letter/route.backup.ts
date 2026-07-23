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

export const runtime = "nodejs";

const MODEL = "gpt-4.1-mini";

const FEATURE_KEY = "cover_letter" as const;
const FREE_MONTHLY_LIMIT = 3;
const PREMIUM_MONTHLY_LIMIT = 100;

type CoverLetterRequest = {
  companyName?: unknown;
  jobTitle?: unknown;
  jobDescription?: unknown;
  applicantName?: unknown;
  skills?: unknown;
  experience?: unknown;
  tone?: unknown;
};

type CoverLetterSuccessResponse = {
  success: true;
  coverLetter: string;
};

type CoverLetterErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

function normalizeOptionalText(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function jsonError(
  error: string,
  status: number,
  details?: string,
  headers?: HeadersInit,
) {
  const response: CoverLetterErrorResponse = {
    success: false,
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
  let body: CoverLetterRequest;

  try {
    body =
      (await request.json()) as CoverLetterRequest;
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  const companyName = normalizeOptionalText(
    body.companyName,
    200,
  );
  const jobTitle = normalizeOptionalText(
    body.jobTitle,
    200,
  );
  const jobDescription = normalizeOptionalText(
    body.jobDescription,
    20_000,
  );
  const applicantName = normalizeOptionalText(
    body.applicantName,
    200,
  );
  const skills = normalizeOptionalText(
    body.skills,
    5_000,
  );
  const experience = normalizeOptionalText(
    body.experience,
    10_000,
  );
  const tone =
    normalizeOptionalText(body.tone, 100) ||
    "professional";

  if (!companyName || !jobTitle) {
    return jsonError(
      "Company name and job title are required.",
      400,
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

    const prompt = `
You are an expert career coach and ATS resume specialist.

Write a professional cover letter.

Applicant:
${applicantName}

Company:
${companyName}

Role:
${jobTitle}

Skills:
${skills}

Experience:
${experience}

Job Description:
${jobDescription}

Tone:
${tone}

Requirements:
- Professional and personalised
- Mention the company naturally
- Show clear enthusiasm
- Highlight relevant experience
- Mention relevant technical skills
- Keep the letter around 350 to 450 words
- Do not use placeholders
- Do not use bullet points
- End with a confident closing
`.trim();

    const client = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const response =
      await client.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert cover letter writer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

    const coverLetter =
      response.choices[0]?.message?.content?.trim();

    if (!coverLetter) {
      return jsonError(
        "The AI did not return a cover letter.",
        502,
      );
    }

    const responseBody: CoverLetterSuccessResponse = {
      success: true,
      coverLetter,
    };

    operationSucceeded = true;

    return NextResponse.json(responseBody, {
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
      "Cover Letter request failed.",
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
      "Failed to generate cover letter.",
      500,
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred.",
    );
  } finally {
    if (quotaConsumed && !operationSucceeded) {
      await safelyReleaseUsage();
    }
  }
}
