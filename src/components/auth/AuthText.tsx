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
import { Text } from "react-native";

// Internal imports
import styled from "styled-components/native";
import theme from "@/theme";

interface AuthLinkProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export const AuthTitle = styled.Text({
  fontSize: theme.typography.fontSize.h1,
  fontWeight: "bold",
  marginBottom: theme.spacing.S,
  textAlign: "center",
  color: theme.colors.text.primary,
});

export const AuthSubtitle = styled.Text({
  fontSize: theme.typography.fontSize.body1,
  marginBottom: theme.spacing.XL,
  textAlign: "center",
  color: theme.colors.text.secondary,
});

export const AuthErrorText = styled.Text({
  color: theme.colors.error,
  marginBottom: theme.spacing.M,
  textAlign: "center",
  fontSize: theme.typography.fontSize.body1,
});

export const AuthLink = styled.Text<AuthLinkProps>((props: AuthLinkProps) => ({
  color: props.disabled ? theme.colors.text.disabled : theme.colors.primary,
  fontSize: theme.typography.fontSize.body2,
  fontWeight: "bold",
  textAlign: "center",
  marginTop: theme.spacing.L,
}));

export const AuthLinkButton = ({
  children,
  onPress,
  disabled = false,
}: AuthLinkProps) => (
  <AuthLink as={Text} onPress={onPress} disabled={disabled}>
    {children}
  </AuthLink>
);
