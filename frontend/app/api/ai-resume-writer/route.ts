import OpenAI from "openai";
import { NextResponse } from "next/server";

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
) {
  const response: AiResumeWriterErrorResponse = {
    error,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(response, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "AI Resume Writer is not configured.",
      503,
      "The server is missing the OPENAI_API_KEY environment variable.",
    );
  }

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

  const { systemPrompt, userPrompt } =
    buildAiResumePrompt(validationResult.data);

  const client = new OpenAI({
    apiKey,
    timeout: 45_000,
    maxRetries: 2,
  });

  try {
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

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "AI Resume Writer request failed.",
      error,
    );

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
  }
}
