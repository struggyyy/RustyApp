/******************************************************************************
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
 ***************************************************************************/
// React-specific imports
import React, { useState } from "react";

// External libraries
import { Feather } from "@expo/vector-icons";

// Internal imports
import styled from "styled-components/native";
import StyledButton from "../../common/buttons/StyledButton";
import colors from "../../../core/theme/colors";
import theme from "../../../core/theme";
import spacing from "../../../core/theme/spacing";
import { useHaptics } from "../../../core/context/HapticsContext";
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import CommonSettings from "./CommonSettings";

interface SettingsCardProps {
  variant: "admin" | "user";
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  language: string;
  isSubmitting: boolean;
  authLoading: boolean;
  onToggleNotifications: (value: boolean) => void;
  onToggleHaptics: (value: boolean) => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  onDeleteAccount?: () => void; // Only for user
}

const SettingsCard = styled.View({
  backgroundColor: colors.background.secondary,
  borderRadius: spacing.radius.XL,
  padding: spacing.component.modalPadding,
  marginBottom: 12,
});

const SettingsHeader = styled.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.M,
});

const SettingsTitle = styled.Text({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.text.primary,
});

const ExpandArrow = styled.TouchableOpacity({
  alignItems: "center",
  padding: spacing.S,
  marginTop: spacing.M,
});

const DeleteAccountButton = styled.TouchableOpacity({
  paddingHorizontal: spacing.M,
  paddingVertical: 8,
  alignItems: "center",
  marginTop: 4,
});

const DeleteAccountText = styled.Text({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.text.primary,
});

const SettingsCardComponent: React.FC<SettingsCardProps> = ({
  variant,
  notificationsEnabled,
  hapticsEnabled,
  language,
  isSubmitting,
  authLoading,
  onToggleNotifications,
  onToggleHaptics,
  onToggleLanguage,
  onLogout,
  onDeleteAccount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const haptics = useHaptics();
  const { t } = useTranslation();

  if (variant === "admin") {
    return (
      <SettingsCard style={theme.shadows.modal}>
        <SettingsHeader>
          <SettingsTitle>{t("settings.title")}</SettingsTitle>
        </SettingsHeader>
        <CommonSettings
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={language}
          isSubmitting={isSubmitting}
          onToggleNotifications={onToggleNotifications}
          onToggleHaptics={onToggleHaptics}
          onToggleLanguage={onToggleLanguage}
        />
        <StyledButton
          title={t("auth.logout")}
          onPress={onLogout}
          disabled={authLoading}
          loading={authLoading && !isSubmitting}
          style={{
            backgroundColor: colors.primary,
            marginTop: 8,
            marginBottom: 0,
          }}
        />
      </SettingsCard>
    );
  }

  // User variant with expandable functionality
  return (
    <SettingsCard style={theme.shadows.modal}>
      <SettingsHeader>
        <SettingsTitle>{t("settings.title")}</SettingsTitle>
      </SettingsHeader>
      <CommonSettings
        notificationsEnabled={notificationsEnabled}
        hapticsEnabled={hapticsEnabled}
        language={language}
        isSubmitting={isSubmitting}
        onToggleNotifications={onToggleNotifications}
        onToggleHaptics={onToggleHaptics}
        onToggleLanguage={onToggleLanguage}
      />
      <StyledButton
        title={t("auth.logout")}
        onPress={onLogout}
        disabled={authLoading}
        loading={authLoading && !isSubmitting}
        style={{
          backgroundColor: colors.primary,
          marginTop: 8,
          marginBottom: 0,
        }}
      />
      <ExpandArrow
        onPress={() => {
          haptics.heavy();
          setIsExpanded(!isExpanded);
        }}
      >
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.text.primary}
        />
      </ExpandArrow>
      {isExpanded && onDeleteAccount && (
        <DeleteAccountButton
          onPress={() => {
            haptics.heavy();
            onDeleteAccount();
          }}
        >
          <DeleteAccountText>{t("profile.deleteAccount")}</DeleteAccountText>
        </DeleteAccountButton>
      )}
    </SettingsCard>
  );
};

export default SettingsCardComponent;
