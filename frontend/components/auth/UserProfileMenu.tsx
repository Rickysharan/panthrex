"use client";

import { ChevronDown, CircleUserRound, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";

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
  const initial = fullName.charAt(0).toUpperCase() || fallbackProfile.initial;

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

  const [profile, setProfile] = useState<UserProfile>(fallbackProfile);
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
            {profile.email || "Free plan"}
          </p>
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
            </div>
          </div>

          <div className="mt-3">
            <LogoutButton onSignedOut={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { UserProfile };
