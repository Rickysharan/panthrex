import "server-only";

import { createClient } from "@/lib/supabase/server";

export type FeatureKey =
  | "ai_resume_writer"
  | "ai_resume_enhancer"
  | "ai_resume_parser"
  | "ats_scan"
  | "cover_letter"
  | "resume_tailor"
  | "interview_prep"
  | "interview_generate"
  | "interview_evaluate"
  | "job_matching"
  | "career_assistant";

export type UsagePeriod = "daily" | "monthly" | "lifetime";

export type FeatureUsageResult = {
  allowed: boolean;
  usageCount: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
};

type FeatureUsageRpcRow = {
  allowed: boolean;
  usage_count: number;
  remaining: number;
  period_start: string;
  period_end: string;
};

export class FeatureUsageError extends Error {
  constructor(message = "Unable to verify feature usage.") {
    super(message);
    this.name = "FeatureUsageError";
  }
}

export async function consumeFeatureUsage(
  featureKey: FeatureKey,
  limit: number,
  periodType: UsagePeriod = "monthly",
): Promise<FeatureUsageResult> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new FeatureUsageError(
      "Feature quota limit must be a positive integer.",
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "consume_feature_usage",
    {
      p_feature_key: featureKey,
      p_limit: limit,
      p_period_type: periodType,
    },
  );

  if (error) {
    console.error(
      `Failed to consume feature usage for ${featureKey}.`,
      error,
    );

    throw new FeatureUsageError();
  }

  const rows = data as FeatureUsageRpcRow[] | null;
  const result = rows?.[0];

  if (!result) {
    throw new FeatureUsageError(
      "The feature usage service returned no result.",
    );
  }

  return {
    allowed: result.allowed,
    usageCount: result.usage_count,
    remaining: result.remaining,
    periodStart: result.period_start,
    periodEnd: result.period_end,
  };
}

export async function releaseFeatureUsage(
  featureKey: FeatureKey,
  periodType: UsagePeriod = "monthly",
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "release_feature_usage",
    {
      p_feature_key: featureKey,
      p_period_type: periodType,
    },
  );

  if (error) {
    console.error(
      `Failed to release feature usage for ${featureKey}.`,
      error,
    );

    throw new FeatureUsageError(
      "Unable to release feature usage.",
    );
  }

  if (typeof data !== "number") {
    throw new FeatureUsageError(
      "The feature usage release service returned an invalid result.",
    );
  }

  return data;
}
