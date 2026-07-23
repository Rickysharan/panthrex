import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

type CreateAnalysisBody = {
  title?: unknown;
  company?: unknown;
  jobDescription?: unknown;
  resumeName?: unknown;
  result?: unknown;
};

type UpdateAnalysisBody = {
  id?: unknown;
  title?: unknown;
  company?: unknown;
  jobDescription?: unknown;
  resumeName?: unknown;
  result?: unknown;
};

type DeleteAnalysisBody = {
  id?: unknown;
  clearAll?: unknown;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeTitle(
  title: unknown,
  company: unknown,
): string {
  const normalizedTitle =
    typeof title === "string"
      ? title.trim()
      : "";

  const normalizedCompany =
    typeof company === "string"
      ? company.trim()
      : "";

  if (normalizedTitle) {
    return normalizedTitle;
  }

  if (normalizedCompany) {
    return `${normalizedCompany} ATS analysis`;
  }

  return "Untitled ATS analysis";
}

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

const selectedColumns = [
  "id",
  "title",
  "company",
  "job_description",
  "resume_name",
  "result",
  "created_at",
  "updated_at",
].join(", ");

export async function GET() {
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

  try {
    const { data, error } = await supabase
      .from("ats_score_analyses")
      .select(selectedColumns)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(25);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      analyses: data ?? [],
    });
  } catch (error) {
    console.error(
      "Unable to load ATS analyses.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load ATS analyses.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
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

  let body: CreateAnalysisBody;

  try {
    body =
      (await request.json()) as CreateAnalysisBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const company = normalizeText(
    body.company,
  );

  const jobDescription = normalizeText(
    body.jobDescription,
  );

  const resumeName =
    normalizeText(body.resumeName) ||
    "Current resume";

  if (jobDescription.length < 50) {
    return NextResponse.json(
      {
        error:
          "A valid job description is required.",
      },
      { status: 400 },
    );
  }

  if (!isRecord(body.result)) {
    return NextResponse.json(
      {
        error:
          "A valid ATS result is required.",
      },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("ats_score_analyses")
      .insert({
        user_id: user.id,
        title: normalizeTitle(
          body.title,
          company,
        ),
        company,
        job_description: jobDescription,
        resume_name: resumeName,
        result: body.result,
      })
      .select(selectedColumns)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { analysis: data },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Unable to save ATS analysis.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to save ATS analysis.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
) {
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

  let body: UpdateAnalysisBody;

  try {
    body =
      (await request.json()) as UpdateAnalysisBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const id = normalizeText(body.id);

  if (!id || !isUuid(id)) {
    return NextResponse.json(
      {
        error:
          "A valid analysis ID is required.",
      },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> =
    {
      updated_at: new Date().toISOString(),
    };

  if (
    body.company !== undefined
  ) {
    updates.company = normalizeText(
      body.company,
    );
  }

  if (
    body.title !== undefined
  ) {
    updates.title = normalizeTitle(
      body.title,
      body.company,
    );
  }

  if (
    body.jobDescription !== undefined
  ) {
    const jobDescription =
      normalizeText(body.jobDescription);

    if (jobDescription.length < 50) {
      return NextResponse.json(
        {
          error:
            "A valid job description is required.",
        },
        { status: 400 },
      );
    }

    updates.job_description =
      jobDescription;
  }

  if (
    body.resumeName !== undefined
  ) {
    updates.resume_name =
      normalizeText(body.resumeName) ||
      "Current resume";
  }

  if (body.result !== undefined) {
    if (!isRecord(body.result)) {
      return NextResponse.json(
        {
          error:
            "A valid ATS result is required.",
        },
        { status: 400 },
      );
    }

    updates.result = body.result;
  }

  try {
    const { data, error } = await supabase
      .from("ats_score_analyses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(selectedColumns)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "ATS analysis not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      analysis: data,
    });
  } catch (error) {
    console.error(
      "Unable to update ATS analysis.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update ATS analysis.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
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

  let body: DeleteAnalysisBody;

  try {
    body =
      (await request.json()) as DeleteAnalysisBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    if (body.clearAll === true) {
      const { error } = await supabase
        .from("ats_score_analyses")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
      });
    }

    const id = normalizeText(body.id);

    if (!id || !isUuid(id)) {
      return NextResponse.json(
        {
          error:
            "A valid analysis ID is required.",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("ats_score_analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "ATS analysis not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Unable to delete ATS analysis.",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete ATS analysis.",
      },
      { status: 500 },
    );
  }
}