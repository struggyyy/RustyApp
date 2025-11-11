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
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";

// Internal imports
import { useAuth } from "../src/context/AuthContext";
import { useTranslation } from "../src/hooks/useTranslation";
import { useShakeAnimation } from "../src/hooks/useShakeAnimation";
import { useProfileManagement } from "../src/hooks/profile/useProfileManagement";
import { useProfileSettings } from "../src/hooks/profile/useProfileSettings";
import { useProfileActions } from "../src/hooks/profile/useProfileActions";
import { Report } from "../src/types/reports";
import { getReportsByUserId } from "../src/components/lib/firebase/reports";
import colors from "../src/theme/colors";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import EditProfile from "../src/components/features/profile/EditProfile";
import SettingsCard from "../src/components/features/profile/SettingsCard";
import ProfileImageModal from "../src/components/features/profile/ProfileImageModal";
import ProfileReportsCard from "../src/components/features/profile/ProfileReportsCard";

// Styles using StyleSheet for performance
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 91, // Adjusted for reports card
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function Profile() {
  // Authentication and context hooks
  const { user, profile, initialLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

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

  // Alert management
  const showAlert = useCallback(
    (
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
    },
    [t]
  );

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  // Profile management hook
  const {
    isEditMode,
    editedNickname,
    tempImageUri,
    uploading,
    setIsEditMode,
    setEditedNickname,
    handleEditedNicknameChange,
    handleChoosePhoto,
    handleSaveProfile,
    handleCancelEdit,
  } = useProfileManagement({ showAlert });

  // Shake animation hook
  const { shakeAnimation } = useShakeAnimation();

  // Profile settings hook
  const {
    notificationsEnabled,
    hapticsEnabled,
    isSubmitting,
    handleToggleNotifications,
    handleToggleHaptics,
    handleToggleLanguage,
  } = useProfileSettings({ showAlert, t });

  // Profile actions hook
  const { handleLogout, handleDeleteAccount } = useProfileActions({
    showAlert,
    t,
  });

  // Reports state (simple inline logic since functionality is minimal)
  const [reports, setReports] = useState<Report[]>([]);

  // Data fetching for reports
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  }, [user]);

  // Modal state for image
  const [showImageModal, setShowImageModal] = useState(false);

  // Effects
  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace("/login");
    }
    if (user) {
      fetchReports();
    }
  }, [initialLoading, user, router, fetchReports]);

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || "");
    }
  }, [isEditMode, profile?.displayName]);

  // Computed values
  const profileImageUrl = profile?.profileImage;

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
      <Stack.Screen options={{ title: t("profile.title") }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EditProfile
          variant="user"
          isExpanded={isEditMode}
          onToggleExpanded={() => setIsEditMode(true)}
          onAvatarPress={() => setShowImageModal(true)}
          onSave={() => {
            const nicknameChanged =
              editedNickname !== (profile?.displayName || "");
            const imageChanged = tempImageUri !== null;
            if (!nicknameChanged && !imageChanged) {
              handleCancelEdit();
            } else {
              handleSaveProfile();
            }
          }}
          onCancel={handleCancelEdit}
          onChoosePhoto={handleChoosePhoto}
          onEmailPress={() =>
            showAlert(t("profile.email"), t("profile.emailCannotBeChanged"))
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
          title={t("profile.profilePicture")}
          onClose={() => setShowImageModal(false)}
        />

        <SettingsCard
          variant="user"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={profile?.language || "en"}
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
          onViewAllReports={() => router.push("/my-reports")}
          t={t}
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
