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
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import theme from "../../../core/theme";

// Component props interface
interface FloatingActionButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: number;
  backgroundColor?: string;
  children: React.ReactNode;
}

// Styled component props interface
interface StyledProps {
  size: number;
  backgroundColor?: string;
  disabled: boolean;
}

// Floating action button styled component
const FloatingButtonContainer = styled.TouchableOpacity<StyledProps>((props: StyledProps) => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  backgroundColor: props.disabled ? colors.text.primary : (props.backgroundColor || colors.background.semiTransparent),
  justifyContent: "center",
  alignItems: "center",
}));

// Main floating action button component
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  disabled = false,
  style,
  size = 48,
  backgroundColor,
  children,
}) => {
  const haptics = useHaptics();

  // Handle press with haptic feedback
  const handlePress = () => {
    if (!disabled) {
      haptics.heavy();
      onPress();
    }
  };

  return (
    <FloatingButtonContainer
      onPress={handlePress}
      disabled={disabled}
      size={size}
      backgroundColor={backgroundColor}
      style={[style, theme.shadows.button]}
      activeOpacity={0.7}
    >
      {children}
    </FloatingButtonContainer>
  );
};

export default FloatingActionButton;
