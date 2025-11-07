import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from '../src/hooks/useTranslation';
import LanguageSwitcher from '../src/components/common/buttons/LanguageSwitcher';
import styled from 'styled-components/native';
import theme from '../src/theme';
import CustomAlert from '../src/components/common/modals/CustomAlert';
import * as Haptics from 'expo-haptics';

// Styled Components
const StyledContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.layout.screenPadding,
  backgroundColor: theme.colors.background.primary,
});

const TitleText = styled.Text({
  fontSize: theme.typography.fontSize.h1,
  fontWeight: 'bold',
  marginBottom: theme.spacing.sm,
  textAlign: 'center',
  color: theme.colors.text.primary,
});

const SubtitleText = styled.Text({
  fontSize: theme.typography.fontSize.body1,
  textAlign: 'center',
  marginBottom: theme.spacing.lg,
  color: theme.colors.text.secondary,
});

const EmailHighlightText = styled.Text({
  fontWeight: 'bold',
  color: theme.colors.primary,
});

const InstructionsText = styled.Text({
  fontSize: theme.typography.fontSize.body2,
  textAlign: 'center',
  marginBottom: theme.spacing.xl,
  color: theme.colors.text.secondary,
  lineHeight: '22px',
});

interface StyledButtonProps {
  variant: 'primary' | 'secondary';
  isDisabled?: boolean;
}

const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled
    ? theme.colors.secondaryLight
    : props.variant === 'primary'
    ? theme.colors.primary
    : theme.colors.text.primary,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
  alignItems: 'center',
  marginBottom: theme.spacing.md,
  width: '100%',
}));

const ButtonText = styled.Text({
  color: theme.colors.text.light,
  fontWeight: 'bold',
  fontSize: theme.typography.fontSize.button,
});

interface FeedbackTextProps {
  isError?: boolean;
}
const FeedbackText = styled.Text<FeedbackTextProps>((props: FeedbackTextProps) => ({
  color: props.isError ? theme.colors.error.main : theme.colors.primary,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
  fontWeight: 'bold',
}));

const InfoText = styled.Text({
  fontSize: theme.typography.fontSize.caption,
  color: theme.colors.text.tertiary,
  marginTop: theme.spacing.md,
  textAlign: 'center',
});

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const params = useLocalSearchParams();
  const { user, sendVerificationEmail, logOut, loading, error } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const emailToVerify = params.email as string || user?.email;

  const handleResendVerification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsResending(true);
    setResendMessage('');
    try {
      await sendVerificationEmail();
      setResendMessage(t('auth.emailSentSuccess'));
    } catch (err: any) {
      setResendMessage(error || t('auth.verificationError'));
      console.error("Resend Error:", err);
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('[VerifyEmail] Logging out before navigating to login...');
    setIsLoggingOut(true);
    try {
      await logOut(router);
      console.log('[VerifyEmail] Logout successful. Navigating to login screen...');
      router.replace({ pathname: '/login', params: { email: emailToVerify } });
    } catch (err: any) {
      console.error('[VerifyEmail] Logout failed:', err);
      showAlert(t('auth.logoutError'), err.message || t('auth.logoutError'));
    } finally {
      setIsLoggingOut(false);
    }
  }

  const isLoading = loading || isResending || isLoggingOut;

  return (
    <>
      <LanguageSwitcher onLanguageChange={handleLanguageChange} />

      <StyledContainer>
        <Stack.Screen options={{ headerShown: false }} />

        <TitleText>{t('auth.verifyEmailTitle')}</TitleText>
        <SubtitleText>
          {t('auth.verifyEmailMessage')}
          <EmailHighlightText> {emailToVerify || t('auth.email')}</EmailHighlightText>.
        </SubtitleText>

        {(error && !resendMessage) && <FeedbackText isError>{error}</FeedbackText>}
        {resendMessage && 
          <FeedbackText isError={!!error}>
            {resendMessage}
          </FeedbackText>
        }

        <StyledButton
          variant="secondary"
          onPress={handleResendVerification}
          disabled={isLoading}
        >
          {isResending ? (
            <ActivityIndicator color={theme.colors.text.light} />
          ) : (
            <ButtonText>{t('auth.resendEmail')}</ButtonText>
          )}
        </StyledButton>

        <StyledButton
          variant="primary"
          onPress={goToLogin}
          disabled={isLoading}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={theme.colors.text.light} />
          ) : (
            <ButtonText>{t('auth.backToLogin')}</ButtonText>
          )}
        </StyledButton>

      </StyledContainer>

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