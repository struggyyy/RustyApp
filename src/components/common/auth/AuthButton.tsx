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
 * ************************************************************************** */
// React-specific imports
import React from "react";

// Internal imports
import theme from "@theme/index";
import StyledButton from "@components/common/buttons/StyledButton";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isDisabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary";
}

// Main auth button component with loading and variant support
export function AuthButton({
  title,
  onPress,
  isDisabled = false,
  loading = false,
  loadingText,
  variant = "primary",
}: AuthButtonProps) {
  return (
    <StyledButton
      title={title}
      onPress={onPress}
      disabled={isDisabled}
      loading={loading}
      loadingText={loadingText}
      variant={variant}
      style={{ marginTop: theme.spacing.S }}
    />
  );
}
