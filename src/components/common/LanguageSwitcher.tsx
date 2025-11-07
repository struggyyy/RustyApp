import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import i18n from '../../i18n/i18n';
import * as Haptics from 'expo-haptics';

const SwitcherContainer = styled.View({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 100,
});

const LanguageButton = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
});

const FlagText = styled.Text({
  fontSize: 20,
});

const LanguageText = styled.Text({
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
});

interface LanguageSwitcherProps {
  onLanguageChange?: (language: 'en' | 'pl') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState<'en' | 'pl'>(
    i18n.language as 'en' | 'pl'
  );

  const handleLanguageChange = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newLanguage = currentLanguage === 'en' ? 'pl' : 'en';
    await i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  // Show the opposite language (the one you can switch TO)
  const displayLanguage = currentLanguage === 'en' ? 'pl' : 'en';
  const flag = displayLanguage === 'en' ? '🇬🇧' : '🇵🇱';
  const label = displayLanguage === 'en' ? 'English' : 'Polski';

  return (
    <SwitcherContainer>
      <LanguageButton onPress={handleLanguageChange}>
        <FlagText>{flag}</FlagText>
        <LanguageText>{label}</LanguageText>
      </LanguageButton>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;
