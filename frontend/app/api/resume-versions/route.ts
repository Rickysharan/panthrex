import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type CreateVersionBody = {
  resumeId?: unknown;
  snapshot?: unknown;
};

function isSnapshot(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function verifyResumeOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  resumeId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const resumeId = request.nextUrl.searchParams.get("resumeId");

  if (!resumeId) {
    return NextResponse.json(
      { error: "A resume ID is required." },
      { status: 400 },
    );
  }

  try {
    const ownsResume = await verifyResumeOwnership(
      supabase,
      resumeId,
      user.id,
    );

    if (!ownsResume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("resume_versions")
      .select(
        "id, resume_id, version_number, snapshot, created_at",
      )
      .eq("resume_id", resumeId)
      .eq("user_id", user.id)
      .order("version_number", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      versions: data ?? [],
    });
  } catch (error) {
    console.error("Unable to load resume versions.", error);

    return NextResponse.json(
      { error: "Unable to load resume versions." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  let body: CreateVersionBody;

  try {
    body = (await request.json()) as CreateVersionBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const resumeId =
    typeof body.resumeId === "string"
      ? body.resumeId.trim()
      : "";

  if (!resumeId) {
    return NextResponse.json(
      { error: "A resume ID is required." },
      { status: 400 },
    );
  }

  if (!isSnapshot(body.snapshot)) {
    return NextResponse.json(
      { error: "A valid resume snapshot is required." },
      { status: 400 },
    );
  }

  try {
    const ownsResume = await verifyResumeOwnership(
      supabase,
      resumeId,
      user.id,
    );

    if (!ownsResume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 },
      );
    }

    const { data: latestVersion, error: versionError } =
      await supabase
        .from("resume_versions")
        .select("version_number")
        .eq("resume_id", resumeId)
        .eq("user_id", user.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (versionError) {
      throw versionError;
    }

    const nextVersionNumber =
      (latestVersion?.version_number ?? 0) + 1;

    const { data: createdVersion, error: insertError } =
      await supabase
        .from("resume_versions")
        .insert({
          resume_id: resumeId,
          user_id: user.id,
          version_number: nextVersionNumber,
          snapshot: body.snapshot,
        })
        .select(
          "id, resume_id, version_number, snapshot, created_at",
        )
        .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      { version: createdVersion },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create resume version.", error);

    return NextResponse.json(
      { error: "Unable to create resume version." },
      { status: 500 },
    );
  }
}