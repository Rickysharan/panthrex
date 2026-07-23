import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirect(requestUrl.searchParams.get("next"));

  if (!code) {
    const errorUrl = new URL("/login", requestUrl.origin);
    errorUrl.searchParams.set(
      "error",
      "Authentication could not be completed. Please try again.",
    );

    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL("/login", requestUrl.origin);
    errorUrl.searchParams.set(
      "error",
      "Your authentication link is invalid or has expired.",
    );

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
