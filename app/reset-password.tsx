import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';

// Styled Components
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: '#fff',
});

const FormContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  padding: 20,
});

const TitleText = styled.Text({
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
});

const StyledInput = styled.TextInput({
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  marginBottom: 15,
  fontSize: 16,
});

interface StyledButtonProps {
  isDisabled?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isDisabled ? '#cccccc' : '#BD5151',
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 15,
}));

const ButtonText = styled.Text({
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
});

const MessageText = styled.Text({
  color: 'green',
  marginBottom: 15,
  textAlign: 'center',
  fontSize: 16,
});

const ErrorText = styled.Text({
  color: 'red',
  marginBottom: 15,
  textAlign: 'center',
  fontSize: 16,
});

const InfoText = styled.Text({
  color: '#666',
  marginBottom: 20,
  textAlign: 'center',
  fontSize: 14,
  fontStyle: 'italic',
});

const LinkButton = styled.TouchableOpacity({
  marginTop: 10,
  alignItems: 'center',
});

const LinkText = styled.Text({
  color: '#BD5151',
  fontSize: 16,
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { user, initialLoading, resetPassword, logOut } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordUpdate = async () => {
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setLoading(true);
    try {
      const emailToReset = user?.email;
      if (!emailToReset) {
          setError('Could not determine email for password reset. Please go back and try again.');
          setLoading(false);
          return;
      }
      await resetPassword(emailToReset);
      setMessage('Password reset email sent successfully. Check your inbox.');
    } catch (err: any) {
      console.error('Password update/reset error:', err.message);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return <ActivityIndicator size="large" />;
  }

  return (
    <StyledKeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Reset Password' }} />
      <FormContainer>
        <TitleText>Set New Password</TitleText>

        {message && <MessageText>{message}</MessageText>}
        {error && <ErrorText>{error}</ErrorText>}

        <InfoText>
           If you requested a password reset, please check your email for instructions.
           This screen currently initiates the password reset email process.
        </InfoText>

        <StyledInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!loading}
        />
        <StyledInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <StyledButton 
          isDisabled={loading}
          onPress={handlePasswordUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Send Reset Email</ButtonText>}
        </StyledButton>

        <LinkButton onPress={() => router.push('/login')} >
            <LinkText>Back to Login</LinkText>
        </LinkButton>
      </FormContainer>
    </StyledKeyboardAvoidingView>
  );
} 