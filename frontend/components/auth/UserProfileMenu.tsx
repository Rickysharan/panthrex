"use client";

import {
  ChevronDown,
  CircleUserRound,
  LoaderCircle,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { useEntitlements } from "@/lib/access/useEntitlements";

type UserProfile = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
};

const fallbackProfile: UserProfile = {
  fullName: "Panthrex User",
  firstName: "there",
  email: "",
  initial: "P",
};

function getPlanLabel(
  entitlements: {
    premium: boolean;
    tier:
      | "free"
      | "welcome_trial"
      | "day_pass"
      | "premium";
  } | null,
): string {
  if (!entitlements) {
    return "";
  }

  if (entitlements.tier === "premium") {
    return "🟣 Panthrex Pro";
  }

  if (entitlements.tier === "day_pass") {
    return "⚡ 1-Day Premium Access";
  }

  if (entitlements.tier === "welcome_trial") {
    return "🎁 Welcome Trial";
  }

  return "Free Plan";
}

function buildUserProfile(
  fullNameValue: unknown,
  emailValue: string | undefined,
): UserProfile {
  const email = emailValue?.trim() ?? "";
  const metadataName =
    typeof fullNameValue === "string" ? fullNameValue.trim() : "";

  const emailName = email ? email.split("@")[0] : "";
  const fullName = metadataName || emailName || fallbackProfile.fullName;
  const firstName = fullName.split(/\s+/)[0] || fallbackProfile.firstName;
  const initial =
    fullName.charAt(0).toUpperCase() || fallbackProfile.initial;

  return {
    fullName,
    firstName,
    email,
    initial,
  };
}

type UserProfileMenuProps = {
  onProfileLoaded?: (profile: UserProfile) => void;
};

export default function UserProfileMenu({
  onProfileLoaded,
}: UserProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    entitlements,
    loading: entitlementsLoading,
  } = useEntitlements();

  const [profile, setProfile] =
    useState<UserProfile>(fallbackProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (user) {
        const loadedProfile = buildUserProfile(
          user.user_metadata?.full_name,
          user.email,
        );

        setProfile(loadedProfile);
        onProfileLoaded?.(loadedProfile);
      }

      setIsLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      const user = session?.user;

      if (!user) {
        return;
      }

      const loadedProfile = buildUserProfile(
        user.user_metadata?.full_name,
        user.email,
      );

      setProfile(loadedProfile);
      onProfileLoaded?.(loadedProfile);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [onProfileLoaded]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.07]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 font-semibold text-white">
          {isLoading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            profile.initial
          )}
        </span>

        <div className="hidden max-w-[180px] text-left sm:block">
          <p className="truncate text-sm font-medium">
            {isLoading ? "Loading profile..." : profile.fullName}
          </p>

          <p className="truncate text-xs text-white/35">
            {profile.email}
          </p>

          {!entitlementsLoading &&
            entitlements && (
              <p className="mt-1 text-xs font-semibold text-indigo-300">
                {getPlanLabel(entitlements)}
              </p>
            )}
        </div>

        <ChevronDown
          size={16}
          className={`text-white/35 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-2xl border border-white/10 bg-[#0b0e1d]/95 p-3 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <CircleUserRound size={20} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {profile.fullName}
              </p>

              <p className="mt-0.5 truncate text-xs text-white/40">
                {profile.email || "No email available"}
              </p>

              {!entitlementsLoading && entitlements && (
                <p className="mt-2 text-xs font-semibold text-indigo-300">
                  {getPlanLabel(entitlements)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              <UserRound size={18} />
              View profile
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3">
            <LogoutButton onSignedOut={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { UserProfile };