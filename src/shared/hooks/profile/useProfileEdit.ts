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
import { useAlert } from "../../../core/context/AlertContext";
import { storage } from "@/lib/firebase/firebase";

// Hook options interface
interface UseProfileEditOptions {
  t: (key: string, options?: any) => string;
}

// Main hook function
export function useProfileEdit({ t }: UseProfileEditOptions) {
  // Profile editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Auth hooks
  const { user, profile, uploadProfileImage, updateUserProfile } = useAuth();
  const { showAlert } = useAlert();

  // Handle nickname change with validation
  const handleEditedNicknameChange = useCallback((text: string) => {
    if (text.length <= 15) {
      setEditedNickname(text);
    }
  }, []);

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
      // Delete old profile image if it exists and we're replacing it
      const oldImageUrl = profile?.profileImage || user?.photoURL;
      if (oldImageUrl && tempImageUri) {
        const url = new URL(oldImageUrl);
        const path = decodeURIComponent(url.pathname.split("/o/")[1]);
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
        console.log("Old profile image deleted successfully");
      }

      // Upload new profile picture if changed (only after old image is successfully deleted)
      if (tempImageUri) {
        await uploadProfileImage(user.uid, tempImageUri);
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
    uploadProfileImage,
    updateUserProfile,
    showAlert,
    t,
  ]);

  // Cancel edit and reset state
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setTempImageUri(null);
    setEditedNickname(profile?.displayName || user?.displayName || "");
  }, [profile?.displayName, user?.displayName]);

  return {
    // State
    isEditMode,
    editedNickname,
    tempImageUri,
    uploading,

    // Setters
    setIsEditMode,
    setEditedNickname,
    setTempImageUri,
    setUploading,

    // Actions
    handleEditedNicknameChange,
    handleChoosePhoto,
    handleSaveProfile,
    handleCancelEdit,
  };
}
