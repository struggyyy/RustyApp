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
// External libraries
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Internal imports
import { db } from "@/lib/firebase/firebase";
import { translate, translateStatus } from "@/shared/utils/serverTranslations";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

// Get push token
export const getPushToken = async (): Promise<string | null> => {
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.manifest2?.extra?.eas?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
};

// Store push token in user profile
export const storePushToken = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      pushToken: token,
      updatedAt: serverTimestamp(),
    });
    console.log("Push token stored successfully");
  } catch (error) {
    console.error("Error storing push token:", error);
    throw error;
  }
};

// Send push notification
export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: any,
  imageUrl?: string
): Promise<void> => {
  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data: data || {},
    ...(imageUrl && {
      image: imageUrl, // Android BigPicture
      attachments: [{ url: imageUrl }], // iOS Rich Push
    }),
  };

  try {
    // Send via Expo push service
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

// Send notification for report status change
export const sendReportStatusNotification = async (
  pushToken: string,
  reportId: string,
  oldStatus: string,
  newStatus: string,
  language: "en" | "pl" = "en",
  imageUrl?: string
): Promise<void> => {
  const title = translate("notifications.reportStatusUpdated", language);
  const translatedOldStatus = translateStatus(oldStatus, language);
  const translatedNewStatus = translateStatus(newStatus, language);
  const body = translate("notifications.reportStatusChanged", language, {
    oldStatus: translatedOldStatus,
    newStatus: translatedNewStatus,
  });
  const data = {
    type: "report_status_update",
    reportId,
    oldStatus,
    newStatus,
  };

  await sendPushNotification(pushToken, title, body, data, imageUrl);
};

// Send notification for new report submission to all admins
export const sendNewReportNotification = async (
  reportId: string,
  imageUrl: string,
  language: "en" | "pl" = "en"
): Promise<void> => {
  try {
    const title = translate("notifications.newReportSubmitted", language);
    const body = translate("notifications.newReportNotification", language);
    const data = {
      type: "new_report",
      reportId,
    };

    // Get all admin users
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);

    const adminNotifications: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      const adminData = doc.data();
      const pushToken = adminData.pushToken;
      const pushEnabled = adminData.notificationPreferences?.push !== false;

      if (pushToken && pushEnabled) {
        console.log(
          `[sendNewReportNotification] Sending notification to admin ${doc.id}...`
        );
        adminNotifications.push(
          sendPushNotification(pushToken, title, body, data, imageUrl)
        );
      }
    });

    if (adminNotifications.length > 0) {
      await Promise.all(adminNotifications);
      console.log(
        `[sendNewReportNotification] Sent new report notification to ${adminNotifications.length} admins`
      );
    } else {
      console.log(
        "[sendNewReportNotification] No admins found with push tokens enabled"
      );
    }
  } catch (error) {
    console.error(
      "[sendNewReportNotification] Error sending new report notifications:",
      error
    );
    throw error;
  }
};
