import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, type, title, description, href, metadata, read_at, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to load notifications:", error);

      return NextResponse.json(
        { error: "Failed to load notifications" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      notifications: data ?? [],
    });
  } catch (error) {
    console.error("Unexpected notifications GET error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      notificationId?: string;
      markAllRead?: boolean;
    };

    const readAt = new Date().toISOString();

    if (body.markAllRead) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: readAt })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (error) {
        console.error("Failed to mark all notifications read:", error);

        return NextResponse.json(
          { error: "Failed to update notifications" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        readAt,
      });
    }

    if (!body.notificationId) {
      return NextResponse.json(
        {
          error:
            "notificationId is required unless markAllRead is true",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", body.notificationId)
      .eq("user_id", user.id)
      .select(
        "id, type, title, description, href, metadata, read_at, created_at",
      )
      .single();

    if (error) {
      console.error("Failed to mark notification read:", error);

      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      notification: data,
    });
  } catch (error) {
    console.error("Unexpected notifications PATCH error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const notificationId =
      request.nextUrl.searchParams.get("notificationId");

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete notification:", error);

      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected notifications DELETE error:", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
