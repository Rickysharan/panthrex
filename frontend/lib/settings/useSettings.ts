"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_ACCOUNT_SETTINGS,
  type AccountSettings,
  type AiPreferences,
  type AppearanceSettings,
  type JobPreferences,
  type NotificationPreferences,
  type ProfileSettings,
  type ResumePreferences,
  type SettingsState,
} from "./types";

const SETTINGS_STORAGE_KEY =
  "panthrex-account-settings";

function mergeSettings(
  storedSettings: Partial<AccountSettings>,
): AccountSettings {
  return {
    ...DEFAULT_ACCOUNT_SETTINGS,

    ...storedSettings,

    profile: {
      ...DEFAULT_ACCOUNT_SETTINGS.profile,
      ...storedSettings.profile,
    },

    appearance: {
      ...DEFAULT_ACCOUNT_SETTINGS.appearance,
      ...storedSettings.appearance,
    },

    notifications: {
      ...DEFAULT_ACCOUNT_SETTINGS.notifications,
      ...storedSettings.notifications,
    },

    ai: {
      ...DEFAULT_ACCOUNT_SETTINGS.ai,
      ...storedSettings.ai,
    },

    resume: {
      ...DEFAULT_ACCOUNT_SETTINGS.resume,
      ...storedSettings.resume,
    },

    jobs: {
      ...DEFAULT_ACCOUNT_SETTINGS.jobs,
      ...storedSettings.jobs,

      preferredJobTitles:
        storedSettings.jobs?.preferredJobTitles ??
        DEFAULT_ACCOUNT_SETTINGS.jobs
          .preferredJobTitles,

      preferredLocations:
        storedSettings.jobs?.preferredLocations ??
        DEFAULT_ACCOUNT_SETTINGS.jobs
          .preferredLocations,

      workplaceTypes:
        storedSettings.jobs?.workplaceTypes ??
        DEFAULT_ACCOUNT_SETTINGS.jobs
          .workplaceTypes,

      employmentTypes:
        storedSettings.jobs?.employmentTypes ??
        DEFAULT_ACCOUNT_SETTINGS.jobs
          .employmentTypes,

      experienceLevels:
        storedSettings.jobs?.experienceLevels ??
        DEFAULT_ACCOUNT_SETTINGS.jobs
          .experienceLevels,
    },
  };
}

function readSettings(): AccountSettings {
  if (typeof window === "undefined") {
    return DEFAULT_ACCOUNT_SETTINGS;
  }

  try {
    const storedValue = window.localStorage.getItem(
      SETTINGS_STORAGE_KEY,
    );

    if (!storedValue) {
      return DEFAULT_ACCOUNT_SETTINGS;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (
      !parsedValue ||
      typeof parsedValue !== "object"
    ) {
      return DEFAULT_ACCOUNT_SETTINGS;
    }

    return mergeSettings(
      parsedValue as Partial<AccountSettings>,
    );
  } catch (error) {
    console.error(
      "Unable to read Panthrex settings.",
      error,
    );

    return DEFAULT_ACCOUNT_SETTINGS;
  }
}

function writeSettings(settings: AccountSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function useSettings() {
  const [settings, setSettings] =
    useState<AccountSettings>(readSettings);

  const [isLoaded] =
    useState(true);

  const [saveStatus, setSaveStatus] =
    useState<SettingsState["saveStatus"]>(
      "idle",
    );

  const [error, setError] =
    useState<string | null>(null);



  const persistSettings = useCallback(
    (nextSettings: AccountSettings) => {
      setSaveStatus("saving");
      setError(null);

      try {
        const settingsWithTimestamp = {
          ...nextSettings,
          updatedAt: new Date().toISOString(),
        };

        writeSettings(settingsWithTimestamp);
        setSettings(settingsWithTimestamp);
        setSaveStatus("saved");

        window.setTimeout(() => {
          setSaveStatus((currentStatus) =>
            currentStatus === "saved"
              ? "idle"
              : currentStatus,
          );
        }, 2000);
      } catch (caughtError) {
        console.error(
          "Unable to save Panthrex settings.",
          caughtError,
        );

        setSaveStatus("error");
        setError(
          "Your settings could not be saved.",
        );
      }
    },
    [],
  );

  const updateProfile = useCallback(
    (updates: Partial<ProfileSettings>) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        profile: {
          ...currentSettings.profile,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateAppearance = useCallback(
    (updates: Partial<AppearanceSettings>) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        appearance: {
          ...currentSettings.appearance,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateNotifications = useCallback(
    (
      updates: Partial<NotificationPreferences>,
    ) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateAiPreferences = useCallback(
    (updates: Partial<AiPreferences>) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        ai: {
          ...currentSettings.ai,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateResumePreferences =
    useCallback(
      (
        updates: Partial<ResumePreferences>,
      ) => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          resume: {
            ...currentSettings.resume,
            ...updates,
          },
        }));
      },
      [],
    );

  const updateJobPreferences = useCallback(
    (updates: Partial<JobPreferences>) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        jobs: {
          ...currentSettings.jobs,
          ...updates,
        },
      }));
    },
    [],
  );

  const saveSettings = useCallback(() => {
    persistSettings(settings);
  }, [persistSettings, settings]);

  const resetSettings = useCallback(() => {
    const resetValue = {
      ...DEFAULT_ACCOUNT_SETTINGS,
      updatedAt: new Date().toISOString(),
    };

    try {
      writeSettings(resetValue);
      setSettings(resetValue);
      setSaveStatus("saved");
      setError(null);
    } catch (caughtError) {
      console.error(
        "Unable to reset Panthrex settings.",
        caughtError,
      );

      setSaveStatus("error");
      setError(
        "Your settings could not be reset.",
      );
    }
  }, []);



  return useMemo(
    () => ({
      settings,
      isLoaded,
      saveStatus,
      error,
      updateProfile,
      updateAppearance,
      updateNotifications,
      updateAiPreferences,
      updateResumePreferences,
      updateJobPreferences,
      saveSettings,
      resetSettings,
    }),
    [
      settings,
      isLoaded,
      saveStatus,
      error,
      updateProfile,
      updateAppearance,
      updateNotifications,
      updateAiPreferences,
      updateResumePreferences,
      updateJobPreferences,
      saveSettings,
      resetSettings,
    ],
  );
}