import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';
import theme from '../src/theme';

// Styled Components
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

interface StyledInputProps {
  hasError?: boolean;
}
const StyledInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})<StyledInputProps>((props: StyledInputProps) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.spacing.md, // Updated radius
  padding: theme.spacing.md,
  marginBottom: theme.spacing.md,
  borderWidth: 1,
  borderColor: props.hasError ? theme.colors.error.main : theme.colors.border.medium,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.input,
}));

interface StyledButtonProps {
  isDisabled?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? theme.colors.secondaryLight : theme.colors.primary,
  borderRadius: theme.spacing.md, // Updated radius
  padding: theme.spacing.md,
  alignItems: 'center',
  marginTop: theme.spacing.sm,
}));

const ButtonText = styled.Text({
  color: theme.colors.text.light,
  fontWeight: 'bold',
  fontSize: theme.typography.fontSize.button,
});

const SwitchButton = styled.TouchableOpacity({
  marginTop: theme.spacing.lg,
  alignItems: 'center',
});

interface SwitchTextProps {
  isDisabled?: boolean;
}
const SwitchText = styled.Text<SwitchTextProps>((props: SwitchTextProps) => ({
  color: props.isDisabled ? theme.colors.text.disabled : theme.colors.primary,
  fontSize: theme.typography.fontSize.body2,
  fontWeight: 'bold',
}));

const ForgotPasswordButton = styled.TouchableOpacity({
  alignSelf: 'flex-end',
  marginBottom: theme.spacing.md,
});

const ForgotPasswordText = styled.Text({
  color: theme.colors.primary,
  fontSize: theme.typography.fontSize.body2, // Updated font size
});

const ErrorText = styled.Text({
  color: theme.colors.error.main,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
  fontSize: theme.typography.fontSize.body1,
});

export default function Login() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { logIn, loading: authLoading, user, initialLoading } = useAuth();
  const router = useRouter();
  const passwordInputRef = useRef<TextInput | null>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (localError) {
      setLocalError(null);
    }
  }, [email, password]);

  useEffect(() => {
    console.log('Login screen rendered, auth state:', {
      hasUser: !!user,
      initialLoading: initialLoading,
      userEmail: user?.email || 'none',
      authLoading: authLoading
    });
  }, [user, initialLoading, authLoading]);

  useEffect(() => {
    if (!initialLoading && user) {
      console.log('User authenticated in login screen, redirecting to home:', user.email);
    }
  }, [user, initialLoading]);

  const handleLogin = async () => {
    setLocalError(null);
    Keyboard.dismiss();

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Calling useAuth logIn function for:', email);
      await logIn(email, password);
      console.log('logIn function completed successfully (redirect handled by listener in _layout).');
    } catch (err: any) {
      console.error('Login handler error:', err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setLocalError('User not found or invalid credentials.');
      } else if (err.code === 'auth/wrong-password') {
        setLocalError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setLocalError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setLocalError('Too many login attempts. Please try again later.');
      } else {
        setLocalError(err.message || 'Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignUp = () => {
    Keyboard.dismiss();
    setLocalError(null);
    setTimeout(() => {
      router.push({ 
        pathname: '/signup',
        params: { email }
      });
    }, 100);
  };

  const goToForgotPassword = () => {
    Keyboard.dismiss();
    setLocalError(null);
    setTimeout(() => {
      router.push({ 
        pathname: '/forgot-password',
        params: { email }
      });
    }, 100);
  };

  const isLoading = initialLoading || isSubmitting || authLoading;

  return (
    <StyledKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <Stack.Screen
        options={{
          title: 'Login',
          headerShown: true,
          headerBackVisible: false,
        }}
      />

      <FormContainer>
        <TitleText>Welcome Back</TitleText>
        <SubtitleText>
          Log in to your Rusty account
        </SubtitleText>

        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          hasError={!!localError}
        />
        <StyledInput
          ref={passwordInputRef}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          hasError={!!localError}
        />
        
        <ForgotPasswordButton onPress={goToForgotPassword} disabled={isLoading}>
          <ForgotPasswordText>Forgot Password?</ForgotPasswordText>
        </ForgotPasswordButton>

        {localError && <ErrorText>{localError}</ErrorText>}

        <StyledButton onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.text.light} />
          ) : (
            <ButtonText>Log In</ButtonText>
          )}
        </StyledButton>

        <SwitchButton onPress={goToSignUp} disabled={isLoading}>
          <SwitchText isDisabled={isLoading}>Don't have an account? Sign Up!</SwitchText>
        </SwitchButton>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
}