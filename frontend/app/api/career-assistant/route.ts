import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import {
  releaseFeatureUsage,
} from "@/lib/access/feature-usage";
import {
  normalizeCareerAssistantResponse,
} from "@/lib/career-assistant/normalize";
import {
  buildCareerAssistantPrompt,
} from "@/lib/career-assistant/prompt";
import type {
  CareerAssistantApiError,
  CareerAssistantApiMessage,
  CareerAssistantRequest,
} from "@/lib/career-assistant/types";

export const runtime = "nodejs";

const MODEL = "gpt-4.1-mini";
const FEATURE_KEY = "career_assistant" as const;
const FREE_MONTHLY_LIMIT = 20;
const PREMIUM_MONTHLY_LIMIT = 500;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 1_000;

function jsonError(
  error: string,
  status: number,
  details?: string,
  headers?: HeadersInit,
) {
  const response: CareerAssistantApiError = {
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

function normalizeHistory(
  value: unknown,
): CareerAssistantApiMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(-MAX_HISTORY_MESSAGES)
    .flatMap((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("role" in item) ||
        !("content" in item)
      ) {
        return [];
      }

      const role = item.role;
      const content = item.content;

      if (
        (role !== "assistant" &&
          role !== "user") ||
        typeof content !== "string"
      ) {
        return [];
      }

      const normalizedContent = content
        .trim()
        .slice(
          0,
          MAX_HISTORY_MESSAGE_LENGTH,
        );

      if (!normalizedContent) {
        return [];
      }

      return [
        {
          role,
          content: normalizedContent,
        },
      ];
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
      "Unable to restore Career Assistant quota.",
      error,
    );
  }
}

export async function POST(request: Request) {
  let body: Partial<CareerAssistantRequest>;

  try {
    body =
      (await request.json()) as Partial<CareerAssistantRequest>;
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  const message = body.message?.trim();

  if (!message) {
    return jsonError(
      "A message is required.",
      400,
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonError(
      "The message is too long.",
      400,
      `Messages must not exceed ${MAX_MESSAGE_LENGTH} characters.`,
    );
  }

  const currentPath =
    typeof body.currentPath === "string"
      ? body.currentPath.trim().slice(0, 200)
      : undefined;

  const history = normalizeHistory(body.history);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Panthrex AI is not configured.",
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
    usageRemaining =
      access.usage.remaining;

    const prompt =
      buildCareerAssistantPrompt(
        message,
        currentPath,
        history,
      );

    const openai = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const completion =
      await openai.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are Panthrex AI, a precise career-platform assistant. Return valid JSON only.",
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
        "Panthrex AI did not return a response.",
        502,
      );
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(content);
    } catch {
      return jsonError(
        "Panthrex AI returned an invalid response.",
        502,
      );
    }

    const normalizedResponse =
      normalizeCareerAssistantResponse(
        parsedResponse,
      );

    operationSucceeded = true;

    return NextResponse.json(
      normalizedResponse,
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
      "Unable to process Career Assistant message.",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required.",
        401,
        "Please sign in before using Panthrex AI.",
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "Panthrex AI monthly limit reached.",
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
        "Unable to verify your Panthrex AI allowance.",
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
      "Panthrex AI could not process the message.",
      500,
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
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
