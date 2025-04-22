import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Login',
          headerShown: true,
        }}
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to your Rusty account
        </Text>

        {localError && <Text style={styles.errorText}>{localError}</Text>}

        <TextInput
          style={[styles.input, !!localError && styles.inputError]}
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

        <TextInput
          ref={passwordInputRef}
          style={[styles.input, !!localError && styles.inputError]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
          onSubmitEditing={handleLogin}
          returnKeyType="go"
        />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={goToForgotPassword}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isSubmitting || authLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Log In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={goToSignUp} 
          style={styles.switchButton}
          disabled={isLoading}
        >
          <Text style={[styles.switchText, isLoading && styles.textDisabled]}>
            Don't have an account? Sign Up
          </Text>
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
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#BD5151',
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: '#BD5151',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  textDisabled: {
      color: '#999999'
  },
  inputError: {
      borderColor: '#D32F2F',
  },
}); 