import { createClient } from "@/lib/supabase/client";

import {
  AccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
} from "./types";

const TABLE = "user_settings";

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}

export async function getSettings(): Promise<AccountSettings> {
  const supabase = createClient();

  const user = await getCurrentUser();

  if (!user) {
    return structuredClone(DEFAULT_ACCOUNT_SETTINGS);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("settings")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return structuredClone(DEFAULT_ACCOUNT_SETTINGS);
  }

  return {
    ...structuredClone(DEFAULT_ACCOUNT_SETTINGS),
    ...(data.settings as Partial<AccountSettings>),
  };
}

export async function saveSettings(
  settings: AccountSettings,
): Promise<void> {
  const supabase = createClient();

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: user.id,
        settings,
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    throw error;
  }
}