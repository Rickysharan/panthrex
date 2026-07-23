"use client";

import {
    BriefcaseBusiness,
    Code2,
    Globe,
    LinkIcon,
    Mail,
    MapPin,
    Pencil,
    Phone,
    UserRound,
} from "lucide-react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import { useSettings } from "@/lib/settings/useSettings";

function createInitials(firstName: string, lastName: string) {
    const firstInitial = firstName.trim().charAt(0);
    const lastInitial = lastName.trim().charAt(0);

    const initials = `${firstInitial}${lastInitial}`.toUpperCase();

    return initials || "P";
}

function formatExternalUrl(url: string) {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        return "";
    }

    if (
        trimmedUrl.startsWith("http://") ||
        trimmedUrl.startsWith("https://")
    ) {
        return trimmedUrl;
    }

    return `https://${trimmedUrl}`;
}

export default function ProfilePage() {
    const { settings, isLoaded } = useSettings();
    const profile = settings.profile;

    const fullName =
        `${profile.firstName} ${profile.lastName}`.trim() ||
        "Panthrex User";

    const initials = createInitials(
        profile.firstName,
        profile.lastName,
    );

    if (!isLoaded) {
        return (
            <AppLayout
                title="Profile"
                description="View your professional Panthrex profile."
            >
                <div className="flex min-h-[60vh] items-center justify-center px-6">
                    <p className="text-sm text-white/50">
                        Loading profile...
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Profile"
            description="View your professional identity and contact details."
        >
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                    <div className="h-36 bg-gradient-to-r from-indigo-600/50 via-violet-600/40 to-blue-600/40 sm:h-44" />

                    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                        <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-4 border-[#080b18] bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold text-white shadow-xl sm:h-32 sm:w-32">
                                    {initials}
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {fullName}
                                    </h2>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                                        {profile.headline ||
                                            "Add a professional headline in Settings."}
                                    </p>

                                    {profile.location ? (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-white/45">
                                            <MapPin size={16} />
                                            <span>{profile.location}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <Link
                                href="/settings"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                            >
                                <Pencil size={17} />
                                Edit profile
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                                <UserRound size={21} />
                            </span>

                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Professional profile
                                </h3>

                                <p className="text-sm text-white/45">
                                    Information used across your Panthrex workspace.
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                            <ProfileDetail
                                icon={UserRound}
                                label="Full name"
                                value={fullName}
                            />

                            <ProfileDetail
                                icon={BriefcaseBusiness}
                                label="Headline"
                                value={profile.headline}
                            />

                            <ProfileDetail
                                icon={Mail}
                                label="Email"
                                value={profile.email}
                            />

                            <ProfileDetail
                                icon={Phone}
                                label="Phone"
                                value={profile.phone}
                            />

                            <ProfileDetail
                                icon={MapPin}
                                label="Location"
                                value={profile.location}
                            />
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-white">
                            Professional links
                        </h3>

                        <p className="mt-1 text-sm text-white/45">
                            Your public career profiles and portfolio.
                        </p>

                        <div className="mt-6 space-y-3">
                            <ExternalProfileLink
                                icon={LinkIcon}
                                label="LinkedIn"
                                url={profile.linkedInUrl}
                            />

                            <ExternalProfileLink
                                icon={Code2}
                                label="GitHub"
                                url={profile.githubUrl}
                            />

                            <ExternalProfileLink
                                icon={Globe}
                                label="Portfolio"
                                url={profile.portfolioUrl}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

type IconComponent = typeof UserRound;

type ProfileDetailProps = {
    icon: IconComponent;
    label: string;
    value: string;
};

function ProfileDetail({
    icon: Icon,
    label,
    value,
}: ProfileDetailProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                <Icon size={15} />
                <span>{label}</span>
            </div>

            <p className="mt-3 break-words text-sm font-medium text-white/80">
                {value.trim() || "Not provided"}
            </p>
        </div>
    );
}

type ExternalProfileLinkProps = {
    icon: IconComponent;
    label: string;
    url: string;
};

function ExternalProfileLink({
    icon: Icon,
    label,
    url,
}: ExternalProfileLinkProps) {
    const formattedUrl = formatExternalUrl(url);

    if (!formattedUrl) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-white/35">
                <Icon size={19} />

                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs">Not provided</p>
                </div>
            </div>
        );
    }

    return (
        <a
            href={formattedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-white/65 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
        >
            <Icon size={19} />

            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-white/35">{url}</p>
            </div>
        </a>
    );
}