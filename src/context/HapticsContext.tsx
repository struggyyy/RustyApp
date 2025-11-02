import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from './AuthContext';

// Define the shape of the Haptics Context
interface HapticsContextType {
  // Light haptic feedback (subtle)
  light: () => void;
  // Medium haptic feedback
  medium: () => void;
  // Heavy haptic feedback
  heavy: () => void;
  // Selection haptic feedback
  selection: () => void;
  // Notification haptic feedback
  notification: (type?: 'success' | 'warning' | 'error') => void;
  // Impact haptic feedback with customizable style
  impact: (style?: Haptics.ImpactFeedbackStyle) => void;
  // Haptics enabled status
  isEnabled: boolean;
}

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

interface HapticsProviderProps {
  children: ReactNode;
}

export const HapticsProvider: React.FC<HapticsProviderProps> = ({ children }) => {
  const { profile } = useAuth();

  // Check if haptics are enabled in user preferences
  const isEnabled = profile?.notificationPreferences?.haptics !== false;

  // Haptic functions that respect user settings
  const light = () => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

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

  const notification = (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isEnabled) {
      let notificationType: Haptics.NotificationFeedbackType;
      switch (type) {
        case 'success':
          notificationType = Haptics.NotificationFeedbackType.Success;
          break;
        case 'warning':
          notificationType = Haptics.NotificationFeedbackType.Warning;
          break;
        case 'error':
          notificationType = Haptics.NotificationFeedbackType.Error;
          break;
      }
      Haptics.notificationAsync(notificationType);
    }
  };

  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (isEnabled) {
      Haptics.impactAsync(style);
    }
  };

  const value = useMemo(() => ({
    light,
    medium,
    heavy,
    selection,
    notification,
    impact,
    isEnabled,
  }), [isEnabled]);

  return (
    <HapticsContext.Provider value={value}>
      {children}
    </HapticsContext.Provider>
  );
};

// Custom hook to use the Haptics Context
export const useHaptics = (): HapticsContextType => {
  const context = useContext(HapticsContext);
  if (context === undefined) {
    throw new Error('useHaptics must be used within a HapticsProvider');
  }
  return context;
};
