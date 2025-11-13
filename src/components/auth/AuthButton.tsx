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
import theme from "@/theme";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const StyledButton = styled.TouchableOpacity<AuthButtonProps>(
  (props: AuthButtonProps) => ({
    backgroundColor: props.isDisabled
      ? theme.colors.background.secondary
      : theme.colors.primary,
    borderRadius: theme.spacing.M,
    padding: theme.spacing.M,
    alignItems: "center",
    marginTop: theme.spacing.S,
    opacity: props.isDisabled || props.isLoading ? 0.6 : 1,
  })
);

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

export function AuthButton({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}: AuthButtonProps) {
  return (
    <StyledButton
      onPress={onPress}
      isDisabled={isDisabled}
      disabled={isDisabled || isLoading}
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
