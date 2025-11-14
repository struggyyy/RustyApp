import { useEffect } from "react";
import { Platform } from "react-native";

// External libraries
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

// Internal imports
import { useAuth } from "../../../core/context/AuthContext";

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

    // Set up deep linking listeners (non-web platforms only)
    if (Platform.OS !== "web") {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
      const subscription = Linking.addEventListener("url", handleDeepLink);

      // Cleanup event listener
      return () => {
        subscription.remove();
      };
    }
  }, [handleSignInWithLink, router]);
};
