import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from '../src/hooks/useTranslation';
import LanguageSwitcher from '../src/components/common/buttons/LanguageSwitcher';
import styled from 'styled-components/native';
import theme from '../src/theme';
import CustomAlert from '../src/components/common/modals/CustomAlert';
import * as Haptics from 'expo-haptics';

// Styled Components (re-using styles from login for consistency)
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: theme.colors.background.primary,
});

const FormContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingTop: 90,
    paddingBottom: 24,
  },
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
}))`
  flex: 1;
`;

const TitleText = styled.Text({
  fontSize: theme.typography.fontSize.h1,
  fontWeight: 'bold',
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
  color: theme.colors.text.primary,
});

const SubtitleText = styled.Text({
  fontSize: theme.typography.fontSize.body1,
  marginBottom: theme.spacing.xl,
  textAlign: 'center',
  color: theme.colors.text.secondary,
});

const StyledInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.spacing.md, // Updated radius
  padding: theme.spacing.md,
  marginBottom: theme.spacing.md,
  borderWidth: 1,
  borderColor: theme.colors.border.medium,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.input,
});

interface StyledButtonProps {
  isDisabled?: boolean;
}

const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? theme.colors.secondaryLight : theme.colors.primary,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
  alignItems: 'center',
  marginTop: theme.spacing.sm,
  width: '100%',
}));

const ButtonText = styled.Text({
  color: theme.colors.text.light,
  fontWeight: 'bold',
  fontSize: theme.typography.fontSize.button,
});

const BackButton = styled.TouchableOpacity({
  marginTop: theme.spacing.lg,
  alignItems: 'center',
});

interface BackButtonTextProps {
  isDisabled?: boolean;
}

const BackButtonText = styled.Text<BackButtonTextProps>((props: BackButtonTextProps) => ({
  color: props.isDisabled ? theme.colors.text.disabled : theme.colors.primary,
  fontSize: theme.typography.fontSize.body2,
  fontWeight: 'bold',
}));

const ErrorText = styled.Text({
  color: theme.colors.error.main,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
  fontSize: theme.typography.fontSize.body1,
});

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [loading, setLoading] = useState(false);
  const { resetPassword, error } = useAuth();
  const headerHeight = useHeaderHeight();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  const handleLanguageChange = () => {
    forceUpdate({});
  };

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: t('common.ok') }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleBackToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    router.replace({ 
      pathname: '/login', 
      params: { email }
    });
  };

  const handleResetPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!email) {
      showAlert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      await resetPassword(email);
      showAlert(
        t('common.success'),
        t('auth.passwordResetSent'),
        [{ text: t('common.ok'), onPress: () => router.replace({ pathname: '/login', params: { email }}) }]
      );
    } catch (err: any) {
      showAlert(t('common.error'), err.message || t('auth.passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Stack.Screen
          options={{
            title: t('auth.resetPassword'),
            headerShown: true,
          }}
        />

        <LanguageSwitcher onLanguageChange={handleLanguageChange} />
        
        <FormContainer>
          <TitleText>{t('auth.forgotPasswordTitle')}</TitleText>
          <SubtitleText>
            {t('auth.forgotPasswordSubtitle')}
          </SubtitleText>

          {error && <ErrorText>{error}</ErrorText>}

          <StyledInput
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="go"
            onSubmitEditing={handleResetPassword}
            onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
            editable={!loading}
          />

          <StyledButton 
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text.light} />
            ) : (
              <ButtonText>{t('auth.sendResetLink')}</ButtonText>
            )}
          </StyledButton>

          <BackButton 
            onPress={handleBackToLogin}
            disabled={loading}
          >
            <BackButtonText isDisabled={loading}>{t('auth.backToLogin')}</BackButtonText>
          </BackButton>
        </FormContainer>
      </StyledKeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
}