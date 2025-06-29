import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';
import theme from '../src/theme';

// Styled Components (re-using styles from login for consistency)
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: theme.colors.background.primary,
});

const FormContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: 24,
  },
  keyboardShouldPersistTaps: 'handled',
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [loading, setLoading] = useState(false);
  const { resetPassword, error } = useAuth();
  const headerHeight = useHeaderHeight();

  const handleBackToLogin = () => {
    Keyboard.dismiss();
    router.replace({ 
      pathname: '/login', 
      params: { email }
    });
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => router.replace({ pathname: '/login', params: { email }}) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledKeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <Stack.Screen
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />
      
      <FormContainer>
        <TitleText>Reset Your Password</TitleText>
        <SubtitleText>
          Enter your email and we'll send you instructions to reset your password.
        </SubtitleText>

        {error && <ErrorText>{error}</ErrorText>}

        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="go"
          onSubmitEditing={handleResetPassword}
          editable={!loading}
        />

        <StyledButton 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text.light} />
          ) : (
            <ButtonText>Send Reset Instructions</ButtonText>
          )}
        </StyledButton>

        <BackButton 
          onPress={handleBackToLogin}
          disabled={loading}
        >
          <BackButtonText isDisabled={loading}>Back to Login</BackButtonText>
        </BackButton>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
}