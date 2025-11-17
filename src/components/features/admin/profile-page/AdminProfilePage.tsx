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
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useLanguage } from "@/core/context/LanguageContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAlert } from "@/core/context/AlertContext";
import { useShakeAnimation } from "@/shared/hooks/ui/useShakeAnimation";
import { useProfileEdit } from "@/shared/hooks/profile/useProfileEdit";
import { useProfileSettings } from "@/shared/hooks/profile/useProfileSettings";
import colors from "@/core/theme/colors";
import EditProfile from "@/components/features/profile-page/EditProfile";
import SettingsCard from "@/components/features/profile-page/SettingsCard";
import ProfileImageModal from "@/components/features/profile-page/ProfileImageModal";

// Styles using StyleSheet for performance
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContentAdmin: {
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

const AdminProfilePage: React.FC = () => {
  // Authentication and context hooks
  const { user, profile, initialLoading, logOut, updateUserProfile } =
    useAuth();
  const { currentLanguage, isChanging } = useLanguage();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { shakeAnimation, triggerShake } = useShakeAnimation();

  // Specialized hooks
  const {
    isEditMode,
    editedNickname,
    tempImageUri,
    imageRemoved,
    uploading,
    setIsEditMode,
    setEditedNickname,
    setTempImageUri,
    setImageRemoved,
    setUploading,
    handleEditedNicknameChange,
    handleSaveProfile,
    handleCancelEdit,
    handleRemoveImage,
  } = useProfileEdit({ t, onShake: triggerShake });

  const {
    notificationsEnabled,
    hapticsEnabled,
    isSubmitting,
    handleToggleNotifications,
    handleToggleHaptics,
    handleToggleLanguage,
  } = useProfileSettings({ t });

  // Admin-specific profile save handler
  const handleAdminSaveProfile = useCallback(async () => {
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
      // Use the standard profile management save first
      await handleSaveProfile();

      // Additional admin logic: Update notification preferences
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
    }
  }, [
    user,
    editedNickname,
    handleSaveProfile,
    notificationsEnabled,
    hapticsEnabled,
    updateUserProfile,
    profile?.notificationPreferences?.email,
    showAlert,
    t,
  ]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Note: No reports to fetch for admin
    setRefreshing(false);
  }, []);

  // Effects
  useEffect(() => {
    if (!initialLoading && !user) {
      if (router) router.replace("/login");
    }
  }, [initialLoading, user, router]);

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, setEditedNickname]);

  // Reset image state when entering edit mode to ensure fresh data
  useEffect(() => {
    if (isEditMode) {
      setTempImageUri(null);
      setImageRemoved(false);
    }
  }, [isEditMode, setTempImageUri, setImageRemoved]);

  // Computed values
  const profileImageUrl = profile?.profileImage;
  const language = currentLanguage;
  const isSubmittingFinal = isSubmitting || isChanging;

  // Handlers
  const handleAvatarPress = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);

  const handleSave = () => {
    const nicknameChanged = editedNickname !== (profile?.displayName || "");
    const imageChanged = tempImageUri !== null;
    if (!nicknameChanged && !imageChanged && !imageRemoved) {
      handleCancelEdit();
    } else {
      handleAdminSaveProfile();
    }
  };

  const handleLogoutAdmin = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert(t("auth.logoutError"), error.message || t("auth.logoutError"));
    }
  };

  const handleEmailPress = () =>
    showAlert(t("profile.email"), t("profile.emailCannotBeChanged"));

  // Loading screen
  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t("admin.profileTitle") }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
    />
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: t("admin.profileTitle"),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentAdmin}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <EditProfile
          variant="admin"
          isExpanded={isEditMode}
          onToggleExpanded={() => setIsEditMode(true)}
          onAvatarPress={handleAvatarPress}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          onChoosePhoto={setTempImageUri}
          onRemoveImage={handleRemoveImage}
          onEmailPress={handleEmailPress}
          uploading={uploading}
          tempImageUri={tempImageUri}
          editedNickname={editedNickname}
          onNicknameChange={handleEditedNicknameChange}
          profileImageUrl={profileImageUrl}
          imageRemoved={imageRemoved}
          shakeAnimation={shakeAnimation}
        />

        <ProfileImageModal
          visible={showImageModal}
          imageUrl={profileImageUrl}
          title={t("admin.profilePicture")}
          onClose={handleCloseImageModal}
        />

        <SettingsCard
          variant="admin"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={language}
          isSubmitting={isSubmittingFinal}
          authLoading={false}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogoutAdmin}
          onDeleteAccount={undefined}
        />
      </ScrollView>
    </>
  );
};

export default AdminProfilePage;
