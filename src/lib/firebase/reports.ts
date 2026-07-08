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
import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
  increment,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";

// Internal imports
import { db, storage } from "./firebase";
import { Report, ReportStatus } from "@/shared/types/reports";
import {
  sendReportStatusNotification,
  sendNewReportNotification,
} from "@/lib/notifications";

// Upload report image to Firebase Storage
export const uploadReportImage = (
  imageUri: string,
  userId: string,
  fileName: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("uploadReportImage: Starting upload process for:", imageUri);

      // Convert image URI to blob using fetch
      const response = await fetch(imageUri);
      const blob: Blob = await response.blob();

      console.log("uploadReportImage: Blob created from imageUri using fetch.");

      const storageRef = ref(storage, `reports/${userId}/${fileName}`);
      const metadata = { contentType: "image/jpeg" };

      console.log("uploadReportImage: Calling uploadBytesResumable...");
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
          if ((error as any).serverResponse) {
            console.error("Server response:", (error as any).serverResponse);
          }
          reject(new Error("Image upload failed."));
        },
        async () => {
          try {
            console.log(
              "uploadReportImage: Upload complete! Getting download URL...",
            );
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(
              "uploadReportImage: Download URL received:",
              downloadURL,
            );
            resolve(downloadURL);
          } catch (error) {
            console.error(
              "Error getting download URL after successful upload:",
              error,
            );
            reject(
              new Error("Image uploaded, but failed to get download URL."),
            );
          }
        },
      );
    } catch (error) {
      console.error("Error preparing image for upload or during fetch:", error);
      reject(new Error("Image could not be prepared for upload."));
    }
  });
};

// Create new report document in Firestore
export const createReport = async (reportData: {
  userId: string;
  userEmail: string;
  description: string;
  location: { latitude: number; longitude: number };
  imageUrl: string;
}): Promise<Report> => {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      userId: reportData.userId,
      userEmail: reportData.userEmail,
      description: reportData.description,
      location: new GeoPoint(
        reportData.location.latitude,
        reportData.location.longitude,
      ),
      imageUrl: reportData.imageUrl,
      createdAt: serverTimestamp(),
      status: "Submitted",
      points: 0,
    });

    console.log("Report created with ID: ", docRef.id);

    // Send notification to all admins about the new report
    try {
      console.log(
        `[createReport] Sending new report notification to admins for report ${docRef.id}...`,
      );
      await sendNewReportNotification(docRef.id);
      console.log(`[createReport] New report notification sent successfully`);
    } catch (notificationError) {
      console.error(
        "[createReport] Error sending new report notification:",
        notificationError,
      );
      // Don't throw error for notification failure - report creation should still succeed
    }

    // Return report object with client-side timestamp for immediate feedback
    const newReport: Report = {
      ...reportData,
      id: docRef.id,
      createdAt: Timestamp.now(), // Use a client-side timestamp for immediate feedback
      location: new GeoPoint(
        reportData.location.latitude,
        reportData.location.longitude,
      ),
      status: "Submitted",
      points: 0,
    };
    return newReport;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Report could not be created.");
  }
};

// Fetch all reports submitted by a specific user
export const getReportsByUserId = async (userId: string): Promise<Report[]> => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw new Error("Could not fetch reports.");
  }
};

// Delete image from Firebase Storage
export const deleteReportImage = async (imageUrl: string) => {
  if (!imageUrl) return; // Do nothing if the URL is not provided

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === "storage/object-not-found") {
      console.warn(`Image at ${imageUrl} not found, but proceeding.`);
    } else {
      console.error(`Failed to delete image at ${imageUrl}:`, error);
      throw error;
    }
  }
};

// Update report status and handle point adjustments
export const updateReportStatus = async (
  reportId: string,
  userId: string,
  currentStatus: ReportStatus,
  newStatus: ReportStatus,
  imageUrl?: string,
): Promise<void> => {
  if (currentStatus === newStatus) return; // No change, do nothing

  const reportDocRef = doc(db, "reports", reportId);
  const userDocRef = doc(db, "users", userId);

  const pointsMap: Record<ReportStatus, number> = {
    Submitted: 0,
    Accepted: 10,
    Completed: 100,
    Canceled: 0,
  };

  const pointsForCurrentStatus = pointsMap[currentStatus] || 0;
  const pointsForNewStatus = pointsMap[newStatus] || 0;

  const pointsDifference = pointsForNewStatus - pointsForCurrentStatus;

  try {
    const batch = writeBatch(db);

    // Update the report's status and points
    batch.update(reportDocRef, {
      status: newStatus,
      points: pointsForNewStatus,
    });

    // Update the user's total points
    if (pointsDifference !== 0) {
      batch.update(userDocRef, { points: increment(pointsDifference) });
    }

    await batch.commit();
    console.log(
      `Report ${reportId} status updated to ${newStatus}. User ${userId} points adjusted by ${pointsDifference}.`,
    );

    // Send push notification if enabled
    try {
      console.log(
        `[updateReportStatus] Checking notification settings for user ${userId}...`,
      );
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const pushToken = userData.pushToken;
        const pushEnabled = userData.notificationPreferences?.push !== false;
        const userRole = userData.role;

        console.log(
          `[updateReportStatus] User ${userId} push enabled: ${pushEnabled}`,
        );
        console.log(
          `[updateReportStatus] User ${userId} has push token: ${!!pushToken}`,
        );
        console.log(`[updateReportStatus] User ${userId} role: ${userRole}`);
        console.log(
          `[updateReportStatus] Push token preview: ${
            pushToken ? pushToken.substring(0, 20) + "..." : "null"
          }`,
        );

        // Only send notifications to regular users, not admins
        if (pushToken && pushEnabled && userRole !== "admin") {
          console.log(
            `[updateReportStatus] Sending push notification to user ${userId}...`,
          );
          const userLanguage = userData.language || "en"; // Default to English if no language set
          await sendReportStatusNotification(
            pushToken,
            reportId,
            currentStatus,
            newStatus,
            userLanguage,
          );
          console.log(
            `[updateReportStatus] Push notification sent successfully to user ${userId} for report ${reportId}`,
          );
        } else {
          const skipReason = !pushToken
            ? "no push token"
            : !pushEnabled
              ? "push disabled"
              : userRole === "admin"
                ? "user is admin"
                : "unknown";
          console.log(
            `[updateReportStatus] Skipping push notification: ${skipReason}`,
          );
        }
      } else {
        console.log(
          `[updateReportStatus] User document not found for ${userId}`,
        );
      }
    } catch (notificationError) {
      console.error(
        "[updateReportStatus] Error sending push notification:",
        notificationError,
      );
      // Don't throw error for notification failure
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status.");
  }
};

// Fetch all reports for admin use
export const getAllReports = async (): Promise<Report[]> => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw new Error("Could not fetch all reports.");
  }
};

// Delete report and associated image
export const deleteReport = async (reportId: string, imageUrl: string) => {
  if (!reportId) {
    throw new Error("Report ID is required to delete a report.");
  }

  try {
    // Delete the image from Storage first
    await deleteReportImage(imageUrl);

    // Then delete the report document from Firestore
    const reportDocRef = doc(db, "reports", reportId);
    await deleteDoc(reportDocRef);

    console.log(
      `Report ${reportId} and associated image deleted successfully.`,
    );
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete report. Please check logs for details.");
  }
};
