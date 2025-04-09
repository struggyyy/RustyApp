import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  // Verify we have a token
  useEffect(() => {
    const verifyToken = async () => {
      setTokenChecking(true);
      console.log('Verifying reset token status:', token ? 'Token exists' : 'No token');
      
      try {
        if (!token) {
          throw new Error('No reset token provided');
        }
        
        // With the latest Supabase version, we can't directly verify the token
        // But we can check if we have a session from the token by getting the user
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Token verification error:', error.message);
          throw error;
        }
        
        if (data?.user) {
          console.log('Token is valid, user found:', data.user.email);
          setTokenVerified(true);
        } else {
          console.error('No user found with token');
          throw new Error('Invalid or expired token');
        }
      } catch (err: any) {
        console.error('Token verification failed:', err.message);
        Alert.alert(
          'Invalid Reset Link',
          'The password reset link is invalid or has expired. Please request a new password reset.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } finally {
        setTokenChecking(false);
      }
    };
    
    verifyToken();
  }, [token, router]);

  const handleResetPassword = async () => {
    setError(null);
    
    // Validate passwords
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Attempting to reset password...');
      
      // Update the user's password
      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (resetError) {
        console.error('Password reset error:', resetError.message);
        throw resetError;
      }
      
      // Ensure user is logged out after password reset
      await supabase.auth.signOut();
      
      Alert.alert(
        'Success',
        'Your password has been successfully updated. You can now log in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      console.error('Reset password error:', err.message);
      Alert.alert('Error', err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking token
  if (tokenChecking) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#BD5151" />
        <Text style={styles.loadingText}>Verifying reset link...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Set New Password',
          headerShown: true,
        }}
      />
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Enter and confirm your new password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResetPassword}
          disabled={loading || !tokenVerified}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    color: '#656565',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#656565',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#656565',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    color: '#656565',
  },
  button: {
    backgroundColor: '#BD5151',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#BD5151',
    fontSize: 16,
  },
}); 