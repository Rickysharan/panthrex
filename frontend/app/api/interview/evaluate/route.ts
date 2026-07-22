import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeInterviewEvaluation } from "@/lib/interview/normalize";
import { buildInterviewEvaluationPrompt } from "@/lib/interview/prompt";
import type {
  InterviewEvaluationError,
  InterviewEvaluationRequest,
  InterviewEvaluationResponse,
} from "@/lib/interview/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidRequest(
  value: unknown,
): value is InterviewEvaluationRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const request = value as Partial<InterviewEvaluationRequest>;

  return (
    typeof request.role === "string" &&
    request.role.trim().length > 0 &&
    typeof request.answer === "string" &&
    request.answer.trim().length > 0 &&
    typeof request.question === "object" &&
    request.question !== null &&
    typeof request.question.id === "string" &&
    typeof request.question.question === "string" &&
    request.question.question.trim().length > 0
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
    InterviewEvaluationResponse | InterviewEvaluationError
  >
> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured on the server.",
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
            "A valid question, answer and target role are required.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedRequest: InterviewEvaluationRequest = {
      question: body.question,
      answer: body.answer.trim(),
      role: body.role.trim(),
      company: body.company?.trim() || undefined,
      jobDescription:
        body.jobDescription?.trim() || undefined,
    };

    const prompt = buildInterviewEvaluationPrompt(
      normalizedRequest,
    );

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview evaluator. Return only valid JSON that follows the requested schema.",
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
            "The AI did not return an interview evaluation.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedResponse = extractJsonObject(content);

    const answerId = crypto.randomUUID();

    const evaluation = normalizeInterviewEvaluation(
      parsedResponse,
      normalizedRequest.question.id,
      answerId,
    );

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Interview answer evaluation failed:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: `Unable to evaluate the interview answer: ${errorMessage}`,
      },
      {
        status: 500,
      },
    );
  }
}