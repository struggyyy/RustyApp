import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import styled from "styled-components/native";
import theme from "../../theme";
import { useHaptics } from "../../context/HapticsContext";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  buttonShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
});

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
}>(
  (props: {
    isDisabled: boolean;
    variant: "primary" | "secondary";
  }) => ({
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
  })
);

const ButtonLabel = styled.Text<{ textColor?: string }>`
  color: ${(props: { textColor?: string }) => props.textColor || theme.colors.white};
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
      haptics.light();
      onPress();
    }
  };

  return (
    <ButtonTouchable
      onPress={handlePress}
      disabled={disabled || loading}
      isDisabled={disabled || loading}
      variant={variant}
      style={[shadowStyles.buttonShadow, style]}
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
