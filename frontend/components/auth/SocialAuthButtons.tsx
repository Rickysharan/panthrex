"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type OAuthProvider =
  | "google"
  | "github"
  | "linkedin_oidc"
  | "azure";

type SocialAuthButtonsProps = {
  disabled?: boolean;
};

type ProviderConfig = {
  provider: OAuthProvider;
  label: string;
  icon: React.ReactNode;
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

  const providers: ProviderConfig[] = [
    {
      provider: "google",
      label: "Google",
      icon: <GoogleIcon />,
    },
    {
      provider: "github",
      label: "GitHub",
      icon: <GitHubIcon />,
    },
    {
      provider: "linkedin_oidc",
      label: "LinkedIn",
      icon: <LinkedInIcon />,
    },
    {
      provider: "azure",
      label: "Microsoft",
      icon: <MicrosoftIcon />,
    },
  ];

  async function handleOAuth(provider: OAuthProvider) {
    if (disabled || activeProvider) return;

    setActiveProvider(provider);
    setErrorMessage("");

    try {
      const redirect = getSafeRedirect(
        searchParams.get("redirect"),
      );

      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin,
      );

      callbackUrl.searchParams.set("next", redirect);

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          ...(provider === "azure"
            ? { scopes: "email" }
            : {}),
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setActiveProvider(null);
      }
    } catch {
      setErrorMessage(
        "Unable to connect to the selected provider. Please try again.",
      );
      setActiveProvider(null);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map(({ provider, label, icon }) => (
          <SocialButton
            key={provider}
            label={label}
            loading={activeProvider === provider}
            disabled={disabled || Boolean(activeProvider)}
            onClick={() => handleOAuth(provider)}
            icon={icon}
          />
        ))}
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}
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
      aria-label={`Continue with ${label}`}
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/85 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <LoaderCircle
          className="h-5 w-5 animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon
      )}

      <span>{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]"
    >
      G
    </span>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-current"
    >
      <path d="M12 2C6.477 2 2 6.589 2 12.253c0 4.531 2.865 8.374 6.839 9.73.5.095.682-.222.682-.493 0-.244-.009-.89-.014-1.747-2.782.619-3.369-1.374-3.369-1.374-.455-1.184-1.11-1.499-1.11-1.499-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.568 2.341 1.115 2.91.853.091-.663.349-1.115.635-1.371-2.221-.259-4.555-1.139-4.555-5.069 0-1.12.389-2.035 1.029-2.753-.103-.26-.446-1.303.098-2.717 0 0 .84-.276 2.75 1.051A9.34 9.34 0 0 1 12 7.973a9.35 9.35 0 0 1 2.504.345c1.909-1.327 2.748-1.051 2.748-1.051.546 1.414.202 2.457.1 2.717.64.718 1.027 1.633 1.027 2.753 0 3.94-2.338 4.807-4.566 5.061.359.318.679.946.679 1.906 0 1.376-.012 2.486-.012 2.824 0 .274.18.593.688.492C19.138 20.623 22 16.783 22 12.253 22 6.589 17.523 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center rounded bg-[#0a66c2] text-xs font-bold text-white"
    >
      in
    </span>
  );
}

function MicrosoftIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid h-5 w-5 grid-cols-2 gap-[2px]"
    >
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}
