"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const HIDDEN_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/admin",
]);

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (pathname.startsWith("/admin/")) {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur transition hover:border-violet-400/50 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 sm:left-6 sm:top-6"
    >
      <ArrowLeft size={17} aria-hidden="true" />
      Back
    </button>
  );
}
