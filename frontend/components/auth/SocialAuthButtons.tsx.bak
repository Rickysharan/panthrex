"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "facebook" | "linkedin_oidc";

type SocialAuthButtonsProps = {
  disabled?: boolean;
};

function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default function SocialAuthButtons({
  disabled = false,
}: SocialAuthButtonsProps) {
  const searchParams = useSearchParams();

  const [activeProvider, setActiveProvider] =
    useState<OAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleOAuth(provider: OAuthProvider) {
    if (disabled || activeProvider) return;

    setActiveProvider(provider);
    setErrorMessage("");

    const redirect = getSafeRedirect(searchParams.get("redirect"));

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirect);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setActiveProvider(null);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">

        <SocialButton
          label="Google"
          loading={activeProvider === "google"}
          disabled={disabled || !!activeProvider}
          onClick={() => handleOAuth("google")}
          icon={<GoogleIcon />}
        />

        <SocialButton
          label="LinkedIn"
          loading={activeProvider === "linkedin_oidc"}
          disabled={disabled || !!activeProvider}
          onClick={() => handleOAuth("linkedin_oidc")}
          icon={<LinkedInIcon />}
        />

        <SocialButton
          label="Facebook"
          loading={activeProvider === "facebook"}
          disabled={disabled || !!activeProvider}
          onClick={() => handleOAuth("facebook")}
          icon={<FacebookIcon />}
        />

      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

type SocialButtonProps = {
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
};

function SocialButton({
  label,
  loading,
  disabled,
  onClick,
  icon,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
    >
      {loading ? (
        <LoaderCircle className="h-5 w-5 animate-spin" />
      ) : (
        icon
      )}

      <span>{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return <span className="font-bold text-lg">G</span>;
}

function LinkedInIcon() {
  return <span className="font-bold text-lg">in</span>;
}

function FacebookIcon() {
  return <span className="font-bold text-lg">f</span>;
}
