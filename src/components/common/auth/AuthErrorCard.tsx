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

// External libraries
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

// Internal imports
import theme from "@/core/theme";

interface AuthErrorCardProps {
  error: string | null | undefined;
}

const CardContainer = styled.View({
  backgroundColor: "rgba(198, 40, 40, 0.15)", // Red with opacity for glassy feel
  borderColor: "rgba(198, 40, 40, 0.3)",
  borderWidth: 1,
  borderRadius: theme.spacing.M,
  padding: theme.spacing.M,
  marginBottom: theme.spacing.M,
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
});

const IconContainer = styled.View({
  marginRight: theme.spacing.S,
});

const ErrorText = styled.Text({
  color: theme.colors.error,
  fontSize: theme.typography.fontSize.body2,
  flex: 1, // Allow text to wrap
  fontWeight: "500",
});

export const AuthErrorCard: React.FC<AuthErrorCardProps> = ({ error }) => {
  if (!error) return null;

  return (
    <CardContainer>
      <IconContainer>
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={theme.colors.error}
        />
      </IconContainer>
      <ErrorText>{error}</ErrorText>
    </CardContainer>
  );
};
