/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React specific imports
import React from "react";

// External libraries
import "react-native-url-polyfill/auto";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import styled from "styled-components/native";

// Internal imports
import { AuthProvider } from "../src/core/context/AuthContext";
import { HapticsProvider } from "../src/core/context/HapticsContext";
import { LanguageProvider } from "../src/core/context/LanguageContext";
import { useAuth } from "../src/core/context/AuthContext";
import HeaderBackButton from "../src/components/common/buttons/HeaderBackButton";
import LoadingScreen from "../src/components/common/modals/LoadingScreen";
import colors from "../src/core/theme/colors";
import { useAuthNavigation } from "../src/shared/hooks/layout/useAuthNavigation";
import { useDeepLinking } from "../src/shared/hooks/layout/useDeepLinking";
import "../src/core/i18n/i18n"; // Initialize i18n

// Styled components
const StyledSafeAreaProvider = styled(SafeAreaProvider)`
  flex: 1;
  background-color: ${colors.background.primary};
`;

// Main authenticated navigation component
function AuthenticatedStack() {
  // Router for navigation actions
  const router = useRouter();

  // Custom hooks for authentication navigation and deep linking
  const { shouldShowLoading, isAdminRouteAccessDenied } = useAuthNavigation();
  const { isAdmin, profileLoaded } = useAuth();
  useDeepLinking();

  // Show loading screen during authentication checks
  if (shouldShowLoading) {
    return <LoadingScreen />;
  }

  // Prevent non-admin users from accessing admin routes
  if (isAdminRouteAccessDenied) {
    return <LoadingScreen />;
  }

  // Stack navigator configuration for authenticated screens
  const screens = [
    ...(profileLoaded && isAdmin ? [
      <Stack.Screen
        key="admin"
        name="admin"
        options={{
          title: "Admin",
          headerBackVisible: false,
          headerLeft: undefined,
        }}
      />,
      <Stack.Screen key="admin-profile" name="admin-profile" options={{ title: "Admin Profile" }} />
    ] : []),
    <Stack.Screen
      key="home"
      name="home"
      options={{
        title: "Home",
        headerBackVisible: false,
        headerLeft: undefined,
      }}
    />,
    <Stack.Screen
      key="login"
      name="login"
      options={{
        title: "Login",
        headerBackVisible: false,
        headerLeft: undefined,
      }}
    />,
    <Stack.Screen key="signup" name="signup" options={{ title: "Sign Up" }} />,
    <Stack.Screen
      key="forgot-password"
      name="forgot-password"
      options={{ title: "Reset Password" }}
    />,
    <Stack.Screen
      key="verify-email"
      name="verify-email"
      options={{ title: "Verify Email", headerBackVisible: false }}
    />,
  ];

  return (
    <Stack
      screenOptions={{
        statusBarStyle: "dark",
        headerStyle: { backgroundColor: colors.background.primary },
        headerTransparent: false,
        contentStyle: { backgroundColor: colors.background.primary },
        headerTintColor: colors.text.primary,
        headerLeft: () => <HeaderBackButton onPress={() => router.back()} />,
      }}
    >
      {screens}
    </Stack>
  );
}

// Root layout component with all providers
export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <StyledSafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AuthProvider>
          <LanguageProvider>
            <HapticsProvider>
              <ExpoStatusBar
                style="dark"
                translucent={false}
                backgroundColor={colors.background.primary}
              />
              <AuthenticatedStack />
            </HapticsProvider>
          </LanguageProvider>
        </AuthProvider>
      </StyledSafeAreaProvider>
    </GestureHandlerRootView>
  );
}
