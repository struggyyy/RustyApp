import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';
import theme from '../src/theme';

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
  lineHeight: 22,
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
  const params = useLocalSearchParams();
  const { user, sendVerificationEmail, logOut, loading, error } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const emailToVerify = params.email as string || user?.email;

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      await sendVerificationEmail();
      setResendMessage('New verification email sent successfully!');
    } catch (err: any) {
      setResendMessage(error || 'Failed to resend email. Please try again later.');
      console.error("Resend Error:", err);
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = async () => {
    console.log('[VerifyEmail] Logging out before navigating to login...');
    setIsLoggingOut(true);
    try {
      await logOut(router);
      console.log('[VerifyEmail] Logout successful. Navigating to login screen...');
      router.replace('/login');
    } catch (err: any) {
      console.error('[VerifyEmail] Logout failed:', err);
      Alert.alert("Logout Failed", err.message || "Could not log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const isLoading = loading || isResending || isLoggingOut;

  return (
    <StyledContainer>
      <Stack.Screen options={{ headerShown: false }} />

      <TitleText>Check Your Email</TitleText>
      <SubtitleText>
        We've sent a verification link to 
        <EmailHighlightText> {emailToVerify || 'your email address'}</EmailHighlightText>.
      </SubtitleText>
      <InstructionsText>
        Please click the link in that email to activate your account. You may need to check your spam folder.
      </InstructionsText>

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
          <ButtonText>Resend Verification Email</ButtonText>
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
          <ButtonText>Go to Login</ButtonText>
        )}
      </StyledButton>

      <InfoText>
        (After verifying, please use the Login button).
      </InfoText>
    </StyledContainer>
  );
}