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
import theme from "@theme/index";

interface AuthErrorCardProps {
  error: string | null | undefined;
  type?: "error" | "success" | "info";
}

const CardContainer = styled.View<{ type: "error" | "success" | "info" }>(
  ({ type }) => {
    let bg, border;
    switch (type) {
      case "success":
        bg = "rgba(76, 175, 80, 0.15)";
        border = "rgba(76, 175, 80, 0.3)";
        break;
      case "info":
        bg = "rgba(33, 150, 243, 0.15)";
        border = "rgba(33, 150, 243, 0.3)";
        break;
      case "error":
      default:
        bg = "rgba(198, 40, 40, 0.15)";
        border = "rgba(198, 40, 40, 0.3)";
        break;
    }
    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 1,
      borderRadius: theme.spacing.M,
      padding: theme.spacing.M,
      marginBottom: theme.spacing.M,
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    };
  }
);

const IconContainer = styled.View({
  marginRight: theme.spacing.S,
});

const MessageText = styled.Text<{ type: "error" | "success" | "info" }>(
  ({ type }) => {
    let color;
    switch (type) {
      case "success":
        color = theme.colors.success;
        break;
      case "info":
        color = theme.colors.info;
        break;
      case "error":
      default:
        color = theme.colors.error;
        break;
    }
    return {
      color,
      fontSize: theme.typography.fontSize.body2,
      flex: 1,
      fontWeight: "500",
    };
  }
);

export const AuthErrorCard: React.FC<AuthErrorCardProps> = ({
  error,
  type = "error",
}) => {
  if (!error) return null;

  let iconName: keyof typeof Ionicons.glyphMap = "alert-circle-outline";
  let iconColor = theme.colors.error;

  if (type === "success") {
    iconName = "checkmark-circle-outline";
    iconColor = theme.colors.success;
  } else if (type === "info") {
    iconName = "information-circle-outline";
    iconColor = theme.colors.info;
  }

  return (
    <CardContainer type={type}>
      <IconContainer>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </IconContainer>
      <MessageText type={type}>{error}</MessageText>
    </CardContainer>
  );
};
