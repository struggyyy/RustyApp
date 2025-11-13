import React from "react";
import { StyleProp, ViewStyle, StyleSheet } from "react-native";
import styled from "styled-components/native";
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import theme from "../../../core/theme";


interface FloatingActionButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: number;
  backgroundColor?: string;
  children: React.ReactNode;
}

interface StyledProps {
  size: number;
  backgroundColor?: string;
  disabled: boolean;
}

const FloatingButtonContainer = styled.TouchableOpacity<StyledProps>((props: StyledProps) => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  backgroundColor: props.disabled ? colors.text.secondary : (props.backgroundColor || "rgba(255, 255, 255, 0.9)"),
  justifyContent: "center",
  alignItems: "center",
  // Remove shadow properties from styled-components - apply via style prop
}));

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  disabled = false,
  style,
  size = 48,
  backgroundColor,
  children,
}) => {
  const haptics = useHaptics();

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
