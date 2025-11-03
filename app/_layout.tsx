import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { HapticsProvider } from '../src/context/HapticsContext';
import * as Linking from 'expo-linking';
import styled from 'styled-components/native';
import HeaderBackButton from '../src/components/common/buttons/HeaderBackButton';
import colors from '../src/theme/colors';

const StyledSafeAreaProvider = styled(SafeAreaProvider)`
  flex: 1;
  background-color: #FFFFFF;
`;

function AuthenticatedStack() {
  const { user, initialLoading, handleSignInWithLink, isAdmin, profileLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialLoading) {
      return; // Still loading, do nothing.
    }

    const isAuthRoute = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password' || segments[0] === 'reset-password';
    const isVerifyEmailRoute = segments[0] === 'verify-email';
    const isAdminRoute = segments[0] === 'admin' || segments[0] === 'admin-profile';

    // Case 1: Not logged in, and not on an auth/verify route -> redirect to login.
    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
        router.replace('/login');
    // Case 2: Logged in but email not verified, and not on the verify screen or an auth route -> redirect to verify.
    } else if (user && !user.emailVerified && !isAuthRoute && !isVerifyEmailRoute) {
      router.replace('/verify-email');
    // Case 3: Logged in and verified, but currently on an auth/verify route -> redirect to correct home screen.
    } else if (user && user.emailVerified && (isAuthRoute || isVerifyEmailRoute)) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/home');
      }
    // Case 4: Non-admin user trying to access admin route -> redirect to home.
    } else if (user && user.emailVerified && !isAdmin && isAdminRoute) {
      router.replace('/home');
    // Case 5: Admin user not on admin route -> redirect to admin.
    } else if (user && user.emailVerified && isAdmin && !isAdminRoute) {
      router.replace('/admin');
    }

    setIsReady(true); // Auth state is now known.

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

  // Show a loading screen while the app is determining the correct route.
  // This prevents flashing of wrong screens during redirects.
  if (!isReady || (user && !profileLoaded)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#BD5151" />
      </View>
    );
  }

  // Additional safety: prevent non-admin users from seeing admin screen
  if (user && !isAdmin && (segments[0] === 'admin' || segments[0] === 'admin-profile')) {
    router.replace('/home');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#BD5151" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        statusBarStyle: 'dark',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTransparent: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: colors.text.primary,
        headerLeft: () => (
          <HeaderBackButton onPress={() => router.back()} />
        ),
      }}
    >
      <Stack.Screen name="admin" options={{ title: 'Admin', headerBackVisible: false, headerLeft: undefined }} />
      <Stack.Screen name="admin-profile" options={{ title: 'Admin Profile' }} />
      <Stack.Screen name="home" options={{ title: 'Home', headerBackVisible: false, headerLeft: undefined }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerBackVisible: false, headerLeft: undefined }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verify Email', headerBackVisible: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StyledSafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AuthProvider>
          <HapticsProvider>
            <ExpoStatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
            <AuthenticatedStack />
          </HapticsProvider>
        </AuthProvider>
      </StyledSafeAreaProvider>
    </GestureHandlerRootView>
  );
}