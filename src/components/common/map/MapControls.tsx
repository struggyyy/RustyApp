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
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import colors from "@/core/theme/colors";
import FloatingActionButton from "@/components/common/buttons/FloatingActionButton";

export interface MapControlsProps {
  location: any;
  onGoToMyLocation: () => void;
  showExpandMap?: boolean;
  onExpandMap?: () => void;
  myLocationIcon?: keyof typeof MaterialIcons.glyphMap;
  expandIcon?: keyof typeof MaterialIcons.glyphMap;
  myLocationStyle?: any;
  expandStyle?: any;
}

export function MapControls({
  location,
  onGoToMyLocation,
  showExpandMap = false,
  onExpandMap,
  myLocationIcon = "my-location",
  expandIcon = "fullscreen",
  myLocationStyle = { position: "absolute", bottom: 20, right: 20 },
  expandStyle = { position: "absolute", bottom: 20, left: 20 },
}: MapControlsProps) {
  return (
    <>
      {location && (
        <FloatingActionButton
          onPress={onGoToMyLocation}
          style={myLocationStyle}
        >
          <MaterialIcons
            name={myLocationIcon}
            size={24}
            color={colors.primary}
          />
        </FloatingActionButton>
      )}
      {showExpandMap && onExpandMap && (
        <FloatingActionButton onPress={onExpandMap} style={expandStyle}>
          <MaterialIcons name={expandIcon} size={24} color={colors.primary} />
        </FloatingActionButton>
      )}
    </>
  );
}
