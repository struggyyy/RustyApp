import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

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
      return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Reset Password' }} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Set New Password</Text>

        {message && <Text style={styles.messageText}>{message}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.infoText}>
           If you requested a password reset, please check your email for instructions.
           This screen currently initiates the password reset email process.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePasswordUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Email</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkButton}>
            <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
      fontSize: 24,
    fontWeight: 'bold',
      marginBottom: 20,
    textAlign: 'center',
  },
  input: {
      borderWidth: 1,
      borderColor: '#ccc',
    borderRadius: 8,
      padding: 12,
    marginBottom: 15,
      fontSize: 16,
  },
  button: {
    backgroundColor: '#BD5151',
      padding: 15,
    borderRadius: 8,
    alignItems: 'center',
      marginBottom: 15,
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
      backgroundColor: '#cccccc',
  },
  messageText: {
      color: 'green',
      marginBottom: 15,
      textAlign: 'center',
      fontSize: 16,
  },
  errorText: {
      color: 'red',
      marginBottom: 15,
      textAlign: 'center',
    fontSize: 16,
  },
  infoText: {
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
      fontSize: 14,
      fontStyle: 'italic',
  },
   linkButton: {
        marginTop: 10,
    alignItems: 'center',
  },
    linkText: {
    color: '#BD5151',
    fontSize: 16,
  },
}); 