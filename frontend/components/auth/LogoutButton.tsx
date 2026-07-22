"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
  onSignedOut?: () => void;
};

export default function LogoutButton({
  className = "",
  onSignedOut,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      onSignedOut?.();
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {isSigningOut ? (
          <>
            <LoaderCircle
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
            Signing out...
          </>
        ) : (
          <>
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </>
        )}
      </button>

      {errorMessage ? (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
