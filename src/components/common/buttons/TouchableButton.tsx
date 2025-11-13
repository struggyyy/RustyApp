import React from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { useHaptics } from "../../../core/context/HapticsContext";

interface TouchableButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeOpacity?: number;
}

const TouchableButton: React.FC<TouchableButtonProps> = ({
  onPress,
  disabled = false,
  style,
  children,
  activeOpacity = 0.7,
}) => {
  const haptics = useHaptics();

  const handlePress = () => {
    if (!disabled) {
      haptics.heavy();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={style}
      activeOpacity={activeOpacity}
    >
      {children}
    </TouchableOpacity>
  );
};

export default TouchableButton;
