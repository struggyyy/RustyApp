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
import { ActivityIndicator } from "react-native";

// Internal imports
import styled from "styled-components/native";
import theme from "@/core/theme";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

const StyledButton = styled.TouchableOpacity.attrs<{
  isDisabled: boolean;
  isLoading: boolean;
  variant: "primary" | "secondary";
}>((props) => ({
  disabled: props.isDisabled || props.isLoading,
}))`
  background-color: ${(props) =>
    props.variant === "secondary"
      ? theme.colors.text.primary
      : props.isDisabled
      ? theme.colors.background.secondary
      : theme.colors.primary};
  border-radius: ${theme.spacing.M}px;
  padding: ${theme.spacing.M}px;
  align-items: center;
  margin-top: ${theme.spacing.S}px;
  opacity: ${(props) => (props.isDisabled || props.isLoading ? 0.6 : 1)};
`;

const ButtonText = styled.Text({
  color: theme.colors.text.inverse,
  fontWeight: "bold",
  fontSize: theme.typography.fontSize.button,
});

const ButtonContent = styled.View({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.S,
});

// Main auth button component with loading and variant support
export function AuthButton({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
  variant = "primary",
}: AuthButtonProps) {
  return (
    <StyledButton
      onPress={onPress}
      isDisabled={isDisabled}
      isLoading={isLoading}
      variant={variant}
    >
      <ButtonContent>
        {isLoading && (
          <ActivityIndicator size="small" color={theme.colors.text.inverse} />
        )}
        <ButtonText>{title}</ButtonText>
      </ButtonContent>
    </StyledButton>
  );
}
