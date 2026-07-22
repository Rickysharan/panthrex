import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeJobMatchResult } from "@/lib/job-matching/normalize";
import { buildJobMatchingPrompt } from "@/lib/job-matching/prompt";
import type {
  JobMatchError,
  JobMatchRequest,
  JobMatchResponse,
} from "@/lib/job-matching/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
    value.jobDescription.trim().length >= 50
  );
}

function extractJsonObject(content: string): unknown {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("The AI returned an empty response.");
  }

  try {
    return JSON.parse(trimmedContent);
  } catch {
    const fencedJsonMatch = trimmedContent.match(
      /```(?:json)?\s*([\s\S]*?)```/i,
    );

    if (fencedJsonMatch?.[1]) {
      return JSON.parse(fencedJsonMatch[1].trim());
    }

    const firstBraceIndex = trimmedContent.indexOf("{");
    const lastBraceIndex = trimmedContent.lastIndexOf("}");

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

export async function POST(
  request: Request,
): Promise<
  NextResponse<JobMatchResponse | JobMatchError>
> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENAI_API_KEY is not configured on the server.",
        },
        {
          status: 500,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "The request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A resume and a job description of at least 50 characters are required.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedRequest: JobMatchRequest = {
      resume: body.resume,
      jobDescription: body.jobDescription.trim(),
    };

    const prompt = buildJobMatchingPrompt(
      normalizedRequest,
    );

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
              "You are an expert ATS analyst and recruiter. Return only valid JSON that follows the requested schema.",
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
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI did not return a job-match analysis.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedResponse =
      extractJsonObject(content);

    const result =
      normalizeJobMatchResult(parsedResponse);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Job matching analysis failed:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: `Unable to analyse the job match: ${errorMessage}`,
      },
      {
        status: 500,
      },
    );
  }
}