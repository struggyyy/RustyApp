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
import React, { createContext, useContext, ReactNode, useMemo } from "react";

// External libraries
import * as Haptics from "expo-haptics";

// Internal imports
import { useAuth } from "./AuthContext";

interface HapticsContextType {
  // Medium haptic feedback
  medium: () => void;
  // Heavy haptic feedback (default for all interactions)
  heavy: () => void;
  // Selection haptic feedback
  selection: () => void;
  // Notification haptic feedback
  notification: (type?: "success" | "warning" | "error") => void;
  // Impact haptic feedback with customizable style
  impactCustom: (style?: Haptics.ImpactFeedbackStyle) => void;
  // Haptics enabled status
  isEnabled: boolean;
}

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

interface HapticsProviderProps {
  children: ReactNode;
}

// Haptics provider component for managing haptic feedback settings
export const HapticsProvider: React.FC<HapticsProviderProps> = ({
  children,
}) => {
  const { profile } = useAuth();

  // Check if haptics are enabled in user preferences
  const isEnabled = profile?.notificationPreferences?.haptics !== false;

  // Haptic feedback functions that respect user settings
  const medium = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const heavy = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const selection = () => {
    if (isEnabled) {
      Haptics.selectionAsync();
    }
  };

  const notification = (type: "success" | "warning" | "error" = "success") => {
    if (isEnabled) {
      let notificationType: Haptics.NotificationFeedbackType;
      switch (type) {
        case "success":
          notificationType = Haptics.NotificationFeedbackType.Success;
          break;
        case "warning":
          notificationType = Haptics.NotificationFeedbackType.Warning;
          break;
        case "error":
          notificationType = Haptics.NotificationFeedbackType.Error;
          break;
      }
      Haptics.notificationAsync(notificationType);
    }
  };

  const impactCustom = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
  ) => {
    if (isEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const value = useMemo(
    () => ({
      medium,
      heavy,
      selection,
      notification,
      impactCustom,
      isEnabled,
    }),
    [isEnabled],
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
};

// Custom hook to access haptics context
export const useHaptics = (): HapticsContextType => {
  const context = useContext(HapticsContext);
  if (context === undefined) {
    throw new Error("useHaptics must be used within a HapticsProvider");
  }
  return context;
};
