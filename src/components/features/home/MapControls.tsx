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
import { Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import colors from "@/theme/colors";
import FloatingActionButton from "@/components/common/buttons/FloatingActionButton";

const isWeb = Platform.OS === "web";

interface MapControlsProps {
  location: any;
  onGoToMyLocation: () => void;
  onExpandMap: () => void;
}

export function MapControls({
  location,
  onGoToMyLocation,
  onExpandMap,
}: MapControlsProps) {
  if (isWeb || !location) {
    return null;
  }

  return (
    <>
      <FloatingActionButton
        onPress={onGoToMyLocation}
        style={{ position: "absolute", bottom: 20, right: 20 }}
      >
        <MaterialIcons name="my-location" size={24} color={colors.primary} />
      </FloatingActionButton>
      <FloatingActionButton
        onPress={onExpandMap}
        style={{ position: "absolute", bottom: 20, left: 20 }}
      >
        <MaterialIcons name="fullscreen" size={24} color={colors.primary} />
      </FloatingActionButton>
    </>
  );
}
