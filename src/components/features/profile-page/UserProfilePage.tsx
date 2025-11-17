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
  RefreshControl,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

interface UserProfilePageProps {
  onViewAllReports: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onViewAllReports,
}) => {
  // Authentication and context hooks
  const { user, profile, initialLoading } = useAuth();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const router = useRouter();

  // UI state
  const [reports, setReports] = useState<Report[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const { handleLogout, handleDeleteAccount } = useProfileActions({
    t,
  });

  // Reports state
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  }, [user]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  // Effects
  useEffect(() => {
    if (!initialLoading && !user) {
      if (router) router.replace("/login");
    }
    if (user) {
      fetchReports();
    }
  }, [initialLoading, user, router, fetchReports]);

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
  const language = profile?.language || "en";

  // Handlers
  const handleAvatarPress = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);

  const handleSave = () => {
    const nicknameChanged = editedNickname !== (profile?.displayName || "");
    const imageChanged = tempImageUri !== null;
    if (!nicknameChanged && !imageChanged && !imageRemoved) {
      handleCancelEdit();
    } else {
      handleSaveProfile();
    }
  };

  const handleEmailPress = () =>
    showAlert(t("profile.email"), t("profile.emailCannotBeChanged"));

  // Loading screen
  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t("profile.title") }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.title"),
        }}
      />
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
          variant="user"
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
          title={t("profile.profilePicture")}
          onClose={handleCloseImageModal}
        />

        <SettingsCard
          variant="user"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={language}
          isSubmitting={isSubmitting}
          authLoading={false}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />

        <ProfileReportsCard
          reports={reports}
          onViewAllReports={onViewAllReports}
          t={t}
        />
      </ScrollView>
    </>
  );
};

export default UserProfilePage;
