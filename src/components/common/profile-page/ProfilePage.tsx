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
import { useProfileActions } from "@/shared/hooks/profile/useProfileActions";
import { Report } from "@/shared/types/reports";
import { getReportsByUserId } from "@/lib/firebase/reports";
import colors from "@/core/theme/colors";
import EditProfile from "@/components/features/profile-page/EditProfile";
import SettingsCard from "@/components/features/profile-page/SettingsCard";
import ProfileImageModal from "@/components/features/profile-page/ProfileImageModal";
import ProfileReportsCard from "@/components/features/profile-page/ProfileReportsCard";

// Styles using StyleSheet for performance
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 18, // Adjusted for reports card
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

interface ProfilePageProps {
  variant: 'user' | 'admin';
  onViewAllReports?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  variant,
  onViewAllReports,
}) => {
  // Authentication and context hooks
  const { user, profile, initialLoading, logOut, updateUserProfile } = useAuth();
  const { currentLanguage, isChanging } = useLanguage();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  // Specialized hooks
  const {
    isEditMode,
    editedNickname,
    tempImageUri,
    uploading,
    setIsEditMode,
    setEditedNickname,
    setTempImageUri,
    setUploading,
    handleEditedNicknameChange,
    handleChoosePhoto,
    handleSaveProfile,
    handleCancelEdit,
  } = useProfileEdit({ t });

  const { shakeAnimation } = useShakeAnimation();

  const {
    notificationsEnabled,
    hapticsEnabled,
    isSubmitting,
    handleToggleNotifications,
    handleToggleHaptics,
    handleToggleLanguage,
  } = useProfileSettings({ t });

  const { handleLogout, handleDeleteAccount } = useProfileActions({
    t,
  });

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

  // Reports state (only for user)
  const fetchReports = useCallback(async () => {
    if (!user || variant !== 'user') return;
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  }, [user, variant]);

  // Pull-to-refresh handler (admin only)
  const onRefresh = useCallback(async () => {
    if (variant !== 'admin') return;
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports, variant]);

  // Effects
  useEffect(() => {
    if (!initialLoading && !user) {
      if (router) router.replace("/login");
    }
    if (user && variant === 'user') {
      fetchReports();
    }
  }, [initialLoading, user, router, fetchReports, variant]);

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, setEditedNickname]);

  // Computed values
  const profileImageUrl = profile?.profileImage;
  const language = variant === 'admin' ? currentLanguage : (profile?.language || "en");
  const isSubmittingFinal = variant === 'admin' ? (isSubmitting || isChanging) : isSubmitting;

  // Handlers
  const handleAvatarPress = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);

  const handleSave = () => {
    const nicknameChanged = editedNickname !== (profile?.displayName || "");
    const imageChanged = tempImageUri !== null;
    if (!nicknameChanged && !imageChanged) {
      handleCancelEdit();
    } else {
      if (variant === 'admin') {
        handleAdminSaveProfile();
      } else {
        handleSaveProfile();
      }
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
    const title = variant === 'admin' ? t("admin.profileTitle") : t("profile.title");
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  const scrollContentStyle = variant === 'admin' ? styles.scrollContentAdmin : styles.scrollContent;
  const refreshControl = variant === 'admin' ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
    />
  ) : undefined;

  return (
    <>
      {variant === 'admin' && <StatusBar barStyle="dark-content" />}
      <Stack.Screen options={{ title: variant === 'admin' ? t("admin.profileTitle") : t("profile.title") }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <EditProfile
          variant={variant}
          isExpanded={isEditMode}
          onToggleExpanded={() => setIsEditMode(true)}
          onAvatarPress={handleAvatarPress}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          onChoosePhoto={setTempImageUri}
          onEmailPress={handleEmailPress}
          uploading={uploading}
          tempImageUri={tempImageUri}
          editedNickname={editedNickname}
          onNicknameChange={handleEditedNicknameChange}
          showImageModal={showImageModal}
          onCloseImageModal={handleCloseImageModal}
          profileImageUrl={profileImageUrl}
          shakeAnimation={shakeAnimation}
        />

        <ProfileImageModal
          visible={showImageModal}
          imageUrl={profileImageUrl}
          title={variant === 'admin' ? t("admin.profilePicture") : t("profile.profilePicture")}
          onClose={handleCloseImageModal}
        />

        <SettingsCard
          variant={variant}
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={language}
          isSubmitting={isSubmittingFinal}
          authLoading={false}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={variant === 'admin' ? handleLogoutAdmin : handleLogout}
          onDeleteAccount={variant === 'user' ? handleDeleteAccount : undefined}
        />

        {variant === 'user' && onViewAllReports && (
          <ProfileReportsCard
            reports={reports}
            onViewAllReports={onViewAllReports}
            t={t}
          />
        )}
      </ScrollView>

    </>
  );
};

export default ProfilePage;
