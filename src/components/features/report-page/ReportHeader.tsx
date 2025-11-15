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
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import colors from "../../../core/theme/colors";
import { typography, spacing } from "../../../core/theme";

// Styled components
const HeaderContainer = styled.View({
  alignItems: "center",
  width: "100%",
});

const Title = styled.Text({
  fontSize: typography.fontSize.h3,
  fontWeight: "bold",
  color: colors.text.primary,
  textAlign: "center",
  marginBottom: spacing.XS,
});

const Subtitle = styled.Text({
  fontSize: typography.fontSize.body2,
  color: colors.text.tertiary,
  textAlign: "center",
  marginBottom: spacing.M,
  lineHeight: "20px",
});

// Header component for the report creation screen
export const ReportHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Title>{t("reports.newReport")}</Title>
      <Subtitle>{t("reports.descriptionPlaceholder")}</Subtitle>
    </HeaderContainer>
  );
};
