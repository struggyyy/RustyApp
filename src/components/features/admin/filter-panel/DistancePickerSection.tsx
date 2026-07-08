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
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// Internal imports
import theme from "@theme/index";
import CustomWheelPicker from "./CustomWheelPicker";

interface DistancePickerSectionProps {
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  style?: any;
}

// Distance picker section with wheel picker for selecting radius in km
const DistancePickerSection: React.FC<DistancePickerSectionProps> = ({
  maxDistance,
  onDistanceChange,
  style,
}) => {
  const [selectedDistanceIndex, setSelectedDistanceIndex] = useState(
    (maxDistance || 5) - 1,
  );

  // Distance options from 1 to 50 km
  const distanceOptions = Array.from({ length: 50 }, (_, i) =>
    (i + 1).toString(),
  );

  // Set default values if not already set
  useEffect(() => {
    if (maxDistance === null) {
      onDistanceChange(5);
    }
  }, []);

  // Update selected index when maxDistance changes
  useEffect(() => {
    if (maxDistance) {
      setSelectedDistanceIndex(maxDistance - 1);
    }
  }, [maxDistance]);

  const handleDistanceChange = (index: number) => {
    setSelectedDistanceIndex(index);
    const distance = parseInt(distanceOptions[index]);
    onDistanceChange(distance);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <CustomWheelPicker
            selectedIndex={selectedDistanceIndex}
            options={distanceOptions}
            onChange={handleDistanceChange}
            itemHeight={40}
            containerStyle={{ width: 100, height: 200 }}
            itemTextStyle={{
              fontSize: 16,
              color: theme.colors.text.primary,
            }}
            visibleRest={2}
          />
        </View>
        <Text style={styles.pickerLabel}>km</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  pickerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.radius.L,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    padding: 12,
    alignSelf: "center",
  },
  pickerWrapper: {
    width: "100%",
    alignItems: "center",
    height: 200,
    justifyContent: "center",
  },
  pickerLabel: {
    fontSize: theme.typography.fontSize.h5,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginTop: theme.spacing.S,
  },
});

export default DistancePickerSection;
