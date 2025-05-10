import React, { useState, useEffect } from 'react';
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

const StyledButton = styled.TouchableOpacity({
  backgroundColor: '#BD5151',
  borderRadius: 8,
  padding: 15,
  alignItems: 'center',
  marginTop: 10,
});

const ButtonText = styled.Text({
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
});

const BackButton = styled.TouchableOpacity({
  marginTop: 20,
  alignItems: 'center',
});

const BackButtonText = styled.Text({
  color: '#BD5151',
  fontSize: 16,
});

const ErrorText = styled.Text({
  color: '#F44336',
  marginBottom: 15,
  textAlign: 'center',
});

export default function ForgotPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [loading, setLoading] = useState(false);
  const { resetPassword, error } = useAuth();

  // Handle back navigation with email preservation
  const handleBackToLogin = () => {
    // Dismiss keyboard first to prevent flickering
    Keyboard.dismiss();
    // Remove setTimeout, call replace directly, passing params
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

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
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
      keyboardVerticalOffset={100}
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
          Enter your email address and we'll send you instructions to reset your password
        </SubtitleText>

        {error && <ErrorText>{error}</ErrorText>}

        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <StyledButton 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ButtonText>Send Reset Instructions</ButtonText>
          )}
        </StyledButton>

        <BackButton 
          onPress={handleBackToLogin}
        >
          <BackButtonText>Back to Login</BackButtonText>
        </BackButton>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
} 