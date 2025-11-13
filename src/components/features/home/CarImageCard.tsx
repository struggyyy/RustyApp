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
import { StyleSheet } from "react-native";

// Internal imports
import styled from "styled-components/native";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";

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

const shadowStyles = StyleSheet.create({
  shadowMuted: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
});

export function CarImageCard() {
  return (
    <CarImageCardContainer style={shadowStyles.shadowMuted}>
      <CarDisplayImage
        source={require("../../../../assets/images/car-image.png")}
        resizeMode="cover"
      />
    </CarImageCardContainer>
  );
}
