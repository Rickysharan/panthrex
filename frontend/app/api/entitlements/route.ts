import { NextResponse } from "next/server";

import {
  AuthenticationError,
  requireUser,
} from "@/lib/access/require-user";
import { getEntitlements } from "@/lib/access/entitlements";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();

    const entitlements =
      await getEntitlements();

    return NextResponse.json(
      {
        success: true,
        entitlements,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    console.error(
      "Unable to load entitlements:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load account plan.",
      },
      {
        status: 500,
      },
    );
  }
}
