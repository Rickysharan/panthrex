"use client";

import UserProfileMenu from "@/components/auth/UserProfileMenu";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FilePenLine,
  FileSearch,
  FileText,
  Gauge,
  LogOut,
  Menu,
  MessageSquareText,
  ScanSearch,
  Search,
  Sparkles,
  Target,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
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

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Gauge;
};

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    label: "Resume Builder",
    href: "/resume-builder",
    icon: FileText,
  },
  {
    label: "ATS Resume Score",
    href: "/ats-score",
    icon: ScanSearch,
  },
  {
    label: "Resume Enhancer",
    href: "/resume-enhancer",
    icon: WandSparkles,
  },
  {
    label: "Cover Letter",
    href: "/cover-letter",
    icon: FilePenLine,
  },
  {
    label: "AI Job Search",
    href: "/job-search",
    icon: Search,
  },
  {
    label: "Saved Jobs",
    href: "/saved-jobs",
    icon: FileSearch,
  },
  {
    label: "Job Tracker",
    href: "/job-tracker",
    icon: BriefcaseBusiness,
  },
  {
    label: "Resume Tailor",
    href: "/resume-tailor",
    icon: Target,
  },
  {
    label: "Interview Coach",
    href: "/interview-prep",
    icon: MessageSquareText,
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Resume score completed",
    description:
      "Your latest resume analysis is ready to review.",
    time: "Just now",
    read: false,
    icon: ScanSearch,
  },
  {
    id: 2,
    title: "Profile improvement available",
    description:
      "Add more skills and project details to strengthen your profile.",
    time: "2 hours ago",
    read: false,
    icon: Target,
  },
  {
    id: 3,
    title: "Application reminder",
    description:
      "Review your upcoming application tasks.",
    time: "Yesterday",
    read: true,
    icon: CalendarDays,
  },
];

export default function AppLayout({
  children,
  title,
  description,
}: AppLayoutProps) {
  const pathname = usePathname();

  const notificationRef = useRef<HTMLDivElement>(null);

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const currentNavigationItem = useMemo(
    () =>
      navigationItems.find(
        (item) =>
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`),
      ),
    [pathname],
  );

  const pageTitle =
    title ??
    currentNavigationItem?.label ??
    "Panthrex";

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

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

  function markAllNotificationsAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  function markNotificationAsRead(
    notificationId: number,
  ) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#080c1c] lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
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

            <div className="hidden max-w-sm flex-1 md:block">
              <label className="relative block">
                <span className="sr-only">
                  Search Panthrex
                </span>

                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  type="search"
                  placeholder="Search Panthrex"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-indigo-500/70 focus:bg-white/[0.06]"
                />
              </label>
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
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {notifications.length > 0 ? (
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
                                markNotificationAsRead(
                                  notification.id,
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
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
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
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
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
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <p className="text-sm font-semibold text-indigo-200">
            Panthrex Pro
          </p>

          <p className="mt-1 text-xs leading-5 text-white/45">
            Unlock unlimited AI tailoring, matching,
            and interview preparation.
          </p>

          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
          >
            Upgrade plan
          </button>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/50 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Return to website
        </Link>
      </div>
    </>
  );
}