import React, { useState } from 'react';
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

const StyledInput = styled.TextInput({
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#D9D9D9',
  color: '#656565',
});

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

const BackButtonTouchable = styled.TouchableOpacity({
  marginTop: 20,
  alignItems: 'center',
});

interface BackButtonTextProps {
  isDisabled?: boolean;
}
const BackButtonText = styled.Text<BackButtonTextProps>((props: BackButtonTextProps) => ({
  color: props.isDisabled ? '#999999' : '#BD5151',
  fontSize: 16,
}));

const ErrorText = styled.Text({
  color: '#F44336',
  marginBottom: 15,
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
      keyboardVerticalOffset={100}
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
            <ActivityIndicator color="#FFFFFF" />
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