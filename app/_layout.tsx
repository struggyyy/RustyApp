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
import React, { useEffect, useState } from "react";

// External libraries
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
// Internal imports
import { AuthProvider, useAuth } from "@context/AuthContext";
import { HapticsProvider } from "@context/HapticsContext";
import { LanguageProvider } from "@context/LanguageContext";
import { AlertProvider } from "@context/AlertContext";
import { LayoutProvider } from "@context/LayoutContext";
import HeaderBackButton from "@components/common/buttons/HeaderBackButton";
import SplashScreenView from "@components/common/layout/SplashScreenView";
import { SplashTransition } from "@components/common/layout/SplashTransition";
import CustomAlert from "@components/common/modals/CustomAlert";
import colors from "@theme/colors";
import { useAuthNavigation } from "@/shared/hooks/layout/useAuthNavigation";
import { useDeepLinking } from "@/shared/hooks/layout/useDeepLinking";
import { useNotificationNavigation } from "@/shared/hooks/layout/useNotificationNavigation";
import "@/core/i18n/i18n"; // Initialize i18n

SplashScreen.preventAutoHideAsync().catch(() => {});

// Main authenticated navigation component
function AuthenticatedStack({
  shouldShowLoading,
  isAdminRouteAccessDenied,
}: {
  shouldShowLoading: boolean;
  isAdminRouteAccessDenied: boolean;
}) {
  // Router for navigation actions
  const router = useRouter();
  const { isAdmin, profileLoaded } = useAuth();

  // Initialize deep linking and notification listeners
  useDeepLinking();
  useNotificationNavigation();

  // Stack navigator configuration for authenticated screens
  const screens = [
    ...(profileLoaded && isAdmin
      ? [
          <Stack.Screen
            key="admin"
            name="admin"
            options={{
              title: "Admin",
              headerBackVisible: false,
              headerLeft: undefined,
            }}
          />,
          <Stack.Screen
            key="admin-profile"
            name="admin-profile"
            options={{ title: "Admin Profile" }}
          />,
        ]
      : []),
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

  const isLoading = shouldShowLoading || !!isAdminRouteAccessDenied;

  return (
    <SplashTransition isLoading={isLoading}>
      <Stack
        screenOptions={{
          statusBarStyle: "dark",
          headerStyle: { backgroundColor: colors.background.primary },
          headerTransparent: false,
          contentStyle: { backgroundColor: colors.background.primary },
          headerTintColor: colors.text.primary,
          headerLeft: () =>
            router.canGoBack() ? (
              <HeaderBackButton onPress={() => router.back()} />
            ) : null,
        }}
      >
        {screens}
      </Stack>
    </SplashTransition>
  );
}

function AppContent() {
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const { shouldShowLoading, isAdminRouteAccessDenied } = useAuthNavigation();

  useEffect(() => {
    // Hide native splash once JS overlay has mounted to ensure seamless transition
    SplashScreen.hideAsync().catch(() => {});
    setNativeSplashHidden(true);
  }, []);

  // Keep static splash screen until native splash hides AND auth state resolves initial route
  const isInitialLoading = !nativeSplashHidden || shouldShowLoading;

  return (
    <SplashScreenView isLoading={isInitialLoading}>
      <AuthenticatedStack
        shouldShowLoading={shouldShowLoading}
        isAdminRouteAccessDenied={isAdminRouteAccessDenied}
      />
    </SplashScreenView>
  );
}

// Root layout component with all providers
export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <AuthProvider>
          <LanguageProvider>
            <HapticsProvider>
              <AlertProvider>
                <LayoutProvider>
                  <ExpoStatusBar
                    style="dark"
                    translucent={true}
                    backgroundColor="transparent"
                  />
                  <AppContent />
                  <CustomAlert />
                </LayoutProvider>
              </AlertProvider>
            </HapticsProvider>
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
