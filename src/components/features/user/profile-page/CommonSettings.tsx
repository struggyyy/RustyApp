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
import { Switch } from "react-native";

// Internal imports
import styled from "styled-components/native";
import colors from "@theme/colors";
import spacing from "@theme/spacing";
import { useHaptics } from "@context/HapticsContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";

interface CommonSettingsProps {
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  language: string;
  isSubmitting: boolean;
  onToggleNotifications: (value: boolean) => void;
  onToggleHaptics: (value: boolean) => void;
  onToggleLanguage: () => void;
}

const NotificationRow = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.M,
});

const NotificationLabel = styled.Text({
  fontSize: 16,
  color: colors.text.primary,
});

const LanguageToggle = styled.TouchableOpacity({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.M,
  paddingVertical: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.background.secondary,
  marginBottom: spacing.M,
});

const LanguageOption = styled.View<{ isSelected: boolean }>(
  (props: { isSelected: boolean }) => ({
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.S,
  }),
);

const LanguageText = styled.Text<{ isSelected: boolean }>(
  (props: { isSelected: boolean }) => ({
    fontSize: 16,
    fontWeight: props.isSelected ? "600" : "400",
    color: props.isSelected ? colors.primary : colors.text.primary,
  }),
);

// Common settings component shared between admin and user variants
const CommonSettings: React.FC<CommonSettingsProps> = ({
  notificationsEnabled,
  hapticsEnabled,
  language,
  isSubmitting,
  onToggleNotifications,
  onToggleHaptics,
  onToggleLanguage,
}) => {
  const haptics = useHaptics();
  const { t } = useTranslation();

  return (
    <>
      <NotificationRow>
        <NotificationLabel>
          {t("settings.enableNotifications")}
        </NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={(value) => {
            haptics.heavy();
            onToggleNotifications(value);
          }}
          value={notificationsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <NotificationRow>
        <NotificationLabel>{t("settings.enableHaptics")}</NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={(value) => {
            haptics.heavy();
            onToggleHaptics(value);
          }}
          value={hapticsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <LanguageToggle
        onPress={() => {
          haptics.heavy();
          onToggleLanguage();
        }}
      >
        <LanguageOption isSelected={language === "en"}>
          <LanguageText isSelected={language === "en"}>
            🇬🇧 {t("settings.english")}
          </LanguageText>
        </LanguageOption>
        <LanguageOption isSelected={language === "pl"}>
          <LanguageText isSelected={language === "pl"}>
            🇵🇱 {t("settings.polish")}
          </LanguageText>
        </LanguageOption>
      </LanguageToggle>
    </>
  );
};

export default CommonSettings;
