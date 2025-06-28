import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';

// Styled Components
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: '#FFFFFF',
});

const FormContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  padding: 20,
});

const TitleText = styled.Text({
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
  color: '#656565',
});

const SubtitleText = styled.Text({
  fontSize: 16,
  marginBottom: 30,
  textAlign: 'center',
  color: '#656565',
});

interface StyledInputProps {
  hasError?: boolean;
}
const StyledInput = styled.TextInput<StyledInputProps>((props: StyledInputProps) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: props.hasError ? '#D32F2F' : '#D9D9D9',
  color: '#656565',
}));

interface StyledButtonProps {
  isDisabled?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? '#cccccc' : '#BD5151',
  borderRadius: 8,
  padding: 15,
  alignItems: 'center',
  marginTop: 10,
}));

const ButtonText = styled.Text({
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
});

const SwitchButton = styled.TouchableOpacity({
  marginTop: 20,
  alignItems: 'center',
});

interface SwitchTextProps {
  isDisabled?: boolean;
}
const SwitchText = styled.Text<SwitchTextProps>((props: SwitchTextProps) => ({
  color: props.isDisabled ? '#999999' : '#BD5151',
  fontSize: 16,
}));

const ForgotPasswordButton = styled.TouchableOpacity({
  alignSelf: 'flex-end',
  marginBottom: 15,
});

const ForgotPasswordText = styled.Text({
  color: '#BD5151',
  fontSize: 14,
});

const ErrorText = styled.Text({
  color: '#F44336',
  marginBottom: 15,
  textAlign: 'center',
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
      keyboardVerticalOffset={100}
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

        {localError && <ErrorText>{localError}</ErrorText>}

        <StyledInput
          hasError={!!localError}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
          returnKeyType="next"
        />

        <StyledInput
          ref={passwordInputRef}
          hasError={!!localError}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
          onSubmitEditing={handleLogin}
          returnKeyType="go"
        />

        <ForgotPasswordButton
          onPress={goToForgotPassword}
          disabled={isLoading}
        >
          <ForgotPasswordText>Forgot Password?</ForgotPasswordText>
        </ForgotPasswordButton>

        <StyledButton
          isDisabled={isLoading}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isSubmitting || authLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ButtonText>
              Log In
            </ButtonText>
          )}
        </StyledButton>

        <SwitchButton 
          onPress={goToSignUp} 
          disabled={isLoading}
        >
          <SwitchText isDisabled={isLoading}>
            Don't have an account? Sign Up
          </SwitchText>
        </SwitchButton>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
} 