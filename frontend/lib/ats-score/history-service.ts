import type { AtsScoreResult } from "@/lib/ats-score/types";
import type { SavedAtsAnalysis } from "@/lib/ats-score/useAtsScoreHistory";

type ApiAnalysisRow = {
  id: string;
  title: string;
  company: string;
  job_description: string;
  resume_name: string;
  result: AtsScoreResult;
  created_at: string;
  updated_at: string;
};

type ApiErrorResponse = {
  error?: unknown;
};

type GetAnalysesResponse = {
  analyses?: unknown;
};

type AnalysisResponse = {
  analysis?: unknown;
};

export type CreateAtsAnalysisInput = {
  title?: string;
  company?: string;
  jobDescription: string;
  resumeName: string;
  result: AtsScoreResult;
};

export type UpdateAtsAnalysisInput = {
  title?: string;
  company?: string;
  jobDescription?: string;
  resumeName?: string;
  result?: AtsScoreResult;
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

function isApiAnalysisRow(
  value: unknown,
): value is ApiAnalysisRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.job_description === "string" &&
    typeof value.resume_name === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    isRecord(value.result)
  );
}

function mapAnalysisRow(
  row: ApiAnalysisRow,
): SavedAtsAnalysis {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    jobDescription: row.job_description,
    resumeName: row.resume_name,
    result: row.result,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readJsonResponse(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(
      "The ATS history service returned an invalid response.",
    );
  }
}

function getErrorMessage(
  responseBody: unknown,
  fallbackMessage: string,
): string {
  if (!isRecord(responseBody)) {
    return fallbackMessage;
  }

  const errorResponse =
    responseBody as ApiErrorResponse;

  return typeof errorResponse.error === "string"
    ? errorResponse.error
    : fallbackMessage;
}

export async function getAtsAnalyses(): Promise<
  SavedAtsAnalysis[]
> {
  const response = await fetch(
    "/api/ats-score-history",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const responseBody =
    (await readJsonResponse(
      response,
    )) as GetAnalysesResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseBody,
        "Unable to load ATS analyses.",
      ),
    );
  }

  if (
    !isRecord(responseBody) ||
    !Array.isArray(responseBody.analyses)
  ) {
    throw new Error(
      "The ATS history response was incomplete.",
    );
  }

  return responseBody.analyses
    .filter(isApiAnalysisRow)
    .map(mapAnalysisRow);
}

export async function createAtsAnalysis(
  input: CreateAtsAnalysisInput,
): Promise<SavedAtsAnalysis> {
  const response = await fetch(
    "/api/ats-score-history",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const responseBody =
    (await readJsonResponse(
      response,
    )) as AnalysisResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseBody,
        "Unable to save ATS analysis.",
      ),
    );
  }

  if (
    !isRecord(responseBody) ||
    !isApiAnalysisRow(responseBody.analysis)
  ) {
    throw new Error(
      "The saved ATS analysis response was incomplete.",
    );
  }

  return mapAnalysisRow(
    responseBody.analysis,
  );
}

export async function updateAtsAnalysis(
  id: string,
  updates: UpdateAtsAnalysisInput,
): Promise<SavedAtsAnalysis> {
  const response = await fetch(
    "/api/ats-score-history",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    },
  );

  const responseBody =
    (await readJsonResponse(
      response,
    )) as AnalysisResponse;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseBody,
        "Unable to update ATS analysis.",
      ),
    );
  }

  if (
    !isRecord(responseBody) ||
    !isApiAnalysisRow(responseBody.analysis)
  ) {
    throw new Error(
      "The updated ATS analysis response was incomplete.",
    );
  }

  return mapAnalysisRow(
    responseBody.analysis,
  );
}

export async function deleteAtsAnalysis(
  id: string,
): Promise<void> {
  const response = await fetch(
    "/api/ats-score-history",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    },
  );

  const responseBody =
    await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseBody,
        "Unable to delete ATS analysis.",
      ),
    );
  }
}

export async function clearAtsAnalyses(): Promise<void> {
  const response = await fetch(
    "/api/ats-score-history",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clearAll: true,
      }),
    },
  );

  const responseBody =
    await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        responseBody,
        "Unable to clear ATS analyses.",
      ),
    );
  }
}