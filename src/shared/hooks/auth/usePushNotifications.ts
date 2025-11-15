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
// Internal imports
import { UserProfile } from "../../../core/context/AuthContext";
import {
  requestNotificationPermissions,
  getPushToken,
  storePushToken,
} from "../../../lib/notifications";

// Hook for managing push notification registration
export const usePushNotifications = () => {
  // Register for push notifications and store token
  const registerForPushNotifications = async (
    userProfile: UserProfile,
    userId: string
  ) => {
    try {
      console.log(
        "[usePushNotifications] Starting push notification registration for user:",
        userId
      );
      console.log(
        "[usePushNotifications] User notification preferences:",
        userProfile.notificationPreferences
      );

      // Check if push notifications are enabled
      if (userProfile.notificationPreferences?.push !== false) {
        // Default to true if not set
        console.log(
          "[usePushNotifications] Push notifications enabled, requesting permissions..."
        );
        const hasPermission = await requestNotificationPermissions();
        console.log(
          "[usePushNotifications] Permission granted:",
          hasPermission
        );

        if (hasPermission) {
          console.log("[usePushNotifications] Getting push token...");
          const token = await getPushToken();
          console.log(
            "[usePushNotifications] Push token obtained:",
            token ? token.substring(0, 20) + "..." : "null"
          );

          if (token && token !== userProfile.pushToken) {
            console.log("[usePushNotifications] Storing new push token...");
            await storePushToken(userId, token);
            console.log(
              "[usePushNotifications] Push token stored successfully."
            );
          } else if (token === userProfile.pushToken) {
            console.log(
              "[usePushNotifications] Push token already up to date."
            );
          } else {
            console.log("[usePushNotifications] No token to store.");
          }
        } else {
          console.log(
            "[usePushNotifications] Push notification permission denied."
          );
        }
      } else {
        console.log(
          "[usePushNotifications] Push notifications disabled in user preferences."
        );
      }
    } catch (error) {
      console.error(
        "[usePushNotifications] Error registering for push notifications:",
        error
      );
    }
  };

  return {
    registerForPushNotifications,
  };
};
