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
import { TouchableOpacity, StyleSheet } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import spacing from "../../../core/theme/spacing";

// Component props interface
interface HeaderBackButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

// Header back button component
const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  disabled = false,
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
      style={styles.container}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name="arrow-back"
        size={24}
        color={disabled ? colors.text.tertiary : colors.text.primary}
      />
    </TouchableOpacity>
  );
};

// Button container styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HeaderBackButton;
