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
import i18n from "../../../i18n/i18n";

const styles = StyleSheet.create({
  switcherContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flagText: {
    fontSize: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

interface LanguageSwitcherProps {
  onLanguageChange?: (language: "en" | "pl") => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
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

  const handleLanguageChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newLanguage = currentLanguage === "en" ? "pl" : "en";
    setCurrentLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  // Show the opposite language (the one you can switch TO)
  const displayLanguage = currentLanguage === "en" ? "pl" : "en";
  const flag = displayLanguage === "en" ? "🇬🇧" : "🇵🇱";
  const label = displayLanguage === "en" ? "English" : "Polski";

  return (
    <View style={styles.switcherContainer}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={handleLanguageChange}
      >
        <Text style={styles.flagText}>{flag}</Text>
        <Text style={styles.languageText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSwitcher;
