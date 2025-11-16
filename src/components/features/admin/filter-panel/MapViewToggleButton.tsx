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
import { TouchableOpacity, StyleSheet } from "react-native";

// External libraries
import { MaterialIcons } from "@expo/vector-icons";

// Internal imports
import theme from "../../../../core/theme";
import { useHaptics } from "../../../../core/context/HapticsContext";

interface MapViewToggleButtonProps {
  isMapView: boolean;
  onPress: () => void;
  size?: number;
  style?: any;
}

// Circular button that toggles between map and list view
const MapViewToggleButton: React.FC<MapViewToggleButtonProps> = ({
  isMapView,
  onPress,
  size = 56,
  style,
}) => {
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.heavy();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <MaterialIcons
        name={isMapView ? "view-list" : "location-on"}
        size={28}
        color={theme.colors.white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});

export default MapViewToggleButton;
