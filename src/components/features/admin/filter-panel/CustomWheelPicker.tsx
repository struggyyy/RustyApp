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
import { FlatList, View, Text, StyleSheet } from "react-native";

// Internal imports
import theme from "@theme/index";
import { useHaptics } from "@context/HapticsContext";

interface CustomWheelPickerProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  containerStyle?: any;
  itemTextStyle?: any;
  visibleRest?: number;
}

// Wheel picker styles
const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  selectedIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    pointerEvents: "none",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    backgroundColor: "transparent",
  },
  triangle: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: theme.colors.white,
    borderTopWidth: 0,
  },
  pickerItem: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 16,
  },
  pickerTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  pickerTextUnselected: {
    color: theme.colors.text.primary,
    fontWeight: "400",
  },
});

const CustomWheelPicker: React.FC<CustomWheelPickerProps> = ({
  options,
  selectedIndex,
  onChange,
  itemHeight = 40,
  containerStyle,
  itemTextStyle,
  visibleRest = 2,
}) => {
  const haptics = useHaptics();
  const flatListRef = React.useRef<FlatList>(null);
  const hasInitialized = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const selectedIndexRef = React.useRef(selectedIndex);
  const onChangeRef = React.useRef(onChange);
  const lastHapticIndex = React.useRef<number | null>(null);

  // Update refs when props change
  React.useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    onChangeRef.current = onChange;
    lastHapticIndex.current = selectedIndex; // Reset haptic tracking
  }, [selectedIndex, onChange]);

  // Calculate the height to show visibleRest items above and below the selected one
  const containerHeight = itemHeight * (visibleRest * 2 + 1);

  // Calculate the initial scroll offset for the selected item
  const getInitialScrollOffset = () => {
    const centerOffset = containerHeight / 2 - itemHeight / 2;
    const itemOffset = visibleRest * itemHeight + itemHeight * selectedIndex;
    return Math.max(0, itemOffset - centerOffset);
  };

  const initialScrollOffset = getInitialScrollOffset();

  // Handle selectedIndex changes after initial render
  React.useEffect(() => {
    if (hasInitialized.current && flatListRef.current) {
      const offset = getInitialScrollOffset();
      flatListRef.current.scrollToOffset({
        offset,
        animated: true,
      });
    }
    hasInitialized.current = true;
  }, [selectedIndex, visibleRest]);

  // Handle scroll events with timeout-based snapping
  const handleScroll = React.useCallback(
    (event: any) => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Store the current offset for the timeout callback
      const currentOffset = event.nativeEvent.contentOffset.y;
      const currentIndex = Math.round(currentOffset / itemHeight);

      // Provide light haptic feedback when crossing item boundaries
      if (
        lastHapticIndex.current !== null &&
        lastHapticIndex.current !== currentIndex
      ) {
        haptics.heavy();
      }
      lastHapticIndex.current = currentIndex;

      // Set new timeout to handle snapping after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        const exactIndex = currentOffset / itemHeight;
        const newIndex = Math.round(exactIndex);

        // Update selection if changed
        if (
          newIndex !== selectedIndexRef.current &&
          newIndex >= 0 &&
          newIndex < options.length
        ) {
          onChangeRef.current(newIndex);
          // Medium haptic feedback when snapping to a new selection
          haptics.heavy();
        } else {
          // Even if selection didn't change, ensure we're snapped to the correct position
          const targetOffset = selectedIndexRef.current * itemHeight;
          if (Math.abs(currentOffset - targetOffset) > 2) {
            flatListRef.current?.scrollToOffset({
              offset: targetOffset,
              animated: true,
            });
            // Light haptic feedback for position correction
            haptics.heavy();
          }
        }
      }, 200); // Wait 200ms after scroll events stop for smoother feel
    },
    [itemHeight, options.length]
  ); // Only depend on stable values

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.pickerItem}>
      <Text
        style={[
          styles.pickerText,
          index === selectedIndex
            ? styles.pickerTextSelected
            : styles.pickerTextUnselected,
          itemTextStyle,
        ]}
      >
        {item}
      </Text>
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: itemHeight,
    offset: visibleRest * itemHeight + itemHeight * index,
    index,
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.selectedIndicator}>
        <View style={styles.circle} />
        <View style={styles.triangle} />
      </View>
      <FlatList
        ref={flatListRef}
        data={options}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        style={{ height: containerHeight }}
        contentContainerStyle={{
          paddingTop: visibleRest * itemHeight,
          paddingBottom: visibleRest * itemHeight,
        }}
        contentOffset={{ x: 0, y: initialScrollOffset }}
      />
    </View>
  );
};

export default CustomWheelPicker;
