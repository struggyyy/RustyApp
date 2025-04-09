import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';

export default function Login() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(params.email as string || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, loading: authLoading, error, user, session } = useAuth();
  const router = useRouter();

  // Log initial render
  useEffect(() => {
    console.log('Login screen rendered, auth state:', {
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email || 'none',
      hasError: !!error,
      loading: authLoading
    });
  }, []);

  // Handle email parameter if passed
  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  // Check for authenticated user and redirect
  useEffect(() => {
    if (user && session) {
      console.log('User authenticated in login screen, redirecting to home:', user.email);
      router.replace('/home');
    }
  }, [user, session, router]);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting sign in process for:', email);
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { 
        success: !loginError, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMessage: loginError?.message
      });
      
      if (loginError) {
        console.error('Supabase auth error:', loginError.message);
        Alert.alert('Login Error', loginError.message);
      } else if (data?.user) {
        console.log('Login successful, redirecting to home');
        router.replace('/home');
      }
    } catch (err: any) {
      console.error('Auth error:', err.message);
      Alert.alert('Error', err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // Navigation to signup while preserving email
  const goToSignUp = () => {
    // Dismiss keyboard first to prevent flickering
    Keyboard.dismiss();
    // Add a small delay before navigation
    setTimeout(() => {
      router.push({
        pathname: '/signup',
        params: { email }
      });
    }, 100);
  };

  // Determine if we're in a loading state
  const isLoading = loading || authLoading;

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

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={() => {
            // Dismiss keyboard first to prevent flickering
            Keyboard.dismiss();
            // Add a small delay before navigation to ensure keyboard is fully dismissed
            setTimeout(() => {
              router.push({
                pathname: '/forgot-password',
                params: { email }
              });
            }, 100);
          }}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Log In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToSignUp} style={styles.switchButton}>
          <Text style={styles.switchText}>
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
}); 