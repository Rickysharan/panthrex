import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeInterviewQuestions } from "@/lib/interview/normalize";
import { buildInterviewGenerationPrompt } from "@/lib/interview/prompt";
import type {
  InterviewGenerationError,
  InterviewGenerationRequest,
  InterviewGenerationResponse,
} from "@/lib/interview/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidRequest(
  value: unknown,
): value is InterviewGenerationRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const request = value as Partial<InterviewGenerationRequest>;

  return (
    typeof request.role === "string" &&
    request.role.trim().length > 0 &&
    typeof request.category === "string" &&
    typeof request.difficulty === "string" &&
    typeof request.questionCount === "number" &&
    Number.isInteger(request.questionCount) &&
    request.questionCount > 0 &&
    request.questionCount <= 20
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
        trimmedContent.slice(firstBraceIndex, lastBraceIndex + 1),
      );
    }

    throw new Error("The AI response did not contain valid JSON.");
  }
}

export async function POST(
  request: Request,
): Promise<
  NextResponse<
    InterviewGenerationResponse | InterviewGenerationError
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
          error: "The request body must contain valid JSON.",
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
            "A role, category, difficulty and valid question count are required.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedRequest: InterviewGenerationRequest = {
      role: body.role.trim(),
      company: body.company?.trim() || undefined,
      jobDescription:
        body.jobDescription?.trim() || undefined,
      category: body.category,
      difficulty: body.difficulty,
      questionCount: body.questionCount,
      skills: Array.isArray(body.skills)
        ? body.skills
            .map((skill) => skill.trim())
            .filter(Boolean)
        : undefined,
    };

    const prompt = buildInterviewGenerationPrompt(
      normalizedRequest,
    );

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview coach. Return only valid JSON that follows the requested schema.",
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
            "The AI did not return any interview questions.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedResponse = extractJsonObject(content);
    const normalizedResponse =
      normalizeInterviewQuestions(parsedResponse);

    if (normalizedResponse.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI response did not contain usable interview questions.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error(
      "Interview question generation failed:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: `Unable to generate interview questions: ${errorMessage}`,
      },
      {
        status: 500,
      },
    );
  }
}