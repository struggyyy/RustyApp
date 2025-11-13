import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";

interface HeaderBackButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  disabled = false,
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
      style={styles.container}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name="arrow-back"
        size={24}
        color={disabled ? colors.text.secondary : colors.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HeaderBackButton;
