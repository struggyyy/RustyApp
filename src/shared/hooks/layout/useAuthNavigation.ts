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
import { useAuth } from "../../../core/context/AuthContext";

export const useAuthNavigation = () => {
  const { user, initialLoading, isAdmin, profileLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Handle navigation based on authentication state
  useEffect(() => {
    // Wait for auth initialization
    if (initialLoading) {
      return;
    }

    // Identify current route types
    const isAuthRoute =
      segments[0] === "login" ||
      segments[0] === "signup" ||
      segments[0] === "forgot-password" ||
      segments[0] === "verify-email";
    const isVerifyEmailRoute = segments[0] === "verify-email";
    const isAdminRoute =
      segments[0] === "admin" || segments[0] === "admin-profile";

    // Apply routing rules based on authentication state
    // Case 1: Not logged in, and not on an auth/verify route -> redirect to login.
    if (!user && !isAuthRoute && !isVerifyEmailRoute) {
      router.replace("/login");
      // Case 2: Logged in but email not verified, and not on the verify screen or an auth route -> redirect to verify.
    } else if (
      user &&
      !user.emailVerified &&
      !isAuthRoute &&
      !isVerifyEmailRoute
    ) {
      router.replace("/verify-email");
      // Case 3: Logged in and verified, but currently on an auth/verify route -> redirect to correct home screen.
    } else if (
      user &&
      user.emailVerified &&
      (isAuthRoute || isVerifyEmailRoute)
    ) {
      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
      // Case 4: Non-admin user trying to access admin route -> redirect to home.
    } else if (user && user.emailVerified && !isAdmin && isAdminRoute) {
      router.replace("/home");
      // Case 5: Admin user not on admin route -> redirect to admin.
    } else if (user && user.emailVerified && isAdmin && !isAdminRoute) {
      router.replace("/admin");
    }

    setIsReady(true);
  }, [user, initialLoading, segments, router, isAdmin]);

  // Determine if loading screen should be shown
  const shouldShowLoading = !isReady || (user && !profileLoaded);

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
