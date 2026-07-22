import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeResumeTailorAnalysis } from "@/lib/resume-tailor/normalize";
import { buildResumeTailorPrompt } from "@/lib/resume-tailor/prompts";
import type {
  ResumeTailorError,
  TailorResumeRequest,
  TailorResumeResponse,
} from "@/lib/resume-tailor/types";

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
): value is TailorResumeRequest {
  if (!isRecord(value)) {
    return false;
  }

  const companyIsValid =
    value.company === undefined ||
    typeof value.company === "string";

  return (
    typeof value.targetRole === "string" &&
    value.targetRole.trim().length >= 2 &&
    companyIsValid &&
    typeof value.jobDescription === "string" &&
    value.jobDescription.trim().length >= 50 &&
    isRecord(value.resume)
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
  NextResponse<
    TailorResumeResponse | ResumeTailorError
  >
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
            "A target role, resume, and job description of at least 50 characters are required.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedRequest: TailorResumeRequest = {
      targetRole: body.targetRole.trim(),
      company:
        typeof body.company === "string"
          ? body.company.trim()
          : "",
      jobDescription: body.jobDescription.trim(),
      resume: body.resume,
    };

    const prompt = buildResumeTailorPrompt(
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
              "You are an expert ATS resume writer and senior technical recruiter. Return only valid JSON matching the requested schema. Never invent candidate experience, employers, technologies, metrics, qualifications, or achievements.",
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
            "The AI did not return a resume-tailoring analysis.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedResponse =
      extractJsonObject(content);

    const analysis =
      normalizeResumeTailorAnalysis(
        parsedResponse,
      );

    return NextResponse.json({
      success: true,
      analysis,
      tailoredResume: normalizedRequest.resume,
    });
  } catch (error) {
    console.error(
      "Resume tailoring failed:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: `Unable to tailor the resume: ${errorMessage}`,
      },
      {
        status: 500,
      },
    );
  }
}
