import React, { useState } from "react";
import { Switch, Animated, StyleSheet } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import styled from "styled-components/native";
import StyledButton from "./StyledButton";
import colors from "../../theme/colors";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

interface SettingsCardProps {
  variant: 'admin' | 'user';
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

const SettingsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SettingsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SettingsTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
`;

const ExpandArrow = styled.TouchableOpacity`
  align-items: center;
  padding: 8px;
  margin-top: 8px;
`;

const ExpandedContent = styled.View`
  margin-top: 16px;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: ${colors.componentBackground};
`;

const NotificationRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const NotificationLabel = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
`;

const LanguageToggle = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${colors.componentBackground};
  margin-bottom: 16px;
`;

const LanguageOption = styled.View<{ isSelected: boolean }>`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const LanguageText = styled.Text<{ isSelected: boolean }>`
  font-size: 16px;
  font-weight: ${(props: { isSelected: boolean }) => props.isSelected ? '600' : '400'};
  color: ${(props: { isSelected: boolean }) => props.isSelected ? colors.primary : colors.text.secondary};
`;

const DeleteAccountButton = styled.TouchableOpacity`
  padding: 8px 16px;
  align-items: center;
  margin-top: 8px;
`;

const DeleteAccountText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colors.text.secondary};
`;

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

  if (variant === 'admin') {
    return (
      <SettingsCard style={shadowStyles.modalShadow}>
        <SettingsHeader>
          <SettingsTitle>Settings</SettingsTitle>
        </SettingsHeader>
        <NotificationRow>
          <NotificationLabel>Enable Notifications</NotificationLabel>
          <Switch
            trackColor={{ false: colors.primary, true: colors.status.recycled }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.primary}
            onValueChange={onToggleNotifications}
            value={notificationsEnabled}
            disabled={isSubmitting}
          />
        </NotificationRow>
        <NotificationRow>
          <NotificationLabel>Enable Haptics</NotificationLabel>
          <Switch
            trackColor={{ false: colors.primary, true: colors.status.recycled }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.primary}
            onValueChange={onToggleHaptics}
            value={hapticsEnabled}
            disabled={isSubmitting}
          />
        </NotificationRow>
        <LanguageToggle onPress={onToggleLanguage}>
          <LanguageOption isSelected={language === 'English'}>
            <LanguageText isSelected={language === 'English'}>🇬🇧 English</LanguageText>
          </LanguageOption>
          <LanguageOption isSelected={language === 'Polish'}>
            <LanguageText isSelected={language === 'Polish'}>🇵🇱 Polski</LanguageText>
          </LanguageOption>
        </LanguageToggle>
        <StyledButton
          title="Logout"
          onPress={onLogout}
          disabled={authLoading}
          loading={authLoading && !isSubmitting}
          style={{ backgroundColor: colors.primary, marginTop: 8, marginBottom: 0 }}
        />
      </SettingsCard>
    );
  }

  // User variant with expandable functionality
  return (
    <SettingsCard style={shadowStyles.modalShadow}>
      <SettingsHeader>
        <SettingsTitle>Settings</SettingsTitle>
      </SettingsHeader>
      <NotificationRow>
        <NotificationLabel>Enable Notifications</NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.recycled }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={onToggleNotifications}
          value={notificationsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <NotificationRow>
        <NotificationLabel>Enable Haptics</NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.recycled }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={onToggleHaptics}
          value={hapticsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <LanguageToggle onPress={onToggleLanguage}>
        <LanguageOption isSelected={language === 'English'}>
          <LanguageText isSelected={language === 'English'}>🇬🇧 English</LanguageText>
        </LanguageOption>
        <LanguageOption isSelected={language === 'Polish'}>
          <LanguageText isSelected={language === 'Polish'}>🇵🇱 Polski</LanguageText>
        </LanguageOption>
      </LanguageToggle>
      <StyledButton
        title="Logout"
        onPress={onLogout}
        disabled={authLoading}
        loading={authLoading && !isSubmitting}
        style={{ backgroundColor: colors.primary, marginTop: 8, marginBottom: 0 }}
      />
      <ExpandArrow onPress={() => setIsExpanded(!isExpanded)}>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.text.secondary}
        />
      </ExpandArrow>
      {isExpanded && onDeleteAccount && (
        <DeleteAccountButton onPress={onDeleteAccount}>
          <DeleteAccountText>Delete Account :(</DeleteAccountText>
        </DeleteAccountButton>
      )}
    </SettingsCard>
  );
};

export default SettingsCardComponent;
