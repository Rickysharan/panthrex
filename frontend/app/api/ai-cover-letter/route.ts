import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      companyName,
      jobTitle,
      jobDescription,
      applicantName,
      skills,
      experience,
      tone = "professional",
    } = body;

    if (!companyName || !jobTitle) {
      return NextResponse.json(
        {
          error: "Company name and job title are required.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert career coach and ATS resume specialist.

Write a professional cover letter.

Applicant:
${applicantName ?? ""}

Company:
${companyName}

Role:
${jobTitle}

Skills:
${skills ?? ""}

Experience:
${experience ?? ""}

Job Description:
${jobDescription ?? ""}

Tone:
${tone}

Requirements:
- Professional and personalized
- Mention company naturally
- Show enthusiasm
- Highlight relevant experience
- Mention relevant technical skills
- Keep around 350–450 words
- No placeholders
- No bullet points
- End with a confident closing
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert cover letter writer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      coverLetter:
        response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cover letter.",
      },
      {
        status: 500,
      }
    );
  }
}