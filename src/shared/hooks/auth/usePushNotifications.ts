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
import { Alert } from "react-native";
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
    userId: string
  ) => {
    try {
      // Check if push notifications are enabled
      if (userProfile.notificationPreferences?.push !== false) {
        const hasPermission = await requestNotificationPermissions();

        if (hasPermission) {
          const token = await getPushToken();

          if (token && token !== userProfile.pushToken) {
            try {
              await storePushToken(userId, token);
              Alert.alert("Debug", "Push Token SAVED to Database!");
            } catch (dbError: any) {
              Alert.alert(
                "Debug DB Error",
                `Failed to save token: ${dbError.message}`
              );
              console.error("[usePushNotifications] DB Error:", dbError);
            }
          } else if (token) {
            // Token exists but matches profile, or some other case
            // Alert.alert("Debug", "Token already up to date");
          } else {
            Alert.alert("Debug", "Token was null");
          }
        } else {
          Alert.alert("Debug", "Notification Permissions DENIED");
        }
      }
    } catch (error: any) {
      console.error(
        "[usePushNotifications] Error registering for push notifications:",
        error
      );
      Alert.alert("Debug Flow Error", error.message);
    }
  };

  return {
    registerForPushNotifications,
  };
};
