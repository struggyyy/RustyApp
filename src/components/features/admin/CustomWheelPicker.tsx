import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../../theme';
import { useHaptics } from '../../../context/HapticsContext';

interface CustomWheelPickerProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  containerStyle?: any;
  itemTextStyle?: any;
  visibleRest?: number;
}

const PickerContainer = styled.View`
  position: relative;
`;

const SelectedIndicator = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -20px;
  margin-top: -20px;
  width: 40px;
  height: 40px;
  pointer-events: none;
`;

const Circle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 4px;
  border-color: ${theme.colors.primary};
  background-color: transparent;
`;

const Triangle = styled.View`
  position: absolute;
  top: 20px;
  left: 50%;
  margin-left: -6px;
  width: 0;
  height: 0;
  border-left-width: 6px;
  border-right-width: 6px;
  border-bottom-width: 6px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom-color: ${theme.colors.white};
  border-top-width: 0;
`;

const PickerItem = styled.View<{ isSelected: boolean }>`
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const PickerText = styled.Text<{ isSelected: boolean }>`
  font-size: 16px;
  color: ${(props: { isSelected: boolean }) =>
    props.isSelected ? theme.colors.primary : theme.colors.text.secondary};
  font-weight: ${(props: { isSelected: boolean }) =>
    props.isSelected ? '600' : '400'};
`;

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
    const itemOffset = (visibleRest * itemHeight) + (itemHeight * selectedIndex);
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
  const handleScroll = React.useCallback((event: any) => {
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Store the current offset for the timeout callback
    const currentOffset = event.nativeEvent.contentOffset.y;
    const currentIndex = Math.round(currentOffset / itemHeight);

    // Provide light haptic feedback when crossing item boundaries
    if (lastHapticIndex.current !== null && lastHapticIndex.current !== currentIndex) {
      haptics.heavy();
    }
    lastHapticIndex.current = currentIndex;

    // Set new timeout to handle snapping after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      const exactIndex = currentOffset / itemHeight;
      const newIndex = Math.round(exactIndex);

      // Update selection if changed
      if (newIndex !== selectedIndexRef.current && newIndex >= 0 && newIndex < options.length) {
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
  }, [itemHeight, options.length]); // Only depend on stable values

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <PickerItem isSelected={index === selectedIndex}>
      <PickerText
        isSelected={index === selectedIndex}
        style={itemTextStyle}
      >
        {item}
      </PickerText>
    </PickerItem>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: itemHeight,
    offset: (visibleRest * itemHeight) + (itemHeight * index),
    index,
  });

  return (
    <PickerContainer style={containerStyle}>
      <SelectedIndicator>
        <Circle />
        <Triangle />
      </SelectedIndicator>
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
    </PickerContainer>
  );
};

export default CustomWheelPicker;
