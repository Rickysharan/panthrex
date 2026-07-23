import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  AuthenticationError,
  FeatureLimitError,
  FeatureUsageError,
  requireFeatureAccess,
} from "@/lib/access/feature-guard";
import { releaseFeatureUsage } from "@/lib/access/feature-usage";
import { buildAiResumePrompt } from "@/lib/ai-resume/prompt";
import type {
  AiResumeSuggestion,
  AiResumeWriterErrorResponse,
  AiResumeWriterResponse,
} from "@/lib/ai-resume/types";
import { validateAiResumeWriterRequest } from "@/lib/ai-resume/validation";

export const runtime = "nodejs";

const MODEL = "gpt-5-mini";
const MAX_SUGGESTION_LENGTH = 6_000;

const FEATURE_KEY = "ai_resume_writer" as const;
const FREE_MONTHLY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 100;

type RawAiResponse = {
  suggestions?: Array<{
    content?: unknown;
  }>;
};

function createSuggestionId(index: number): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `ai-suggestion-${globalThis.crypto.randomUUID()}`;
  }

  return `ai-suggestion-${Date.now()}-${index}`;
}

function extractJsonObject(value: string): string {
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("{") &&
    trimmedValue.endsWith("}")
  ) {
    return trimmedValue;
  }

  const firstBraceIndex = trimmedValue.indexOf("{");
  const lastBraceIndex = trimmedValue.lastIndexOf("}");

  if (
    firstBraceIndex === -1 ||
    lastBraceIndex === -1 ||
    lastBraceIndex <= firstBraceIndex
  ) {
    throw new Error(
      "The AI response did not contain a valid JSON object.",
    );
  }

  return trimmedValue.slice(
    firstBraceIndex,
    lastBraceIndex + 1,
  );
}

function parseAiResponse(
  outputText: string,
): AiResumeSuggestion[] {
  const jsonText = extractJsonObject(outputText);

  let parsedResponse: RawAiResponse;

  try {
    parsedResponse = JSON.parse(jsonText) as RawAiResponse;
  } catch {
    throw new Error(
      "The AI response could not be parsed as JSON.",
    );
  }

  if (!Array.isArray(parsedResponse.suggestions)) {
    throw new Error(
      "The AI response did not include suggestions.",
    );
  }

  const suggestions = parsedResponse.suggestions
    .map((suggestion, index) => {
      if (
        !suggestion ||
        typeof suggestion.content !== "string"
      ) {
        return null;
      }

      const content = suggestion.content.trim();

      if (
        !content ||
        content.length > MAX_SUGGESTION_LENGTH
      ) {
        return null;
      }

      return {
        id: createSuggestionId(index),
        content,
      };
    })
    .filter(
      (
        suggestion,
      ): suggestion is AiResumeSuggestion =>
        suggestion !== null,
    );

  if (suggestions.length !== 3) {
    throw new Error(
      "The AI response must contain exactly three valid suggestions.",
    );
  }

  return suggestions;
}

function jsonError(
  error: string,
  status: number,
  details?: string,
  headers?: HeadersInit,
) {
  const response: AiResumeWriterErrorResponse = {
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
      "Unable to restore AI Resume Writer quota.",
      error,
    );
  }
}

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return jsonError(
      "The request body must contain valid JSON.",
      400,
    );
  }

  const validationResult =
    validateAiResumeWriterRequest(requestBody);

  if (!validationResult.success) {
    return jsonError(validationResult.error, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "AI Resume Writer is not configured.",
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

    const { systemPrompt, userPrompt } =
      buildAiResumePrompt(validationResult.data);

    const client = new OpenAI({
      apiKey,
      timeout: 45_000,
      maxRetries: 2,
    });

    const response = await client.responses.create({
      model: MODEL,
      instructions: systemPrompt,
      input: userPrompt,
    });

    if (!response.output_text.trim()) {
      return jsonError(
        "The AI service returned an empty response.",
        502,
      );
    }

    const suggestions = parseAiResponse(
      response.output_text,
    );

    const responseBody: AiResumeWriterResponse = {
      suggestions,
    };

    operationSucceeded = true;

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": String(usageLimit),
        "X-RateLimit-Remaining": String(usageRemaining),
      },
    });
  } catch (error) {
    console.error(
      "AI Resume Writer request failed.",
      error,
    );

    if (error instanceof AuthenticationError) {
      return jsonError(
        "Authentication required.",
        401,
        "Please sign in before using AI Resume Writer.",
      );
    }

    if (error instanceof FeatureLimitError) {
      return jsonError(
        "AI Resume Writer monthly limit reached.",
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
      "Unable to generate resume suggestions.",
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
