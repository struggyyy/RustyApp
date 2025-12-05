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
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";

// External libraries
import styled from "styled-components/native";

// Internal imports
import theme from "@theme/index";
import spacing from "@theme/spacing";
import typography from "@theme/typography";
import { useHaptics } from "@context/HapticsContext";

// Component props interface
interface StyledButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  isWeb?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

// Primary button styled component with conditional styling
const ButtonTouchable = styled.TouchableOpacity<{
  isDisabled: boolean;
  variant: "primary" | "secondary";
}>((props: { isDisabled: boolean; variant: "primary" | "secondary" }) => ({
  backgroundColor:
    props.variant === "secondary"
      ? theme.colors.text.primary
      : props.isDisabled
      ? theme.colors.primary
      : theme.colors.primary,
  borderRadius: spacing.radius.M,
  padding: spacing.M,
  alignItems: "center",
  marginBottom: spacing.L,
  width: "100%",
  opacity: props.isDisabled ? 0.3 : 1,
}));

// Button text styled component
const ButtonLabel = styled.Text<{ textColor?: string }>((props) => ({
  color: props.textColor || theme.colors.white,
  fontSize: typography.fontSize.h5,
  fontWeight: "bold",
}));

// Main styled button component with loading and variant support
const StyledButton: React.FC<StyledButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  loadingText,
  variant = "primary",
  style,
  textColor,
}) => {
  const haptics = useHaptics();

  // Handle press with haptic feedback and loading check
  const handlePress = () => {
    if (!disabled && !loading) {
      haptics.heavy();
      onPress();
    }
  };

  return (
    <ButtonTouchable
      onPress={handlePress}
      disabled={disabled || loading}
      isDisabled={disabled || loading}
      variant={variant}
      style={[
        theme.shadows.button,
        style,
        { flexDirection: "row", justifyContent: "center", gap: spacing.S },
      ]}
    >
      {loading && <ActivityIndicator color={theme.colors.white} />}
      <ButtonLabel textColor={textColor}>
        {loading && loadingText ? loadingText : title}
      </ButtonLabel>
    </ButtonTouchable>
  );
};

export default StyledButton;
