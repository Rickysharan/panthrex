import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "ats_score"
  | "resume_enhancement"
  | "resume_writer"
  | "cover_letter"
  | "interview"
  | "job_application"
  | "billing"
  | "system";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  href?: string | null;
  metadata?: Record<
    string,
    string | number | boolean | null
  >;
};

export async function createNotification({
  userId,
  type,
  title,
  description,
  href = null,
  metadata = {},
}: CreateNotificationInput): Promise<void> {
  const normalizedUserId = userId.trim();
  const normalizedTitle = title.trim();
  const normalizedDescription =
    description.trim();

  if (!normalizedUserId) {
    throw new Error(
      "Notification user ID is required.",
    );
  }

  if (!normalizedTitle) {
    throw new Error(
      "Notification title is required.",
    );
  }

  if (!normalizedDescription) {
    throw new Error(
      "Notification description is required.",
    );
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("notifications")
    .insert({
      user_id: normalizedUserId,
      type,
      title: normalizedTitle,
      description: normalizedDescription,
      href,
      metadata,
    });

  if (error) {
    throw new Error(
      `Unable to create notification: ${error.message}`,
    );
  }
}

export async function safelyCreateNotification(
  input: CreateNotificationInput,
): Promise<void> {
  try {
    await createNotification(input);
  } catch (error) {
    console.error(
      "Notification creation failed:",
      error,
    );
  }
}
