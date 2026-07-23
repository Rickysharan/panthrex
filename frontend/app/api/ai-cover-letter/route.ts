import { NextResponse } from "next/server";
import OpenAI from "openai";

import { buildCoverLetterPrompt } from "@/lib/ai-cover-letter/prompt";
import { normalizeCoverLetterResponse } from "@/lib/ai-cover-letter/normalize";
import type {
  CoverLetterApiError,
  CoverLetterRequest,
} from "@/lib/ai-cover-letter/types";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidRequest(
  value: unknown,
): value is CoverLetterRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request = value as Partial<CoverLetterRequest>;

  return Boolean(
    request.resume &&
      typeof request.companyName === "string" &&
      request.companyName.trim() &&
      typeof request.jobTitle === "string" &&
      request.jobTitle.trim() &&
      typeof request.jobDescription === "string" &&
      request.jobDescription.trim() &&
      typeof request.tone === "string" &&
      typeof request.length === "string",
  );
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<CoverLetterApiError>(
        {
          error:
            "OPENAI_API_KEY is not configured in the server environment.",
        },
        {
          status: 500,
        },
      );
    }

    const body: unknown = await request.json();

    if (!isValidRequest(body)) {
      return NextResponse.json<CoverLetterApiError>(
        {
          error:
            "Invalid cover letter request. Company name, job title, job description, tone, length and resume data are required.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = buildCoverLetterPrompt(body);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_COVER_LETTER_MODEL || "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You write accurate, tailored and professional UK cover letters. Never invent candidate information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawContent =
      completion.choices[0]?.message?.content;

    const result = normalizeCoverLetterResponse({
      rawContent,
      companyName: body.companyName,
      hiringManagerName: body.hiringManagerName,
      jobTitle: body.jobTitle,
      tone: body.tone,
      length: body.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI cover letter generation failed:", error);

    const details =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json<CoverLetterApiError>(
      {
        error: "Failed to generate the cover letter.",
        details,
      },
      {
        status: 500,
      },
    );
  }
}