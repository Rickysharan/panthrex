import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  normalizeAiParsedResume,
  normalizeParserWarnings,
} from "@/lib/ai-resume-parser/normalize";
import { buildAiResumeParserPrompt } from "@/lib/ai-resume-parser/prompt";
import type {
  AiResumeParserErrorResponse,
  AiResumeParserResponse,
  RawAiParsedResume,
} from "@/lib/ai-resume-parser/types";
import { validateAiResumeParserRequest } from "@/lib/ai-resume-parser/validation";

export const runtime = "nodejs";

const MODEL = "gpt-5-mini";

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
): RawAiParsedResume {
  const jsonText = extractJsonObject(outputText);

  let parsedResponse: unknown;

  try {
    parsedResponse = JSON.parse(jsonText);
  } catch {
    throw new Error(
      "The AI response could not be parsed as JSON.",
    );
  }

  if (
    typeof parsedResponse !== "object" ||
    parsedResponse === null ||
    Array.isArray(parsedResponse)
  ) {
    throw new Error(
      "The AI response must contain a JSON object.",
    );
  }

  return parsedResponse as RawAiParsedResume;
}

function jsonError(
  error: string,
  status: number,
  details?: string,
) {
  const response: AiResumeParserErrorResponse = {
    error,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(response, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonError(
      "AI Resume Parser is not configured.",
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
    validateAiResumeParserRequest(requestBody);

  if (!validationResult.success) {
    return jsonError(validationResult.error, 400);
  }

  const { systemPrompt, userPrompt } =
    buildAiResumeParserPrompt(
      validationResult.data,
    );

  const client = new OpenAI({
    apiKey,
    timeout: 60_000,
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

    const rawParsedResume = parseAiResponse(
      response.output_text,
    );

    const resume = normalizeAiParsedResume(
      rawParsedResume,
    );

    const warnings = normalizeParserWarnings(
      rawParsedResume.warnings,
    );

    const responseBody: AiResumeParserResponse = {
      resume,
      warnings,
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "AI Resume Parser request failed.",
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
      "Unable to parse the resume.",
      500,
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred.",
    );
  }
}