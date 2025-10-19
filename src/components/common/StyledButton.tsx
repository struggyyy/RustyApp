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

interface StyledButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  isWeb?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
}

const ButtonTouchable = styled.TouchableOpacity<{
  isDisabled: boolean;
  isWeb?: boolean;
  variant: "primary" | "secondary";
}>(
  (props: {
    isDisabled: boolean;
    isWeb?: boolean;
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    width: "100%",
    ...(props.isWeb && {
      maxWidth: 600,
      alignSelf: "center",
    }),
  })
);

const ButtonLabel = styled.Text`
  color: ${theme.colors.white};
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
}) => {
  const isWeb = Platform.OS === "web";

  return (
    <ButtonTouchable
      onPress={onPress}
      disabled={disabled || loading}
      isDisabled={disabled || loading}
      isWeb={isWeb}
      variant={variant}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <ButtonLabel>{title}</ButtonLabel>
      )}
    </ButtonTouchable>
  );
};

export default StyledButton;
