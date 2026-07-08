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
import { UserProfile } from "@/core/context/AuthContext";
import {
  requestNotificationPermissions,
  getPushToken,
  storePushToken,
} from "@/lib/notifications";

// Hook for managing push notification registration
export const usePushNotifications = () => {
  // Register for push notifications and store token
  const registerForPushNotifications = async (
    userProfile: UserProfile,
    userId: string,
  ) => {
    try {
      // Check if push notifications are enabled
      if (userProfile.notificationPreferences?.push !== false) {
        const hasPermission = await requestNotificationPermissions();

        if (hasPermission) {
          const token = await getPushToken();

          if (token && token !== userProfile.pushToken) {
            await storePushToken(userId, token);
          }
        }
      }
    } catch (error) {
      console.error(
        "[usePushNotifications] Error registering for push notifications:",
        error,
      );
    }
  };

  return {
    registerForPushNotifications,
  };
};
