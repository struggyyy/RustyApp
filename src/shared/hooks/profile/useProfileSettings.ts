/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React-specific imports
import { useState, useCallback } from "react";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useLanguage } from "@/core/context/LanguageContext";
import { useAlert } from "../../../core/context/AlertContext";

// Hook options interface
interface UseProfileSettingsOptions {
  t: (key: string, options?: any) => string;
}

// Main hook function
export function useProfileSettings({ t }: UseProfileSettingsOptions) {
  const { updateUserProfile, logOut, deleteAccount, profile } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { showAlert } = useAlert();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notificationPreferences?.push ?? true
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    profile?.notificationPreferences?.haptics ?? true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings handlers
  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      setIsSubmitting(true);
      setNotificationsEnabled(value);
      try {
        await updateUserProfile({
          notificationPreferences: {
            push: value,
            email: profile?.notificationPreferences?.email ?? true,
            haptics: hapticsEnabled,
          },
        });
        showAlert(t("common.success"), t("settings.settingsUpdated"));
      } catch (error: any) {
        showAlert(
          t("common.error"),
          error.message || t("settings.settingsError")
        );
        setNotificationsEnabled(!value); // Revert on error
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      updateUserProfile,
      profile?.notificationPreferences?.email,
      hapticsEnabled,
      showAlert,
      t,
    ]
  );

  const handleToggleHaptics = useCallback(
    async (value: boolean) => {
      setIsSubmitting(true);
      setHapticsEnabled(value);
      try {
        await updateUserProfile({
          notificationPreferences: {
            push: notificationsEnabled,
            email: profile?.notificationPreferences?.email ?? true,
            haptics: value,
          },
        });
        showAlert(t("common.success"), t("settings.settingsUpdated"));
      } catch (error: any) {
        showAlert(
          t("common.error"),
          error.message || t("settings.settingsError")
        );
        setHapticsEnabled(!value); // Revert on error
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      updateUserProfile,
      notificationsEnabled,
      profile?.notificationPreferences?.email,
      showAlert,
      t,
    ]
  );

  // Language toggle handler
  const handleToggleLanguage = useCallback(async () => {
    const newLanguage = currentLanguage === "en" ? "pl" : "en";
    try {
      await changeLanguage(newLanguage);
      showAlert(
        t("common.success"),
        t("settings.languageSetTo", {
          language:
            newLanguage === "en" ? t("settings.english") : t("settings.polish"),
        })
      );
    } catch (error: any) {
      showAlert(
        t("common.error"),
        error.message || t("settings.settingsError")
      );
    }
  }, [currentLanguage, changeLanguage, showAlert, t]);

  // Hook return interface
  return {
    // State
    notificationsEnabled,
    hapticsEnabled,
    isSubmitting,

    // Actions
    handleToggleNotifications,
    handleToggleHaptics,
    handleToggleLanguage,
  };
}
