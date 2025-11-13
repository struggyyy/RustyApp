import React, { useState } from "react";
import { Switch, Animated, StyleSheet } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import styled from "styled-components/native";
import StyledButton from "../../common/buttons/StyledButton";
import colors from "../../../theme/colors";
import { useHaptics } from "../../../context/HapticsContext";
import { useTranslation } from "../../../hooks/useTranslation";

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
  background-color: ${colors.background.secondary};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 12px;
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
  margin-top: 16px;
`;

const ExpandedContent = styled.View`
  margin-top: 16px;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: ${colors.background.secondary};
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
  border: 1px solid ${colors.background.secondary};
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
  margin-top: 4px;
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
  const haptics = useHaptics();
  const { t } = useTranslation();

  if (variant === 'admin') {
    return (
      <SettingsCard style={shadowStyles.modalShadow}>
        <SettingsHeader>
          <SettingsTitle>{t('settings.title')}</SettingsTitle>
        </SettingsHeader>
        <NotificationRow>
          <NotificationLabel>{t('settings.enableNotifications')}</NotificationLabel>
          <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.primary}
            onValueChange={(value) => { haptics.heavy(); onToggleNotifications(value); }}
            value={notificationsEnabled}
            disabled={isSubmitting}
          />
        </NotificationRow>
        <NotificationRow>
          <NotificationLabel>{t('settings.enableHaptics')}</NotificationLabel>
          <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.primary}
            onValueChange={(value) => { haptics.heavy(); onToggleHaptics(value); }}
            value={hapticsEnabled}
            disabled={isSubmitting}
          />
        </NotificationRow>
        <LanguageToggle onPress={() => { haptics.heavy(); onToggleLanguage(); }}>
          <LanguageOption isSelected={language === 'en'}>
            <LanguageText isSelected={language === 'en'}>🇬🇧 {t('settings.english')}</LanguageText>
          </LanguageOption>
          <LanguageOption isSelected={language === 'pl'}>
            <LanguageText isSelected={language === 'pl'}>🇵🇱 {t('settings.polish')}</LanguageText>
          </LanguageOption>
        </LanguageToggle>
        <StyledButton
          title={t('auth.logout')}
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
        <SettingsTitle>{t('settings.title')}</SettingsTitle>
      </SettingsHeader>
      <NotificationRow>
        <NotificationLabel>{t('settings.enableNotifications')}</NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={(value) => { haptics.heavy(); onToggleNotifications(value); }}
          value={notificationsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <NotificationRow>
        <NotificationLabel>{t('settings.enableHaptics')}</NotificationLabel>
        <Switch
          trackColor={{ false: colors.primary, true: colors.status.Completed }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.primary}
          onValueChange={(value) => { haptics.heavy(); onToggleHaptics(value); }}
          value={hapticsEnabled}
          disabled={isSubmitting}
        />
      </NotificationRow>
      <LanguageToggle onPress={() => { haptics.heavy(); onToggleLanguage(); }}>
        <LanguageOption isSelected={language === 'en'}>
          <LanguageText isSelected={language === 'en'}>🇬🇧 {t('settings.english')}</LanguageText>
        </LanguageOption>
        <LanguageOption isSelected={language === 'pl'}>
          <LanguageText isSelected={language === 'pl'}>🇵🇱 {t('settings.polish')}</LanguageText>
        </LanguageOption>
      </LanguageToggle>
      <StyledButton
        title={t('auth.logout')}
        onPress={onLogout}
        disabled={authLoading}
        loading={authLoading && !isSubmitting}
        style={{ backgroundColor: colors.primary, marginTop: 8, marginBottom: 0 }}
      />
      <ExpandArrow onPress={() => { haptics.heavy(); setIsExpanded(!isExpanded); }}>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.text.secondary}
        />
      </ExpandArrow>
      {isExpanded && onDeleteAccount && (
        <DeleteAccountButton onPress={() => { haptics.heavy(); onDeleteAccount(); }}>
          <DeleteAccountText>{t('profile.deleteAccount')}</DeleteAccountText>
        </DeleteAccountButton>
      )}
    </SettingsCard>
  );
};

export default SettingsCardComponent;
