import "server-only";

import {
  consumeFeatureUsage,
  type FeatureKey,
  FeatureUsageError,
  type FeatureUsageResult,
  type UsagePeriod,
} from "@/lib/access/feature-usage";
import { getEntitlements } from "@/lib/access/entitlements";
import {
  AuthenticationError,
  requireUser,
} from "@/lib/access/require-user";

export type FeatureGuardOptions = {
  featureKey: FeatureKey;
  freeLimit: number;
  premiumLimit: number;
  periodType?: UsagePeriod;
};

export type FeatureGuardResult = {
  userId: string;
  premium: boolean;
  limit: number;
  usage: FeatureUsageResult;
};

export class FeatureLimitError extends Error {
  readonly status = 429;
  readonly limit: number;
  readonly periodEnd: string;

  constructor(limit: number, periodEnd: string) {
    super("Feature usage limit reached.");
    this.name = "FeatureLimitError";
    this.limit = limit;
    this.periodEnd = periodEnd;
  }
}

export {
  AuthenticationError,
  FeatureUsageError,
};

export async function requireFeatureAccess(
  options: FeatureGuardOptions,
): Promise<FeatureGuardResult> {
  const {
    featureKey,
    freeLimit,
    premiumLimit,
    periodType = "monthly",
  } = options;

  const user = await requireUser();
  const entitlements = await getEntitlements();

  const limit = entitlements.premium
    ? premiumLimit
    : freeLimit;

  const usage = await consumeFeatureUsage(
    featureKey,
    limit,
    periodType,
  );

  if (!usage.allowed) {
    throw new FeatureLimitError(
      limit,
      usage.periodEnd,
    );
  }

  return {
    userId: user.id,
    premium: entitlements.premium,
    limit,
    usage,
  };
}
