import React, { useEffect } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme';
import * as Linking from 'expo-linking';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  
  // Set up deep link handling for password reset
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const handleDeepLink = async (event: { url: string }) => {
        console.log('Deep link detected:', event.url);
        
        // Check if this is a password reset link
        if (event.url.includes('type=recovery') || event.url.includes('reset-password')) {
          console.log('Password reset link detected');
          
          // Extract the token from the URL
          const token = event.url.split('token=')[1]?.split('&')[0] || '';
          if (token) {
            console.log('Token found, redirecting to reset password screen');
            
            // Instead of automatically logging in, redirect to the reset password screen
            router.navigate(`/reset-password?token=${token}`);
            
            // Important: Sign out any currently signed in user to prevent automatic login
            await supabase.auth.signOut();
          }
        }
      };

      // Get the initial URL that opened the app
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.log('Initial URL detected:', url);
          handleDeepLink({ url });
        }
      });

      // Add event listener for URL changes
      const subscription = Linking.addEventListener('url', (event) => {
        console.log('URL change detected:', event.url);
        handleDeepLink(event);
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="dark" />
      <AuthProvider>
        <AuthenticatedStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

// Authentication logic for navigation
function AuthenticatedStack() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Handle auth state changes
  useEffect(() => {
    if (loading) return; // Still loading, don't redirect yet

    const inAuthGroup = segments[0] === '(auth)';
    
    // Check public routes that don't require authentication
    const isPublicRoute = 
      segments[0] === 'login' || 
      segments[0] === 'signup' ||
      segments[0] === 'forgot-password' || 
      segments[0] === 'reset-password';

    if (!user && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.replace('/login');
    } else if (user && isPublicRoute) {
      // Redirect to home if authenticated but on an auth route
      router.replace('/home');
    }
  }, [user, loading, segments]);

  return <Stack />;
} 