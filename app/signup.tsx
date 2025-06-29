import React, { useState, useEffect } from 'react';
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
  marginBottom: theme.spacing.lg,
  textAlign: 'center',
  color: theme.colors.text.secondary,
});

const StyledInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.text.tertiary,
})({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.spacing.md, // 16px
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
  borderRadius: theme.spacing.md, // 16px
  padding: theme.spacing.md,
  alignItems: 'center',
  marginTop: theme.spacing.sm,
}));

const ButtonText = styled.Text({
  color: theme.colors.text.light,
  fontWeight: 'bold',
  fontSize: theme.typography.fontSize.button,
});

const BackButtonTouchable = styled.TouchableOpacity({
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
});

export default function SignupScreen() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, loading: authLoading, error } = useAuth();
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!email.includes('@')) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await signUp(email, password, nickname);
      
      if (newUser) {
        console.log('Signup successful, navigating to verification screen.');
        router.replace({ pathname: '/verify-email', params: { email } }); 
      } else {
        console.log('Signup failed (error likely set in context).');
      }
    } catch (err: any) {
      console.error('Signup handler error:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <StyledKeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <Stack.Screen
        options={{
          title: 'Sign Up',
          headerShown: true,
        }}
      />
      
      <FormContainer>
        <TitleText>Create Account</TitleText>
        <SubtitleText>
          Sign up to start reporting abandoned vehicles
        </SubtitleText>

        {error && <ErrorText>{error}</ErrorText>}

        <StyledInput
          placeholder="Nickname"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="words"
          editable={!isLoading}
        />

        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <StyledInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <StyledInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <StyledButton 
          isDisabled={isLoading}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.text.light} />
          ) : (
            <ButtonText>Sign Up</ButtonText>
          )}
        </StyledButton>

        <BackButtonTouchable 
          onPress={() => {
            Keyboard.dismiss();
            router.replace('/login');
          }}
          disabled={isLoading}
        >
          <BackButtonText isDisabled={isLoading}>Already have an account? Log In</BackButtonText>
        </BackButtonTouchable>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
} 