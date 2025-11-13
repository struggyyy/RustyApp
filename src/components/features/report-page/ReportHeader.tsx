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

// Internal imports
import { useTranslation } from "../../../hooks/useTranslation";
import colors from "../../../theme/colors";
import spacing from "../../../theme/spacing";

// Styled components
const HeaderContainer = styled.View({
  alignItems: "center",
  width: "100%",
});

const Title = styled.Text({
  fontSize: 22,
  fontWeight: "bold",
  color: colors.text.primary,
  textAlign: "center",
  marginBottom: spacing.xs,
});

const Subtitle = styled.Text({
  fontSize: 14,
  color: colors.text.secondary,
  textAlign: "center",
  marginBottom: spacing.md,
  lineHeight: "20px",
});

export const ReportHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Title>{t("reports.newReport")}</Title>
      <Subtitle>{t("reports.descriptionPlaceholder")}</Subtitle>
    </HeaderContainer>
  );
};
