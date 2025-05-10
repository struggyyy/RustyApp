import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';

// Styled Components
const StyledContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  backgroundColor: '#FFFFFF',
});

const TitleText = styled.Text({
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
  color: '#656565',
});

const SubtitleText = styled.Text({
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 10,
  color: '#656565',
});

const EmailHighlightText = styled.Text({
  fontWeight: 'bold',
  color: '#BD5151',
});

const InstructionsText = styled.Text({
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 30,
  color: '#656565',
  lineHeight: 20,
});

interface StyledButtonProps {
  isLoginButton?: boolean;
  isDisabled?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? '#cccccc' : (props.isLoginButton ? '#6c757d' : '#BD5151'),
  borderRadius: 8,
  paddingVertical: 15,
  paddingHorizontal: 30,
  alignItems: 'center',
  marginBottom: 15,
  width: '90%',
}));

const ButtonText = styled.Text({
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
});

interface FeedbackTextProps {
  isError?: boolean;
}
const FeedbackText = styled.Text<FeedbackTextProps>((props: FeedbackTextProps) => ({
  color: props.isError ? 'red' : 'green',
  marginBottom: 15,
  textAlign: 'center',
  fontWeight: props.isError ? 'normal' : 'bold',
}));

const InfoText = styled.Text({
  fontSize: 12,
  color: '#888',
  marginTop: 20,
  textAlign: 'center',
});

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const { user, sendVerificationEmail, logOut, loading, error } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get email from params passed from signup or from logged-in user
  const emailToVerify = params.email as string || user?.email;

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(''); 
    try {
      await sendVerificationEmail();
      setResendMessage('New verification email sent successfully!');
    } catch (err: any) {
      // Error state is likely set in context, display that or a generic message
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
          await logOut();
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
      {/* Add Stack.Screen options to hide the header */}
      <Stack.Screen options={{ headerShown: false }} />

      <TitleText>Check Your Email</TitleText>
      <SubtitleText>
        We've sent a verification link to 
        <EmailHighlightText> {emailToVerify || 'your email address'}</EmailHighlightText>.
      </SubtitleText>
      <InstructionsText>
        Please click the link in that email to activate your account. You may need to check your spam folder.
      </InstructionsText>

       {/* Display general context errors or resend feedback */} 
       {(error && !resendMessage) && <FeedbackText isError>{error}</FeedbackText>}
       {resendMessage && 
         <FeedbackText isError={!!error}>
           {resendMessage}
         </FeedbackText>
       }

      <StyledButton
        isDisabled={isLoading}
        onPress={handleResendVerification}
        disabled={isLoading}
      >
        {isResending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ButtonText>Resend Verification Email</ButtonText>
        )}
      </StyledButton>

      <StyledButton
        isLoginButton
        isDisabled={isLoading}
        onPress={goToLogin}
        disabled={isLoading}
      >
        {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" /> 
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