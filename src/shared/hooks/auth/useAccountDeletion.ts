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
import { deleteUser } from "firebase/auth";
import { doc, writeBatch } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

// Internal imports
import { db, storage } from "@/lib/firebase/firebase";
import { getReportsByUserId } from "@/lib/firebase/reports";
import { UserProfile } from "@/core/context/AuthContext";

// Hook for account deletion functionality
export const useAccountDeletion = () => {
  // Delete user account and ALL associated data atomically
  const deleteAccount = async (
    currentUser: any,
    profile: UserProfile | null,
  ): Promise<void> => {
    if (!currentUser) {
      throw new Error("No user is currently logged in to delete.");
    }

    console.log(
      `[useAccountDeletion] Starting account deletion for user: ${currentUser.uid}`,
    );

    try {
      // 1. Get all user reports
      const reports = await getReportsByUserId(currentUser.uid);
      console.log(
        `[useAccountDeletion] Found ${reports.length} reports to delete.`,
      );

      // 2. Delete all report images from Storage (blocking operation)
      const imageDeletionPromises: Promise<void>[] = [];
      reports.forEach((report) => {
        if (report.imageUrl) {
          const imageRef = ref(storage, report.imageUrl);
          imageDeletionPromises.push(deleteObject(imageRef));
        }
      });

      // 3. Delete user's profile picture from Storage (blocking operation)
      if (profile?.profileImage) {
        console.log(
          `[useAccountDeletion] Deleting profile image: ${profile.profileImage}`,
        );
        const profileImageRef = ref(storage, profile.profileImage);
        imageDeletionPromises.push(deleteObject(profileImageRef));
      }

      // Execute all image deletions - if any fail, the entire process fails
      if (imageDeletionPromises.length > 0) {
        await Promise.all(imageDeletionPromises);
        console.log(
          "[useAccountDeletion] All associated images have been deleted from Storage.",
        );
      }

      // 4. Delete all Firestore documents atomically (reports + user profile)
      const batch = writeBatch(db);
      reports.forEach((report) => {
        const reportDocRef = doc(db, "reports", report.id);
        batch.delete(reportDocRef);
      });
      const userDocRef = doc(db, "users", currentUser.uid);
      batch.delete(userDocRef);

      await batch.commit();
      console.log(
        "[useAccountDeletion] All Firestore documents (reports and user profile) deleted.",
      );

      // 5. Delete Firebase Auth user (only after all data is successfully deleted)
      await deleteUser(currentUser);
      console.log(
        `[useAccountDeletion] Firebase Auth user deleted successfully: ${currentUser.uid}`,
      );
    } catch (e: any) {
      console.error("[useAccountDeletion] Account deletion process failed:", e);

      // Handle specific Firebase Auth errors with error codes for i18n
      if (e.code === "auth/requires-recent-login") {
        const error = new Error();
        (error as any).code = "auth/requires-recent-login";
        throw error;
      }

      // Handle storage deletion errors
      if (e.message?.includes("storage") || e.code?.startsWith("storage/")) {
        const error = new Error();
        (error as any).code = "deleteAccount/storageError";
        throw error;
      }

      // Handle Firestore deletion errors
      if (
        e.message?.includes("firestore") ||
        e.code?.startsWith("firestore/")
      ) {
        const error = new Error();
        (error as any).code = "deleteAccount/firestoreError";
        throw error;
      }

      // Generic error with code for i18n
      const error = new Error();
      (error as any).code = "deleteAccount/genericError";
      throw error;
    }
  };

  return {
    deleteAccount,
  };
};
