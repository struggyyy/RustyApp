import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import * as Linking from 'expo-linking';

// Re-introduce AuthenticatedStack pattern (based on original + updated context)
function AuthenticatedStack() {
  const { user, initialLoading } = useAuth(); // Use initialLoading from Firebase context
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until initial auth check is complete
    if (initialLoading) {
        console.log('[AuthenticatedStack Effect] Waiting for initial auth load...');
        return;
    }

    const isAuthRoute = segments[0] === 'login' ||
                         segments[0] === 'signup' ||
                         segments[0] === 'forgot-password' ||
                         segments[0] === 'reset-password';
    const isVerifyEmailRoute = segments[0] === 'verify-email';

    console.log(`[AuthenticatedStack Effect] Auth loaded. User: ${!!user}, Verified: ${user?.emailVerified}, IsAuthRoute: ${isAuthRoute}, IsVerify: ${isVerifyEmailRoute}, Segments: ${segments.join('/')}`);

    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
        // If not logged in AND not on an auth/verify route, redirect to login
        console.log('[AuthenticatedStack Effect] No user, redirecting to login...');
        router.replace('/login');
    } else if (user && !user.emailVerified && !isVerifyEmailRoute) {
        // If logged in BUT email not verified AND not on verify screen, redirect to verify
        console.log('[AuthenticatedStack Effect] User exists but not verified, redirecting to verify-email...');
        router.replace('/verify-email');
    } else if (user && user.emailVerified && (isAuthRoute || isVerifyEmailRoute)) {
        // If logged in AND verified AND on an auth/verify screen, redirect to home
        console.log('[AuthenticatedStack Effect] User verified, redirecting from auth/verify route to home...');
        router.replace('/home');
    } else if (user && !user.emailVerified && isVerifyEmailRoute) {
        // User logged in, not verified, and correctly on the verify screen - do nothing
        console.log('[AuthenticatedStack Effect] User not verified, correctly on verify screen.');
    } else if (user && user.emailVerified && !isAuthRoute && !isVerifyEmailRoute) {
        // User logged in, verified, and on a protected route - do nothing
        console.log('[AuthenticatedStack Effect] User verified, correctly on protected route.');
    } else if (!user && (isAuthRoute || isVerifyEmailRoute)){
        // User not logged in, and on an allowed public route - do nothing
        console.log('[AuthenticatedStack Effect] No user, correctly on public auth/verify route.');
    }

  }, [user, initialLoading, segments, router]);

  // Render the Stack navigator; Expo Router handles screen discovery
  // Remove screenOptions that defined the global header
  return <Stack />;
}

// Main layout component
export default function RootLayout() {
  const router = useRouter();

  // Deep link handling - Remove Supabase signout
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const handleDeepLink = async (event: { url: string }) => {
        console.log('Deep link detected:', event.url);
        if (event.url.includes('type=recovery') || event.url.includes('reset-password')) {
          console.log('Password reset link detected');
          const token = event.url.split('token=')[1]?.split('&')[0] || '';
          if (token) {
            console.log('Token found, redirecting to reset password screen');
            // Just navigate, Firebase flow handles session
            router.navigate(`/reset-password?token=${token}`);
            // Removed: await supabase.auth.signOut();
            // Note: May need to call Firebase logOut() from context here if a user *is*
            // somehow logged in when clicking the link, depending on desired UX.
          }
        }
      };

      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
      const subscription = Linking.addEventListener('url', handleDeepLink);
      return () => { subscription.remove(); };
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider style={styles.container}>
          <ExpoStatusBar style="dark" />
          {/* Render the AuthenticatedStack component */}
          <AuthenticatedStack />
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 