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
import { StyleProp, ViewStyle } from "react-native";

// External libraries
import styled from "styled-components/native";

// Internal imports
import { useHaptics } from "@context/HapticsContext";
import colors from "@theme/colors";
import theme from "@theme/index";

// Component props interface
interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
  backgroundColor?: string;
  iconSize?: number;
  children: React.ReactNode;
  withShadow?: boolean;
}

// Styled component props interface
interface IconButtonContainerProps {
  size: number;
  backgroundColor?: string;
  disabled: boolean;
}

// Icon button styled component
const IconButtonContainer = styled.TouchableOpacity<IconButtonContainerProps>(
  (props: IconButtonContainerProps) => ({
    width: props.size,
    height: props.size,
    borderRadius: props.size / 2,
    backgroundColor: props.disabled
      ? colors.text.tertiary
      : props.backgroundColor || "transparent",
    justifyContent: "center",
    alignItems: "center",
  }),
);

// Main icon button component
const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  disabled = false,
  style,
  size = 48,
  color = colors.text.primary,
  backgroundColor,
  iconSize,
  children,
  withShadow = false,
}) => {
  const haptics = useHaptics();

  // Handle press with haptic feedback
  const handlePress = () => {
    if (!disabled) {
      haptics.heavy();
      onPress();
    }
  };

  // Apply shadow styles conditionally
  const containerStyle = withShadow ? [style, theme.shadows.button] : style;

  return (
    <IconButtonContainer
      onPress={handlePress}
      disabled={disabled}
      size={size}
      backgroundColor={backgroundColor}
      style={containerStyle}
      activeOpacity={0.7}
    >
      {React.cloneElement(children as React.ReactElement<any>, {
        size: iconSize || size * 0.6, // Default to 60% of button size for better visibility
        color: disabled ? colors.text.tertiary : color,
      })}
    </IconButtonContainer>
  );
};

export default IconButton;
