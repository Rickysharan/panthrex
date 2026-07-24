"use client";

import UserProfileMenu from "@/components/auth/UserProfileMenu";
import CareerAssistant from "@/components/career-assistant/CareerAssistant";
import GlobalSearch from "@/components/search/GlobalSearch";
import PlanStatusCard from "@/components/billing/PlanStatusCard";
import PremiumWelcomeBanner from "@/components/billing/PremiumWelcomeBanner";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import ProductTour from "@/components/onboarding/ProductTour";
import { useEntitlements } from "@/lib/access/useEntitlements";
import { createClient } from "@/lib/supabase/client";
import {
  accountNavigationItems,
  appNavigationItems,
  findNavigationItemByPath,
} from "@/lib/navigation/navigation";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Menu,
  ScanSearch,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AppLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  read: boolean;
  time: string;
  icon: typeof Bell;
};

type NotificationApiItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  metadata: unknown;
  read_at: string | null;
  created_at: string;
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "ats_score":
    case "resume_analysis":
      return ScanSearch;

    case "profile":
    case "profile_improvement":
      return Target;

    case "application":
    case "application_reminder":
      return CalendarDays;

    default:
      return Bell;
  }
}

function formatNotificationTime(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return "";
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdTime) / 1000),
  );

  if (elapsedSeconds < 60) {
    return "Just now";
  }

  const elapsedMinutes = Math.floor(
    elapsedSeconds / 60,
  );

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${
      elapsedMinutes === 1 ? "" : "s"
    } ago`;
  }

  const elapsedHours = Math.floor(
    elapsedMinutes / 60,
  );

  if (elapsedHours < 24) {
    return `${elapsedHours} hour${
      elapsedHours === 1 ? "" : "s"
    } ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays === 1) {
    return "Yesterday";
  }

  if (elapsedDays < 7) {
    return `${elapsedDays} days ago`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year:
      new Date(createdAt).getFullYear() ===
      new Date().getFullYear()
        ? undefined
        : "numeric",
  }).format(new Date(createdAt));
}

function mapNotification(
  notification: NotificationApiItem,
): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    description: notification.description,
    href: notification.href,
    read: notification.read_at !== null,
    time: formatNotificationTime(
      notification.created_at,
    ),
    icon: getNotificationIcon(notification.type),
  };
}

