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
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";

// Internal imports
import colors from "../src/theme/colors";

// Styled Components
const StyledContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.primary,
});

const LoadingText = styled.Text({
  marginTop: 10,
  color: colors.text.primary,
});

// Initial loading screen while auth guard determines navigation
export default function Index() {
  return (
    <StyledContainer>
      <ActivityIndicator size="large" color={colors.primary} />
      <LoadingText>Loading...</LoadingText>
    </StyledContainer>
  );
}
