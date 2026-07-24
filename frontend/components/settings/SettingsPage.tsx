"use client";

import {
  Bell,
  Bot,
  BriefcaseBusiness,
  Check,
  CreditCard,
  Monitor,
  RotateCcw,
  Save,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import PlanStatusCard from "@/components/billing/PlanStatusCard";
import { useEntitlements } from "@/lib/access/useEntitlements";
import { useSettings } from "@/lib/settings/useSettings";

export default function SettingsPage() {
  const {
    settings,
    isLoaded,
    saveStatus,
    error,
    updateProfile,
    updateAppearance,
    updateNotifications,
    updateAiPreferences,
    updateJobPreferences,
    saveSettings,
    resetSettings,
  } = useSettings();

  const { entitlements } = useEntitlements();

  if (!isLoaded) {
    return (
      <AppLayout
        title="Settings"
        description="Manage your profile and Panthrex preferences."
      >
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-sm text-white/45">
            Loading settings...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Settings"
      description="Manage your profile, AI preferences, notifications and job-search defaults."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <SettingsSection
          icon={UserRound}
          title="Profile"
          description="Personal information used throughout your Panthrex workspace."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="First name"
              value={settings.profile.firstName}
              onChange={(value) =>
                updateProfile({ firstName: value })
              }
            />

            <TextField
              label="Last name"
              value={settings.profile.lastName}
              onChange={(value) =>
                updateProfile({ lastName: value })
              }
            />

            <TextField
              label="Email address"
              type="email"
              value={settings.profile.email}
              placeholder="you@example.com"
              onChange={(value) =>
                updateProfile({ email: value })
              }
            />

            <TextField
              label="Phone number"
              type="tel"
              value={settings.profile.phone}
              placeholder="+44 7700 000000"
              onChange={(value) =>
                updateProfile({ phone: value })
              }
            />

            <div className="md:col-span-2">
              <TextField
                label="Professional headline"
                value={settings.profile.headline}
                placeholder="Data Analyst specialising in fraud detection"
                onChange={(value) =>
                  updateProfile({ headline: value })
                }
              />
            </div>

            <TextField
              label="Location"
              value={settings.profile.location}
              placeholder="London, United Kingdom"
              onChange={(value) =>
                updateProfile({ location: value })
              }
            />

            <TextField
              label="LinkedIn URL"
              type="url"
              value={settings.profile.linkedInUrl}
              placeholder="https://linkedin.com/in/..."
              onChange={(value) =>
                updateProfile({ linkedInUrl: value })
              }
            />

            <TextField
              label="GitHub URL"
              type="url"
              value={settings.profile.githubUrl}
              placeholder="https://github.com/..."
              onChange={(value) =>
                updateProfile({ githubUrl: value })
              }
            />

            <TextField
              label="Portfolio URL"
              type="url"
              value={settings.profile.portfolioUrl}
              placeholder="https://yourportfolio.com"
              onChange={(value) =>
                updateProfile({ portfolioUrl: value })
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={CreditCard}
          title="Subscription"
          description="Manage your Panthrex plan, premium access and billing."
        >
          <PlanStatusCard
            entitlements={entitlements}
          />

          {!entitlements?.premium && (
            <div className="mt-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <p className="text-sm font-semibold text-indigo-200">
                Upgrade to Panthrex Pro 🚀
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                Unlock premium AI resume writing, ATS optimisation,
                job matching and interview preparation tools.
              </p>

              <Link
                href="/#pricing"
                className="mt-3 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                View plans
              </Link>
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          icon={Monitor}
          title="Appearance"
          description="Control how Panthrex looks and behaves."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {(["system", "dark", "light"] as const).map(
              (theme) => {
                const selected =
                  settings.appearance.theme === theme;

                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      updateAppearance({ theme })
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-violet-400/50 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">
                        {theme}
                      </span>

                      {selected && (
                        <Check
                          size={17}
                          className="text-violet-300"
                        />
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-white/40">
                      {theme === "system"
                        ? "Follow your device appearance."
                        : theme === "dark"
                          ? "Use the Panthrex dark interface."
                          : "Use a brighter interface."}
                    </p>
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-5 space-y-3">
            <ToggleRow
              title="Compact navigation"
              description="Reduce spacing in the application sidebar."
              checked={
                settings.appearance.compactNavigation
              }
              onChange={(checked) =>
                updateAppearance({
                  compactNavigation: checked,
                })
              }
            />

            <ToggleRow
              title="Reduce motion"
              description="Limit interface animations and transitions."
              checked={settings.appearance.reduceMotion}
              onChange={(checked) =>
                updateAppearance({
                  reduceMotion: checked,
                })
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose which alerts and summaries you receive."
        >
          <div className="space-y-3">
            <ToggleRow
              title="Job match emails"
              description="Receive alerts when strong job matches are found."
              checked={
                settings.notifications.emailJobMatches
              }
              onChange={(checked) =>
                updateNotifications({
                  emailJobMatches: checked,
                })
              }
            />

            <ToggleRow
              title="Application reminders"
              description="Receive reminders for follow-ups and deadlines."
              checked={
                settings.notifications
                  .emailApplicationReminders
              }
              onChange={(checked) =>
                updateNotifications({
                  emailApplicationReminders: checked,
                })
              }
            />

            <ToggleRow
              title="Interview reminders"
              description="Receive reminders before scheduled interviews."
              checked={
                settings.notifications
                  .emailInterviewReminders
              }
              onChange={(checked) =>
                updateNotifications({
                  emailInterviewReminders: checked,
                })
              }
            />

            <ToggleRow
              title="Browser notifications"
              description="Allow notifications while Panthrex is open."
              checked={
                settings.notifications
                  .browserNotifications
              }
              onChange={(checked) =>
                updateNotifications({
                  browserNotifications: checked,
                })
              }
            />

            <ToggleRow
              title="Weekly career summary"
              description="Receive a weekly summary of your activity."
              checked={
                settings.notifications
                  .weeklyCareerSummary
              }
              onChange={(checked) =>
                updateNotifications({
                  weeklyCareerSummary: checked,
                })
              }
            />

            <ToggleRow
              title="Product updates"
              description="Receive announcements about new Panthrex features."
              checked={
                settings.notifications.emailProductUpdates
              }
              onChange={(checked) =>
                updateNotifications({
                  emailProductUpdates: checked,
                })
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bot}
          title="AI preferences"
          description="Configure how Panthrex generates career content."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Writing tone"
              value={settings.ai.writingTone}
              options={[
                ["professional", "Professional"],
                ["confident", "Confident"],
                ["concise", "Concise"],
                ["friendly", "Friendly"],
                ["technical", "Technical"],
              ]}
              onChange={(value) =>
                updateAiPreferences({
                  writingTone:
                    value as typeof settings.ai.writingTone,
                })
              }
            />

            <SelectField
              label="Response length"
              value={settings.ai.responseLength}
              options={[
                ["short", "Short"],
                ["balanced", "Balanced"],
                ["detailed", "Detailed"],
              ]}
              onChange={(value) =>
                updateAiPreferences({
                  responseLength:
                    value as typeof settings.ai.responseLength,
                })
              }
            />
          </div>

          <div className="mt-5 space-y-3">
            <ToggleRow
              title="Use British English"
              description="Use British spelling and terminology."
              checked={settings.ai.useBritishEnglish}
              onChange={(checked) =>
                updateAiPreferences({
                  useBritishEnglish: checked,
                })
              }
            />

            <ToggleRow
              title="Prioritise ATS keywords"
              description="Emphasise relevant keywords from job descriptions."
              checked={settings.ai.prioritiseAtsKeywords}
              onChange={(checked) =>
                updateAiPreferences({
                  prioritiseAtsKeywords: checked,
                })
              }
            />

            <ToggleRow
              title="Quantify achievements"
              description="Encourage measurable impact in generated content."
              checked={
                settings.ai.includeQuantifiedAchievements
              }
              onChange={(checked) =>
                updateAiPreferences({
                  includeQuantifiedAchievements: checked,
                })
              }
            />

            <ToggleRow
              title="Avoid generic phrases"
              description="Reduce clichés and vague statements."
              checked={settings.ai.avoidGenericPhrases}
              onChange={(checked) =>
                updateAiPreferences({
                  avoidGenericPhrases: checked,
                })
              }
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={BriefcaseBusiness}
          title="Job preferences"
          description="Set defaults for job discovery and recommendations."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Preferred job titles"
              value={settings.jobs.preferredJobTitles.join(
                ", ",
              )}
              placeholder="Fraud Analyst, Data Analyst"
              onChange={(value) =>
                updateJobPreferences({
                  preferredJobTitles: value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />

            <TextField
              label="Preferred locations"
              value={settings.jobs.preferredLocations.join(
                ", ",
              )}
              placeholder="London, Remote"
              onChange={(value) =>
                updateJobPreferences({
                  preferredLocations: value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />

            <TextField
              label="Minimum salary"
              type="number"
              value={
                settings.jobs.minimumSalary?.toString() ??
                ""
              }
              placeholder="30000"
              onChange={(value) =>
                updateJobPreferences({
                  minimumSalary:
                    value.trim() === ""
                      ? null
                      : Number(value),
                })
              }
            />

            <SelectField
              label="Salary currency"
              value={settings.jobs.salaryCurrency}
              options={[
                ["GBP", "GBP — British Pound"],
                ["EUR", "EUR — Euro"],
                ["USD", "USD — US Dollar"],
                ["INR", "INR — Indian Rupee"],
              ]}
              onChange={(value) =>
                updateJobPreferences({
                  salaryCurrency:
                    value as typeof settings.jobs.salaryCurrency,
                })
              }
            />
          </div>

          <div className="mt-5 space-y-3">
            <ToggleRow
              title="Visa sponsorship required"
              description="Prioritise employers that offer sponsorship."
              checked={
                settings.jobs.requiresVisaSponsorship
              }
              onChange={(checked) =>
                updateJobPreferences({
                  requiresVisaSponsorship: checked,
                })
              }
            />

            <ToggleRow
              title="Exclude jobs without salary"
              description="Hide roles that do not publish compensation."
              checked={
                settings.jobs.excludeJobsWithoutSalary
              }
              onChange={(checked) =>
                updateJobPreferences({
                  excludeJobsWithoutSalary: checked,
                })
              }
            />

            <ToggleRow
              title="Exclude recruitment agencies"
              description="Prefer direct employer vacancies."
              checked={
                settings.jobs.excludeRecruitmentAgencies
              }
              onChange={(checked) =>
                updateJobPreferences({
                  excludeRecruitmentAgencies: checked,
                })
              }
            />
          </div>
        </SettingsSection>

        <div className="sticky bottom-4 z-20 rounded-3xl border border-white/10 bg-[#090c1c]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Settings controls
              </p>

              <p className="mt-1 text-xs text-white/40">
                {saveStatus === "saving" &&
                  "Saving your changes..."}

                {saveStatus === "saved" &&
                  "Your settings were saved."}

                {saveStatus === "error" &&
                  (error ??
                    "Your settings could not be saved.")}

                {saveStatus === "idle" &&
                  "Changes remain local until you save them."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saveStatus === "saving"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050816] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveStatus === "saved" ? (
                  <Check size={17} />
                ) : (
                  <Save size={17} />
                )}

                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
          <Icon size={20} />
        </span>

        <div>
          <h2 className="text-lg font-semibold">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-white/40">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/65">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/50 focus:bg-white/[0.055]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/65">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0e20] px-4 text-sm text-white outline-none transition focus:border-violet-400/50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div>
        <p className="text-sm font-medium text-white/85">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          checked
            ? "bg-violet-500"
            : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}