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
import { useEffect } from "react";

// External libraries
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

export const useNotificationNavigation = () => {
  const router = useRouter();

  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse,
    ) => {
      const data = response.notification.request.content.data;
      if (data && data.type === "new_report" && data.reportId) {
        // Navigate to admin page with specific report to open modal
        router.navigate(`/admin?reportId=${data.reportId}`);
      } else if (
        data &&
        data.type === "report_status_update" &&
        data.reportId
      ) {
        // Navigate to my reports page with specific report to open modal
        router.navigate(`/my-reports?reportId=${data.reportId}`);
      }
    };

    // Handle cold starts (app opened from notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Handle background/foreground taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

    return () => subscription.remove();
  }, [router]);
};
