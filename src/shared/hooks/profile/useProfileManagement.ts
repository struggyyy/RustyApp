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
import { User, updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Internal imports
import { db, storage } from "../../../lib/firebase/firebase";
import { UserProfile } from "../../../core/context/AuthContext";

// Hook for managing user profiles (creation, updates, uploads)
export const useProfileManagement = () => {
  // Create initial profile for new users
  const createInitialProfile = async (
    userToCreateFor: User,
    nickname?: string,
    language?: "en" | "pl"
  ) => {
    console.log(
      `[useProfileManagement] Creating initial profile for: ${userToCreateFor.uid}`
    );
    const userDocRef = doc(db, "users", userToCreateFor.uid);
    const initialProfileData: UserProfile = {
      id: userToCreateFor.uid,
      email: userToCreateFor.email || "Unknown Email",
      displayName: nickname || userToCreateFor.displayName || "Nickname",
      createdAt: serverTimestamp(),
      notificationPreferences: { email: true, push: true, haptics: true },
      language: language || "en", // Use provided language or default to 'en'
      role: "user", // Set default role for new users
      points: 0,
    };
    try {
      await setDoc(userDocRef, initialProfileData);
      console.log(
        "[useProfileManagement] Initial user profile created in Firestore."
      );
      return initialProfileData;
    } catch (creationError: any) {
      console.error(
        "[useProfileManagement] Failed to create initial profile:",
        creationError
      );
      throw creationError;
    }
  };

  // Update user profile data in Firestore
  const updateUserProfile = async (
    userId: string,
    updates: Partial<UserProfile>,
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
  ) => {
    try {
      console.log(
        `[useProfileManagement] Updating Firestore profile for user: ${userId}`,
        updates
      );
      const userDocRef = doc(db, "users", userId);
      const updateData = { ...updates, updatedAt: serverTimestamp() };
      await updateDoc(userDocRef, updateData);
      console.log(
        "[useProfileManagement] Firestore profile updated successfully."
      );

      // Optimistically update local profile state
      setProfile((prev: UserProfile | null) =>
        prev ? { ...prev, ...updateData } : null
      );
    } catch (e: any) {
      console.error(
        "[useProfileManagement] Firestore profile update error:",
        e
      );
      throw e;
    }
  };

  // Update user authentication details
  const updateUserAuth = async (
    currentUser: any,
    updates: {
      displayName?: string | null;
      photoURL?: string | null;
      email?: string;
    },
    setUser: React.Dispatch<React.SetStateAction<any>>
  ) => {
    try {
      console.log(
        `[useProfileManagement] Updating Firebase Auth profile for user: ${currentUser.uid}`,
        updates
      );

      // Separate email update if provided, as it might require verification
      if (updates.email && updates.email !== currentUser.email) {
        await currentUser.updateEmail(updates.email);
        console.log(
          "[useProfileManagement] User email update initiated/completed."
        );
        // Remove email from the profile update object
        delete updates.email;
      }

      // Update displayName and photoURL if present
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(currentUser, {
          displayName:
            updates.displayName !== undefined
              ? updates.displayName
              : currentUser.displayName,
          photoURL:
            updates.photoURL !== undefined
              ? updates.photoURL
              : currentUser.photoURL,
        });
        console.log(
          "[useProfileManagement] Firebase Auth profile (displayName/photoURL) updated."
        );
      }

      // Refresh local user state
      setUser(currentUser);
    } catch (e: any) {
      console.error("[useProfileManagement] Firebase Auth update error:", e);
      throw e;
    }
  };

  // Upload profile image to Firebase Storage
  const uploadProfileImage = async (
    userId: string,
    fileUri: string,
    updateUserAuth: (updates: { photoURL?: string }) => Promise<void>,
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  ): Promise<string | undefined> => {
    if (!userId) throw new Error("User ID is required for upload.");

    try {
      console.log(
        `[useProfileManagement] Uploading profile image for user: ${userId}`
      );

      // Create blob from file URI
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Define storage path - matches Firebase Storage rules: profileImages/{userId}/{imageId}
      const fileExtension = fileUri.split(".").pop();
      const imageId = `${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profileImages/${userId}/${imageId}`);

      console.log(
        `[useProfileManagement] Uploading to storage path: ${storageRef.fullPath}`
      );

      // Upload file
      const snapshot = await uploadBytes(storageRef, blob);
      console.log(
        "[useProfileManagement] Image uploaded successfully:",
        snapshot.metadata.fullPath
      );

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("[useProfileManagement] Image download URL:", downloadURL);

      // Update user profile (both Auth and Firestore)
      await updateUserAuth({ photoURL: downloadURL });
      await updateUserProfile({ profileImage: downloadURL });

      console.log(
        "[useProfileManagement] Profile image URL updated in Auth and Firestore."
      );
      return downloadURL;
    } catch (e: any) {
      console.error("[useProfileManagement] Profile image upload error:", e);
      throw e;
    }
  };

  return {
    createInitialProfile,
    updateUserProfile,
    updateUserAuth,
    uploadProfileImage,
  };
};
