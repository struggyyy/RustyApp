import React from "react";
import { StyleProp, ViewStyle, StyleSheet } from "react-native";
import styled from "styled-components/native";
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import theme from "../../../core/theme";


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

interface IconButtonContainerProps {
  size: number;
  backgroundColor?: string;
  disabled: boolean;
}

interface TouchableContainerProps {
  size: number;
}

const IconButtonContainer = styled.View<IconButtonContainerProps>((props: IconButtonContainerProps) => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  backgroundColor: props.disabled ? colors.text.secondary : (props.backgroundColor || "transparent"),
  justifyContent: "center",
  alignItems: "center",
}));

const TouchableContainer = styled.TouchableOpacity<TouchableContainerProps>((props: TouchableContainerProps) => ({
  width: props.size,
  height: props.size,
  borderRadius: props.size / 2,
  justifyContent: "center",
  alignItems: "center",
}));

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

  const handlePress = () => {
    if (!disabled) {
      haptics.heavy();
      onPress();
    }
  };

  const containerStyle = withShadow
    ? [style, theme.shadows.button]
    : style;

  return (
    <TouchableContainer
      onPress={handlePress}
      disabled={disabled}
      size={size}
      style={containerStyle}
      activeOpacity={0.7}
    >
      <IconButtonContainer
        size={size}
        backgroundColor={backgroundColor}
        disabled={disabled}
      >
        {React.cloneElement(children as React.ReactElement<any>, {
          size: iconSize || size * 0.6, // Default to 60% of button size for better visibility
          color: disabled ? colors.text.secondary : color,
        })}
      </IconButtonContainer>
    </TouchableContainer>
  );
};

export default IconButton;
