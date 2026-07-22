import OpenAI from "openai";
import { NextResponse } from "next/server";

import { normalizeResumeEnhancementResponse } from "@/lib/ai-resume-enhancer/normalize";
import { buildResumeEnhancementPrompt } from "@/lib/ai-resume-enhancer/prompt";
import type {
  ResumeEnhancementApiError,
  ResumeEnhancementRequest,
} from "@/lib/ai-resume-enhancer/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<ResumeEnhancementApiError>(
        {
          error: "OpenAI API key is not configured.",
          details:
            "Add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 },
      );
    }

    const body =
      (await request.json()) as Partial<ResumeEnhancementRequest>;

    if (!body.resume) {
      return NextResponse.json<ResumeEnhancementApiError>(
        {
          error: "Resume data is required.",
        },
        { status: 400 },
      );
    }

    const prompt = buildResumeEnhancementPrompt(
      body.resume,
      body.targetRole,
      body.jobDescription,
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer and ATS optimisation specialist. Return valid JSON only.",
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
      return NextResponse.json<ResumeEnhancementApiError>(
        {
          error:
            "The AI did not return an enhancement response.",
        },
        { status: 502 },
      );
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(content);
    } catch {
      return NextResponse.json<ResumeEnhancementApiError>(
        {
          error:
            "The AI returned an invalid enhancement response.",
        },
        { status: 502 },
      );
    }

    const normalizedResponse =
      normalizeResumeEnhancementResponse(
        parsedResponse,
      );

    if (
      normalizedResponse.suggestions.length === 0 &&
      normalizedResponse.warnings.length === 0
    ) {
      normalizedResponse.warnings.push(
        "No resume improvements were generated.",
      );
    }

    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error(
      "Unable to enhance the resume.",
      error,
    );

    return NextResponse.json<ResumeEnhancementApiError>(
      {
        error: "The resume could not be enhanced.",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}