import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const { signIn, signUp, loading: authLoading, error, user, session } = useAuth();
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

  // Check for authenticated user and redirect
  useEffect(() => {
    if (user && session) {
      console.log('User authenticated in login screen, redirecting to home:', user.email);
      router.replace('/home');
    }
  }, [user, session, router]);

  const handleAuth = async () => {
    setLocalLoading(true);
    
    try {
      console.log(`Attempting ${isLogin ? 'login' : 'signup'} with:`, email);
      
      if (isLogin) {
        // Check the session first
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('Found existing session, checking validity');
          const { data: { user: existingUser } } = await supabase.auth.getUser();
          
          if (existingUser) {
            console.log('Existing user is valid, redirecting to home');
            router.replace('/home');
            return;
          }
        }
        
        // No valid session, try login
        console.log('No valid session found, attempting login');
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) {
          console.error('Login error:', loginError.message);
          Alert.alert('Login Error', loginError.message);
        } else if (data?.user) {
          console.log('Login successful, redirecting to home');
          router.replace('/home');
        }
      } else {
        // Handle signup
        await signUp(email, password);
        Alert.alert(
          'Signup Successful', 
          'Please check your email for verification instructions.',
          [{ text: 'OK', onPress: () => setIsLogin(true) }]
        );
      }
    } catch (err: any) {
      console.error('Auth error:', err.message);
      Alert.alert('Error', err.message || 'An error occurred during authentication');
    } finally {
      setLocalLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  // Determine if we're in a loading state
  const isLoading = localLoading || authLoading;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: isLogin ? 'Login' : 'Sign Up',
          headerShown: true,
        }}
      />
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Log in to your Rusty account' : 'Sign up to start reporting abandoned vehicles'}
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
          style={styles.button} 
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleAuthMode} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
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
  errorText: {
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
  },
}); 