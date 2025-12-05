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
import { useState, useCallback } from "react";

// External libraries
import * as ImagePicker from "expo-image-picker";
import { ref, deleteObject } from "firebase/storage";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useAlert } from "@/core/context/AlertContext";
import { storage } from "@/lib/firebase/firebase";

// Hook options interface
interface UseProfileEditOptions {
  t: (key: string, options?: any) => string;
  onShake?: () => void;
}

// Main hook function
export function useProfileEdit({ t, onShake }: UseProfileEditOptions) {
  // Profile editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auth hooks
  const { user, profile, uploadProfileImage, updateUserProfile } = useAuth();
  const { showAlert } = useAlert();

  // Handle nickname change with validation
  const handleEditedNicknameChange = useCallback(
    (text: string) => {
      if (text.length > editedNickname.length && editedNickname.length >= 15) {
        onShake?.();
      }
      if (text.length <= 15) {
        setEditedNickname(text);
      }
    },
    [editedNickname.length, onShake]
  );

  // Choose photo from library
  const handleChoosePhoto = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert(t("common.error"), t("permissions.cameraRollRequired"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTempImageUri(result.assets[0].uri);
        setImageRemoved(false); // Reset remove flag when selecting new image
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showAlert(t("common.error"), t("profile.imageSelectError"));
    }
  }, [showAlert, t]);

  // Validate and save profile
  const handleSaveProfile = useCallback(async () => {
    if (!user?.uid) throw new Error("User not found");

    // Validate nickname length
    if (editedNickname.length < 2) {
      showAlert(t("common.error"), t("validation.nicknameTooShort"));
      return;
    }
    if (editedNickname.length > 15) {
      showAlert(t("common.error"), t("validation.nicknameTooLong"));
      return;
    }

    setUploading(true);
    try {
      // Store old image URL for deletion after successful upload
      const oldImageUrl = profile?.profileImage || user?.photoURL;
      let newImageUrl: string | undefined;

      // Handle image changes
      if (tempImageUri) {
        // Upload new profile picture
        newImageUrl = await uploadProfileImage(user.uid, tempImageUri);
      } else if (imageRemoved && oldImageUrl) {
        // User explicitly removed the image - delete from Firebase and clear profile
        try {
          const url = new URL(oldImageUrl);
          const path = decodeURIComponent(url.pathname.split("/o/")[1]);
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log("Profile image deleted successfully");
        } catch (deleteError: any) {
          // Handle object-not-found errors gracefully (expected for first-time users)
          if (deleteError.code === "storage/object-not-found") {
            console.debug(
              "Profile image did not exist in storage - skipping deletion"
            );
          } else {
            // Log other deletion errors as warnings
            console.warn(
              "Could not delete profile image:",
              deleteError.message
            );
          }
        }
        // Update profile to remove image URL
        await updateUserProfile({ profileImage: null });
      }

      // Safely delete old profile image only after successful upload
      if (oldImageUrl && newImageUrl) {
        try {
          const url = new URL(oldImageUrl);
          const path = decodeURIComponent(url.pathname.split("/o/")[1]);
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log("Old profile image deleted successfully");
        } catch (deleteError: any) {
          // Handle object-not-found errors gracefully
          if (deleteError.code === "storage/object-not-found") {
            console.debug(
              "Old profile image did not exist in storage - skipping deletion"
            );
          } else {
            // Log other deletion errors as warnings
            console.warn(
              "Could not delete old profile image:",
              deleteError.message
            );
          }
        }
      }

      // Update display name if changed
      if (
        editedNickname &&
        editedNickname !== (profile?.displayName || user?.displayName)
      ) {
        await updateUserProfile({ displayName: editedNickname });
      }

      showAlert(t("common.success"), t("profile.profileUpdated"));
      setIsEditMode(false);
      setTempImageUri(null);
    } catch (error: any) {
      console.error("Update error:", error);
      showAlert(t("common.error"), error.message || t("profile.updateError"));
    } finally {
      setUploading(false);
    }
  }, [
    user,
    profile,
    editedNickname,
    tempImageUri,
    imageRemoved,
    uploadProfileImage,
    updateUserProfile,
    showAlert,
    t,
  ]);

  // Handle photo removal (local state only - Firebase deletion happens on save)
  const handleRemoveImage = useCallback(() => {
    setTempImageUri(null);
    setImageRemoved(true);
  }, []);

  // Cancel edit and reset state
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setTempImageUri(null);
    setImageRemoved(false);
    setEditedNickname(profile?.displayName || user?.displayName || "");
  }, [profile?.displayName, user?.displayName]);

  return {
    // State
    isEditMode,
    editedNickname,
    tempImageUri,
    imageRemoved,
    uploading,

    // Setters
    setIsEditMode,
    setEditedNickname,
    setTempImageUri,
    setImageRemoved,
    setUploading,

    // Actions
    handleEditedNicknameChange,
    handleChoosePhoto,
    handleSaveProfile,
    handleCancelEdit,
    handleRemoveImage,
  };
}
