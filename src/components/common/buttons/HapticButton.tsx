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
import React from "react";
import { TouchableOpacity, StyleProp, ViewStyle } from "react-native";

// Internal imports
import { useHaptics } from "@context/HapticsContext";

// Component props interface
interface HapticButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeOpacity?: number;
}

// Basic touchable button wrapper with haptic feedback
const HapticButton: React.FC<HapticButtonProps> = ({
  onPress,
  disabled = false,
  style,
  children,
  activeOpacity = 0.7,
}) => {
  const haptics = useHaptics();

  // Handle press with haptic feedback
  const handlePress = () => {
    if (!disabled) {
      haptics.heavy();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={style}
      activeOpacity={activeOpacity}
    >
      {children}
    </TouchableOpacity>
  );
};

export default HapticButton;
