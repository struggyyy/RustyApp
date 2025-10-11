import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import * as Linking from 'expo-linking';
import styled from 'styled-components/native';

const StyledSafeAreaProvider = styled(SafeAreaProvider)`
  flex: 1;
  background-color: #FFFFFF;
`;

function AuthenticatedStack() {
  const { user, initialLoading, handleSignInWithLink, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initialLoading) {
      console.log('[AuthenticatedStack Effect] Waiting for initial auth load...');
      return;
    }

    const isAuthRoute = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password' || segments[0] === 'reset-password';
    const isVerifyEmailRoute = segments[0] === 'verify-email';

    console.log(`[AuthenticatedStack Effect] Auth loaded. User: ${!!user}, Verified: ${user?.emailVerified}, IsAuthRoute: ${isAuthRoute}, IsVerify: ${isVerifyEmailRoute}, Segments: ${segments.join('/')}`);

    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
      console.log('[AuthenticatedStack Effect] No user, redirecting to login...');
        router.replace('/login');
    } else if (user && !user.emailVerified && !isVerifyEmailRoute) {
      console.log('[AuthenticatedStack Effect] User exists but not verified, redirecting to verify-email...');
      router.replace('/verify-email');
    } else if (user && user.emailVerified && (isAuthRoute || isVerifyEmailRoute)) {
      if (isAdmin) {
        console.log('[AuthenticatedStack Effect] Admin user verified, redirecting to admin dashboard...');
        router.replace('/admin');
      } else {
        console.log('[AuthenticatedStack Effect] User verified, redirecting from auth/verify route to home...');
        router.replace('/home');
      }
    } else if (user && !user.emailVerified && isVerifyEmailRoute) {
      console.log('[AuthenticatedStack Effect] User not verified, correctly on verify screen.');
    } else if (user && user.emailVerified && !isAuthRoute && !isVerifyEmailRoute) {
      // This is a logged-in, verified user on a protected route.
      // Check if they are an admin and redirect if they are not on the admin page.
      if (isAdmin && segments[0] !== 'admin') {
        console.log('[AuthenticatedStack Effect] Admin user is on a non-admin page, redirecting to admin dashboard...');
        router.replace('/admin');
      } else {
        console.log('[AuthenticatedStack Effect] User verified, correctly on protected route.');
      }
    } else if (!user && (isAuthRoute || isVerifyEmailRoute)) {
      console.log('[AuthenticatedStack Effect] No user, correctly on public auth/verify route.');
    }
  }, [user, initialLoading, segments, router, isAdmin]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link detected:', event.url);
      if (event.url.includes('__/auth/action')) {
        console.log('Email action link detected');
        handleSignInWithLink(event.url);
      } else if (event.url.includes('type=recovery') || event.url.includes('reset-password')) {
        console.log('Password reset link detected');
        const token = event.url.split('token=')[1]?.split('&')[0] || '';
        if (token) {
          console.log('Token found, redirecting to reset password screen');
          router.navigate(`/reset-password?token=${token}`);
        }
      }
    };

    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
      const subscription = Linking.addEventListener('url', handleDeepLink);
      return () => {
        subscription.remove();
      };
    }
  }, [handleSignInWithLink, router]);

  return (
    <Stack>
      <Stack.Screen name="admin" options={{ title: 'Admin', headerBackVisible: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StyledSafeAreaProvider>
        <AuthProvider>
          <ExpoStatusBar style="dark" />
          <AuthenticatedStack />
        </AuthProvider>
      </StyledSafeAreaProvider>
    </GestureHandlerRootView>
  );
}