export default function AppLayout({
  children,
  title,
  description,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    entitlements,
  } = useEntitlements();

  const [showOnboarding, setShowOnboarding] =
    useState(false);

  const [onboardingUserId, setOnboardingUserId] =
    useState<string | null>(null);

  const [showProductTour, setShowProductTour] =
    useState(() => {
      if (typeof window === "undefined") {
        return false;
      }

      return (
        localStorage.getItem(
          "panthrex_product_tour_completed",
        ) !== "true"
      );
    });

  const notificationRef = useRef<HTMLDivElement>(null);

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const supabase = createClient();

      const {
        data: {
          user,
        },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return;
      }

      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (
        profile &&
        !profile.onboarding_completed
      ) {
        setOnboardingUserId(user.id);
        setShowOnboarding(true);
      }
    }

    void checkOnboarding();
  }, []);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(true);

  const [notificationsError, setNotificationsError] =
    useState<string | null>(null);

  const currentNavigationItem = useMemo(
    () => findNavigationItemByPath(pathname),
    [pathname],
  );

  const pageTitle =
    title ??
    currentNavigationItem?.label ??
    "Panthrex";

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as {
        notifications?: NotificationApiItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Failed to load notifications",
        );
      }

      setNotifications(
        (payload.notifications ?? []).map(
          mapNotification,
        ),
      );
    } catch (error) {
      setNotificationsError(
        error instanceof Error
          ? error.message
          : "Failed to load notifications",
      );
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const supabase = createClient();
    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;
    let cancelled = false;

    async function subscribeToNotifications() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Failed to initialise notification realtime subscription:",
          error,
        );
        return;
      }

      if (!user) {
        return;
      }

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            void loadNotifications();

            if (payload.eventType !== "INSERT") {
              return;
            }

            const notification =
              payload.new as NotificationApiItem;

            toast(notification.title, {
              description: notification.description,
              action: notification.href
                ? {
                    label: "Open",
                    onClick: () => {
                      router.push(notification.href!);
                    },
                  }
                : undefined,
            });
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error(
              "Notification realtime subscription failed.",
            );
          }
        });
    }

    void subscribeToNotifications();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications, router]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileNavigationOpen]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node,
        )
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setMobileNavigationOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function toggleNotifications() {
    setNotificationsOpen((current) => !current);
  }

  async function markAllNotificationsAsRead() {
    const previousNotifications = notifications;

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markAllRead: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notifications as read",
        );
      }
    } catch (error) {
      console.error(error);
      setNotifications(previousNotifications);
    }
  }

  async function markNotificationAsRead(
    notificationId: string,
  ) {
    const notification = notifications.find(
      (item) => item.id === notificationId,
    );

    if (!notification || notification.read) {
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read",
        );
      }
    } catch (error) {
      console.error(error);

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: false,
              }
            : item,
        ),
      );
    }
  }

  async function handleNotificationClick(
    notification: NotificationItem,
  ) {
    await markNotificationAsRead(notification.id);

    setNotificationsOpen(false);

    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#080c1c] lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
          entitlements={entitlements}
          onNavigate={() =>
            setMobileNavigationOpen(false)
          }
        />
      </aside>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() =>
              setMobileNavigationOpen(false)
            }
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col border-r border-white/10 bg-[#080c1c] shadow-2xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() =>
                setMobileNavigationOpen(false)
              }
              className="absolute right-4 top-4 rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>

            <SidebarContent
              pathname={pathname}
              entitlements={entitlements}
              onNavigate={() =>
                setMobileNavigationOpen(false)
              }
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() =>
                setMobileNavigationOpen(true)
              }
              className="rounded-xl border border-white/10 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                <span>Panthrex</span>

                <ChevronRight size={13} />

                <span className="truncate text-indigo-300">
                  {pageTitle}
                </span>
              </div>

              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-white">
                {pageTitle}
              </h1>

              {description && (
                <p className="mt-1 hidden truncate text-sm text-white/50 sm:block">
                  {description}
                </p>
              )}
            </div>

            <div className="hidden max-w-md flex-1 md:block">
              <GlobalSearch />
            </div>

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
                className="relative rounded-xl border border-white/10 p-2.5 text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <Bell size={20} />

                {unreadNotificationCount > 0 && (
                  <>
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-2 ring-[#050816]" />

                    <span className="sr-only">
                      {unreadNotificationCount} unread
                      notifications
                    </span>
                  </>
                )}
              </button>

              {notificationsOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e1d]/95 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Notifications
                      </h2>

                      <p className="mt-0.5 text-xs text-white/40">
                        {unreadNotificationCount > 0
                          ? `${unreadNotificationCount} unread`
                          : "You are all caught up"}
                      </p>
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          void markAllNotificationsAsRead()
                        }
                        className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <div className="flex flex-col items-center px-6 py-10 text-center">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-indigo-300" />

                        <p className="mt-4 text-sm font-medium text-white/60">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notificationsError ? (
                      <div className="flex flex-col items-center px-6 py-10 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                          <Bell size={22} />
                        </span>

                        <p className="mt-4 text-sm font-semibold">
                          Notifications unavailable
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {notificationsError}
                        </p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(
                        (notification) => {
                          const Icon =
                            notification.icon;

                          return (
                            <button
                              key={notification.id}
                              type="button"
                              role="menuitem"
                              onClick={() =>
                                void handleNotificationClick(
                                  notification,
                                )
                              }
                              className={`flex w-full gap-3 rounded-xl p-3 text-left transition ${
                                notification.read
                                  ? "hover:bg-white/[0.04]"
                                  : "bg-indigo-500/[0.08] hover:bg-indigo-500/[0.12]"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  notification.read
                                    ? "bg-white/[0.05] text-white/45"
                                    : "bg-indigo-500/15 text-indigo-300"
                                }`}
                              >
                                <Icon size={18} />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="flex items-start justify-between gap-3">
                                  <span
                                    className={`text-sm ${
                                      notification.read
                                        ? "font-medium text-white/70"
                                        : "font-semibold text-white"
                                    }`}
                                  >
                                    {
                                      notification.title
                                    }
                                  </span>

                                  {!notification.read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                                  )}
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-white/40">
                                  {
                                    notification.description
                                  }
                                </span>

                                <span className="mt-2 block text-[11px] font-medium text-white/30">
                                  {notification.time}
                                </span>
                              </span>
                            </button>
                          );
                        },
                      )
                    ) : (
                      <div className="flex flex-col items-center px-6 py-10 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                          <CheckCircle2 size={22} />
                        </span>

                        <p className="mt-4 text-sm font-semibold">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          New activity will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 p-3">
                    <Link
                      href="/dashboard"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                      className="flex w-full items-center justify-center rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.09] hover:text-white"
                    >
                      View dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <UserProfileMenu />
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)]">
          <div className="px-4 pt-6 sm:px-6 lg:px-8">
            {entitlements?.premium && (
              <PremiumWelcomeBanner
                tier={
                  entitlements.tier === "free"
                    ? "premium"
                    : entitlements.tier
                }
                expiry={
                  entitlements.subscription.expiresAt ??
                  entitlements.premiumUntil ??
                  entitlements.welcomeTrial.endsAt ??
                  entitlements.dayPass.expiresAt
                }
              />
            )}
          </div>

          {children}
        </main>
      </div>

      {showOnboarding &&
        onboardingUserId && (
          <OnboardingModal
            userId={onboardingUserId}
          />
        )}

      {showProductTour && (
        <ProductTour
          onComplete={() => {
            localStorage.setItem(
              "panthrex_product_tour_completed",
              "true",
            );

            setShowProductTour(false);
          }}
        />
      )}

      <CareerAssistant />
    </div>
  );
}

function SidebarContent({
  pathname,
  entitlements,
  onNavigate,
}: {
  pathname: string;
  entitlements: {
    tier:
      | "free"
      | "welcome_trial"
      | "day_pass"
      | "premium";

    premium: boolean;

    welcomeTrial: {
      active: boolean;
      used: boolean;
      startedAt: string | null;
      endsAt: string | null;
    };

    dayPass: {
      active: boolean;
      expiresAt: string | null;
    };

    subscription: {
      active: boolean;
      expiresAt: string | null;
    };

    premiumUntil: string | null;
  } | null;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/10">
            <Sparkles size={20} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Panthrex
            </p>

            <p className="text-xs text-white/40">
              AI Career Platform
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
          Workspace
        </p>

        <nav
          aria-label="Application navigation"
          className="mt-3 space-y-1"
        >
          {appNavigationItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
                id={`${item.id}-nav`}
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={
                  active ? "page" : undefined
                }
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-indigo-500 text-white"
                      : "bg-white/[0.04] text-white/45 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
          Account
        </p>

        <nav
          aria-label="Account navigation"
          className="mt-3 space-y-1"
        >
          {accountNavigationItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/20"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-indigo-500 text-white"
                      : "bg-white/[0.04] text-white/45 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <PlanStatusCard
          entitlements={entitlements}
        />
      </div>
    </>
  );
}