import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialLoading) {
      return; // Still loading, do nothing.
    }

    setIsReady(true); // Auth state is now known.

    const isAuthRoute = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password' || segments[0] === 'reset-password';
    const isVerifyEmailRoute = segments[0] === 'verify-email';

    // Case 1: Not logged in, and not on an auth/verify route -> redirect to login.
    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
        router.replace('/login');
    // Case 2: Logged in but email not verified, and not on the verify screen -> redirect to verify.
    } else if (user && !user.emailVerified && !isVerifyEmailRoute) {
      router.replace('/verify-email');
    // Case 3: Logged in and verified, but currently on an auth/verify route -> redirect to correct home screen.
    } else if (user && user.emailVerified && (isAuthRoute || isVerifyEmailRoute)) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/home');
      }
    // Case 4: Logged in, verified, and on a protected route, but is an admin not on the admin page -> redirect to admin.
    } else if (user && user.emailVerified && isAdmin && segments[0] !== 'admin') {
      router.replace('/admin');
    }
  }, [user, initialLoading, segments, router, isAdmin]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes('__/auth/action')) {
        handleSignInWithLink(event.url);
      } else if (event.url.includes('type=recovery') || event.url.includes('reset-password')) {
        const token = event.url.split('token=')[1]?.split('&')[0] || '';
        if (token) {
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

  // Show a loading screen while the app is determining the correct route,
  // especially for admins who might otherwise see a flash of the user home screen.
  if (!isReady || (isAdmin && segments[0] !== 'admin' && segments.length > 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#BD5151" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="admin" options={{ title: 'Admin', headerBackVisible: false }} />
      </Stack>
    </SafeAreaView>
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