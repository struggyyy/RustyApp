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
import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

// Internal imports
import styled from "styled-components/native";
import theme from "@/theme";

interface AuthInputProps extends TextInputProps {
  hasError?: boolean;
}

const StyledInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})<AuthInputProps>((props: AuthInputProps) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.spacing.M,
  padding: theme.spacing.M,
  marginBottom: theme.spacing.M,
  borderWidth: 1,
  borderColor: props.hasError
    ? theme.colors.error
    : theme.colors.border.default,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.input,
}));

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ hasError, ...props }, ref) => {
    return <StyledInput ref={ref} hasError={hasError} {...props} />;
  }
);

AuthInput.displayName = "AuthInput";
