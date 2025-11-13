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
import {
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";

// External libraries
import styled from "styled-components/native";

// Internal imports
import theme from "../../../core/theme";
import { useHaptics } from "../../../core/context/HapticsContext";


interface StyledButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  isWeb?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

const ButtonTouchable = styled.TouchableOpacity<{
  isDisabled: boolean;
  variant: "primary" | "secondary";
}>((props: { isDisabled: boolean; variant: "primary" | "secondary" }) => ({
  backgroundColor:
    props.variant === "secondary"
      ? theme.colors.text.secondary
      : props.isDisabled
      ? theme.colors.primary
      : theme.colors.primary,
  borderRadius: 16,
  padding: 16,
  alignItems: "center",
  marginBottom: 24,
  width: "100%",
  opacity: props.isDisabled ? 0.3 : 1,
}));

const ButtonLabel = styled.Text<{ textColor?: string }>`
  color: ${(props: { textColor?: string }) =>
    props.textColor || theme.colors.white};
  font-size: 18px;
  font-weight: bold;
`;

const StyledButton: React.FC<StyledButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  textColor,
}) => {
  const haptics = useHaptics();

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
      style={[theme.shadows.button, style]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <ButtonLabel textColor={textColor}>{title}</ButtonLabel>
      )}
    </ButtonTouchable>
  );
};

export default StyledButton;
