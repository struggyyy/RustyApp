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
// React-specific imports
import { useEffect } from "react";

// External libraries
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";

export const useDeepLinking = () => {
  const { handleSignInWithLink } = useAuth();
  const router = useRouter();

  // Handle deep links for authentication flows and notifications
  useEffect(() => {
    // Process different types of deep link URLs
    const handleDeepLink = (event: { url: string }) => {
      // Handle email verification links
      if (event.url.includes("__/auth/action")) {
        handleSignInWithLink(event.url);
      }
      // Handle password reset links
      else if (
        event.url.includes("type=recovery") ||
        event.url.includes("reset-password")
      ) {
        const token = event.url.split("token=")[1]?.split("&")[0] || "";
        if (token) {
          router.navigate(`/reset-password?token=${token}`);
        }
      }
      // Handle notification deep links (for report notifications)
      else if (event.url.includes("reportId=")) {
        const reportId = event.url.split("reportId=")[1]?.split("&")[0] || "";
        if (reportId) {
          // Navigate to admin page with reportId parameter to open specific report modal
          router.navigate(`/admin?reportId=${reportId}`);
        }
      }
    };

    // Set up deep linking listeners for native platforms
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Cleanup event listener
    return () => {
      subscription.remove();
    };
  }, [handleSignInWithLink, router]);
};
