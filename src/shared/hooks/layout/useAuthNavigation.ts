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
import { useEffect, useState } from "react";

// External libraries
import { useRouter, useSegments } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useLayout } from "@/core/context/LayoutContext";

export const useAuthNavigation = () => {
  const { user, initialLoading, isAdmin, profileLoaded, error } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [profileLoadTimeout, setProfileLoadTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // Identify current route types
  const isAuthRoute =
    segments[0] === "login" ||
    segments[0] === "signup" ||
    segments[0] === "forgot-password" ||
    segments[0] === "verify-email";
  const isVerifyEmailRoute = segments[0] === "verify-email";
  const isAdminRoute =
    segments[0] === "admin" || segments[0] === "admin-profile";

  // Handle navigation based on authentication state
  useEffect(() => {
    // Wait for auth initialization
    if (initialLoading) {
      return;
    }

    // Clear any existing timeout
    if (profileLoadTimeout) {
      clearTimeout(profileLoadTimeout);
      setProfileLoadTimeout(null);
    }

    // Handle profile loading error - redirect to login to allow re-authentication
    if (user && error) {
      if (!isAuthRoute) {
        router.replace("/login");
      }
      setIsReady(true);
      return;
    }

    // Apply routing rules based on authentication state
    // Case 1: Not logged in, and not on an auth/verify route -> redirect to login.
    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
      router.replace("/login");
      // Case 2: Logged in but email not verified, and not on the verify screen or an auth route -> redirect to verify.
    } else if (
      user &&
      !user.emailVerified &&
      !isVerifyEmailRoute &&
      segments[0] !== "forgot-password"
    ) {
      router.replace("/verify-email");
      // Case 3: Logged in and verified, but currently on an auth/verify route -> redirect to correct home screen.
    } else if (
      user &&
      user.emailVerified &&
      (isAuthRoute || isVerifyEmailRoute)
    ) {
      // For admin users, wait for profile to load before redirecting
      if (isAdmin && profileLoaded) {
        router.replace("/admin");
      } else if (!isAdmin || error) {
        router.replace("/home");
      }
      // Set timeout for profile loading (10 seconds)
      else if (isAdmin && !profileLoaded && !error) {
        const timeout = setTimeout(() => {
          // If profile still hasn't loaded after 10 seconds, assume non-admin
          console.warn("Profile loading timeout - redirecting to home");
          router.replace("/home");
        }, 10000);
        setProfileLoadTimeout(timeout);
      }
      // Case 4: Non-admin user trying to access admin route -> redirect to home.
    } else if (user && user.emailVerified && !isAdmin && isAdminRoute) {
      router.replace("/home");
      // Case 5: Admin user not on admin route -> redirect to admin (only after profile is loaded).
    } else if (
      user &&
      user.emailVerified &&
      isAdmin &&
      profileLoaded &&
      !isAdminRoute
    ) {
      router.replace("/admin");
      // Case 6: Regular user on Index -> redirect to home
    } else if (
      user &&
      user.emailVerified &&
      !isAdmin &&
      profileLoaded &&
      ((segments.length as number) === 0 || segments[0] === "index")
    ) {
      router.replace("/home");
    }

    setIsReady(true);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (profileLoadTimeout) {
        clearTimeout(profileLoadTimeout);
      }
    };
  }, [
    user,
    initialLoading,
    segments,
    router,
    isAdmin,
    profileLoaded,
    error,
    profileLoadTimeout,
  ]);

  const { isMapReady, isAdminDataReady } = useLayout();

  // Check if we are in the process of redirecting an admin to the admin page
  const isRedirectingToAdmin =
    user && isAdmin && profileLoaded && !isAdminRoute;

  // Check if we are waiting for map to load on home screen (regular users only)
  const isWaitingForMap =
    user &&
    !isAdmin &&
    profileLoaded &&
    ((segments.length as number) === 0 || segments[0] === "index") &&
    !isMapReady;

  // Check if we are waiting for admin data to load (admin users only)
  const isWaitingForAdminData =
    user && isAdmin && profileLoaded && isAdminRoute && !isAdminDataReady;

  // Determine if loading screen should be shown
  const shouldShowLoading =
    !isReady ||
    (user && !profileLoaded && !isAuthRoute && !isVerifyEmailRoute) ||
    isRedirectingToAdmin ||
    isWaitingForMap ||
    isWaitingForAdminData;

  // Check if user is trying to access admin routes without permission
  const isAdminRouteAccessDenied =
    user &&
    !isAdmin &&
    (segments[0] === "admin" || segments[0] === "admin-profile");

  return {
    shouldShowLoading,
    isAdminRouteAccessDenied,
  };
};
