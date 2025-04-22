import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

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
    <View style={styles.container}>
      {/* Add Stack.Screen options to hide the header */}
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a verification link to 
        <Text style={styles.emailText}> {emailToVerify || 'your email address'}</Text>.
      </Text>
      <Text style={styles.instructions}>
        Please click the link in that email to activate your account. You may need to check your spam folder.
      </Text>

       {/* Display general context errors or resend feedback */} 
       {(error && !resendMessage) && <Text style={styles.errorText}>{error}</Text>}
       {resendMessage && 
         <Text style={[styles.messageText, error && styles.errorText]}>
           {resendMessage}
         </Text>
       }

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResendVerification}
        disabled={isLoading}
      >
        {isResending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Resend Verification Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.loginButton, isLoading && styles.buttonDisabled]}
        onPress={goToLogin}
        disabled={isLoading}
      >
        {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" /> 
        ) : (
            <Text style={styles.buttonText}>Go to Login</Text>
        )}
      </TouchableOpacity>

       <Text style={styles.infoText}>
           (After verifying, please use the Login button).
       </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#656565',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#656565',
  },
   emailText: {
    fontWeight: 'bold',
    color: '#BD5151',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#656565',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#BD5151',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    width: '90%', // Wider button
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
   loginButton: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  messageText: {
      color: 'green',
      marginBottom: 15,
      textAlign: 'center',
      fontWeight: 'bold',
  },
   infoText: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
}); 