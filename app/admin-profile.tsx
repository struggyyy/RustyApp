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
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";
import { ref, deleteObject } from "firebase/storage";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useLanguage } from "../src/core/context/LanguageContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { useShakeAnimation } from "../src/shared/hooks/ui/useShakeAnimation";
import { Report } from "../src/shared/types/reports";
import { getReportsByUserId } from "../src/lib/firebase/reports";
import { storage } from "../src/lib/firebase/firebase";
import colors from "../src/core/theme/colors";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import EditProfile from "../src/components/features/profile-page/EditProfile";
import SettingsCard from "../src/components/features/profile-page/SettingsCard";
import ProfileImageModal from "../src/components/features/profile-page/ProfileImageModal";
import { useProfileSettings } from "../src/shared/hooks/profile/useProfileSettings";

// Styles for layout
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 148,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function AdminProfile() {
  // Authentication and context hooks
  const {
    user,
    profile,
    uploadProfileImage,
    updateUserProfile,
    loading: authLoading,
    initialLoading,
    logOut,
  } = useAuth();
  const { currentLanguage, isChanging } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  // UI state management
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({ title: "", buttons: [] });

  // Shake animation hook
  const { shakeAnimation, triggerShake } = useShakeAnimation();

  // Alert management
  const showAlert = (
    title: string,
    message?: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }> = [{ text: t("common.ok") }]
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  // Settings handlers from custom hook
  const {
    notificationsEnabled,
    hapticsEnabled,
    isSubmitting,
    handleToggleNotifications,
    handleToggleHaptics,
    handleToggleLanguage,
  } = useProfileSettings({ showAlert, t });

  // Nickname change handler
  const handleEditedNicknameChange = (text: string) => {
    if (text.length <= 15) {
      setEditedNickname(text);
    } else {
      triggerShake();
    }
  };

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert(t("auth.logoutError"), error.message || t("auth.logoutError"));
    }
  };

  // Computed values
  const isLoading = authLoading || initialLoading || uploading;
  const profileImageUrl = profile?.profileImage || user?.photoURL;

  // Load user reports on mount
  useEffect(() => {
    if (user?.uid) {
      getReportsByUserId(user.uid)
        .then(setReports)
        .catch((err) => {
          console.error(err);
        });
    }
  }, [user]);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  }, [user]);

  // Authentication redirect and reports initialization
  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace("/login");
    }
    if (user) {
      fetchReports();
    }
  }, [initialLoading, user, router, fetchReports]);

  // Sync edited nickname with profile changes
  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || user?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, user?.displayName]);

  // Save profile with validation and error handling
  const handleSaveProfile = async () => {
    if (!user?.uid) throw new Error("User not found");

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
      // Delete old image from storage
      const oldImageUrl = profile?.profileImage || user?.photoURL;
      if (oldImageUrl && tempImageUri) {
        try {
          const url = new URL(oldImageUrl);
          const path = decodeURIComponent(url.pathname.split("/o/")[1]);
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log("Old image deleted successfully");
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
        }
      }

      // Upload new image if changed
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

      // Update notification preferences
      await updateUserProfile({
        notificationPreferences: {
          push: notificationsEnabled,
          email: profile?.notificationPreferences?.email ?? true,
          haptics: hapticsEnabled,
        },
      });

      showAlert(t("common.success"), t("profile.profileUpdated"));
    } catch (error: any) {
      console.error("Update error:", error);
      showAlert(t("common.error"), error.message || t("profile.updateError"));
    } finally {
      setUploading(false);
      setIsEditMode(false);
      setTempImageUri(null);
    }
  };

  // Reset edit state
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTempImageUri(null);
    setEditedNickname(profile?.displayName || user?.displayName || "");
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  // Loading screen
  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Admin Profile" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  // Main component render
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: t("admin.profileTitle") }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <EditProfile
          variant="admin"
          isExpanded={isEditMode}
          onToggleExpanded={() => setIsEditMode(true)}
          onAvatarPress={() => setShowImageModal(true)}
          onSave={() => {
            const nicknameChanged =
              editedNickname !== (profile?.displayName || user?.displayName);
            const imageChanged = tempImageUri !== null;
            if (!nicknameChanged && !imageChanged) {
              handleCancelEdit();
            } else {
              handleSaveProfile();
            }
          }}
          onCancel={handleCancelEdit}
          onChoosePhoto={(uri) => setTempImageUri(uri)}
          onEmailPress={() =>
            showAlert(t("common.error"), t("profile.emailCannotBeChanged"))
          }
          uploading={uploading}
          tempImageUri={tempImageUri}
          editedNickname={editedNickname}
          onNicknameChange={handleEditedNicknameChange}
          showImageModal={showImageModal}
          onCloseImageModal={() => setShowImageModal(false)}
          profileImageUrl={profileImageUrl}
          shakeAnimation={shakeAnimation}
        />

        <ProfileImageModal
          visible={showImageModal}
          imageUrl={profileImageUrl}
          title={t("admin.profilePicture")}
          onClose={() => setShowImageModal(false)}
        />

        <SettingsCard
          variant="admin"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={currentLanguage}
          isSubmitting={isSubmitting || isChanging}
          authLoading={authLoading}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogout}
        />
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
}
