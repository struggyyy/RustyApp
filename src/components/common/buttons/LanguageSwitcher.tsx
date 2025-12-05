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
import React, { useEffect } from "react";

// External libraries
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

// Internal imports
import i18n from "@/core/i18n/i18n";
import theme from "@theme/index";
import colors from "@theme/colors";
import spacing from "@theme/spacing";
import typography from "@theme/typography";

// Component styles using StyleSheet for performance
const styles = StyleSheet.create({
  switcherContainer: {
    position: "absolute",
    top: spacing.M,
    right: spacing.M,
    zIndex: 100,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.XS,
    paddingHorizontal: spacing.component.buttonPadding,
    paddingVertical: spacing.S,
    borderRadius: spacing.radius.L,
    backgroundColor: colors.background.semiTransparent,
  },
  flagText: {
    fontSize: 20,
  },
  languageText: {
    fontSize: typography.fontSize.body2,
    fontWeight: "600",
    color: colors.text.dark,
  },
});

// Component props interface
interface LanguageSwitcherProps {
  onLanguageChange?: (language: "en" | "pl") => void;
}

// Language switcher component for auth screens
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
  // Current language state synced with i18n
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "pl">(
    i18n.language as "en" | "pl"
  );

  // Listen for i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng as "en" | "pl");
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  // Handle language change with haptic feedback
  const handleLanguageChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newLanguage = currentLanguage === "en" ? "pl" : "en";
    setCurrentLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  // Display opposite language for switching
  const displayLanguage = currentLanguage === "en" ? "pl" : "en";
  const flag = displayLanguage === "en" ? "🇬🇧" : "🇵🇱";
  const label = displayLanguage === "en" ? "English" : "Polski";

  return (
    <View style={styles.switcherContainer}>
      <TouchableOpacity
        style={[styles.languageButton, theme.shadows.card]}
        onPress={handleLanguageChange}
      >
        <Text style={styles.flagText}>{flag}</Text>
        <Text style={styles.languageText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSwitcher;
