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

// Internal imports
import styled from "styled-components/native";
import colors from "@/core/theme/colors";
import spacing from "@/core/theme/spacing";
import theme from "@/core/theme";

const CarImageCardContainer = styled.View({
  width: "100%",
  aspectRatio: 1.3,
  backgroundColor: colors.background.secondary,
  borderRadius: spacing.L,
  marginBottom: spacing.L,
  overflow: "hidden",
});

const CarDisplayImage = styled.Image({
  width: "100%",
  height: "100%",
});


export function CarImageCard() {
  return (
    <CarImageCardContainer style={theme.shadows.muted}>
      <CarDisplayImage
        source={require("../../../../assets/images/car-image.png")}
        resizeMode="cover"
      />
    </CarImageCardContainer>
  );
}
