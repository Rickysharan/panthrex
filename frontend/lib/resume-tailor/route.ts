import { NextResponse } from "next/server";
import OpenAI from "openai";

import { normalizeResumeTailorAnalysis } from "@/lib/resume-tailor/normalize";
import { buildResumeTailorPrompt } from "@/lib/resume-tailor/prompts";
import type {
  ResumeTailorError,
  TailorResumeRequest,
  TailorResumeResponse,
} from "@/lib/resume-tailor/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TailorResumeRequest;

    if (!body.targetRole.trim()) {
      return NextResponse.json<ResumeTailorError>(
        {
          success: false,
          error: "Target role is required.",
        },
        { status: 400 },
      );
    }

    if (!body.jobDescription.trim()) {
      return NextResponse.json<ResumeTailorError>(
        {
          success: false,
          error: "Job description is required.",
        },
        { status: 400 },
      );
    }

    const prompt = buildResumeTailorPrompt(body);

    const completion = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
    });

    const raw =
      completion.output_text ||
      "{}";

    const parsed = JSON.parse(raw);

    const analysis =
      normalizeResumeTailorAnalysis(parsed);

    const response: TailorResumeResponse = {
      success: true,
      analysis,
      tailoredResume: body.resume,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json<ResumeTailorError>(
      {
        success: false,
        error: "Unable to tailor resume.",
      },
      { status: 500 },
    );
  }
}