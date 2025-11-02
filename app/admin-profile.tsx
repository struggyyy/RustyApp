import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Modal,
  StyleSheet,
  Switch,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import styled from "styled-components/native";
import StyledButton from "../src/components/common/buttons/StyledButton";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Report } from "../src/types/reports";
import { getReportsByUserId } from "../src/services/firebase/reports";
import colors from "../src/theme/colors";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../src/services/firebase";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import EditProfile from "../src/components/features/profile/EditProfile";
import SettingsCard from "../src/components/features/profile/SettingsCard";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

// --- STYLED COMPONENTS ---
const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 148, // Adjust the bottom padding to modify the amount of "bounce effect" on the bottom of the screen
  },
  showsVerticalScrollIndicator: false, // Hide the vertical scroll indicator
})({
  flex: 1,
  backgroundColor: colors.white,
});

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ModalOverlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

const ModalContent = styled.View({
  backgroundColor: colors.white,
  borderRadius: 24,
  padding: 24,
  width: '90%',
  maxWidth: 400,
});

const ModalHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const ModalTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const ModalCloseButton = styled.TouchableOpacity({
  padding: 8,
});

const ModalImage = styled.Image({
  width: '100%',
  height: 300,
  borderRadius: 16,
  marginBottom: 16,
});


export default function AdminProfile() {
  const { user, profile, uploadProfileImage, updateUserProfile, loading: authLoading, initialLoading, logOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  // Settings related state
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationPreferences?.push ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState('English');
  const [hapticsEnabled, setHapticsEnabled] = useState(profile?.notificationPreferences?.haptics ?? true);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [isShakeAnimationRunning, setIsShakeAnimationRunning] = useState(false);

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const triggerShake = () => {
    // Prevent triggering if animation is already running
    if (isShakeAnimationRunning) return;

    setIsShakeAnimationRunning(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 5, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -5, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 5, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -5, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 75, useNativeDriver: true }),
    ]).start(() => {
      // Animation completed, allow next trigger
      setIsShakeAnimationRunning(false);
    });
  };

  const handleEditedNicknameChange = (text: string) => {
    // Allow typing up to 15 characters, but prevent going beyond
    if (text.length <= 15) {
      setEditedNickname(text);
    } else {
      // Trigger shake animation when trying to exceed limit
      triggerShake();
    }
  };

  // Settings handlers
  const handleToggleNotifications = async (value: boolean) => {
    setIsSubmitting(true);
    setNotificationsEnabled(value);
    try {
      await updateUserProfile({
        notificationPreferences: {
          push: value,
          email: profile?.notificationPreferences?.email ?? true,
          haptics: hapticsEnabled,
        },
      });
      showAlert('Success', 'Notification settings updated.');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update settings.');
      setNotificationsEnabled(!value); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHaptics = async (value: boolean) => {
    setIsSubmitting(true);
    setHapticsEnabled(value);
    try {
      await updateUserProfile({
        notificationPreferences: {
          push: notificationsEnabled,
          email: profile?.notificationPreferences?.email ?? true,
          haptics: value,
        },
      });
      showAlert('Success', 'Haptics settings updated.');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update settings.');
      setHapticsEnabled(!value); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLanguage = () => {
    const newLanguage = language === 'English' ? 'Polish' : 'English';
    setLanguage(newLanguage);
    showAlert('Language Changed', `Language set to ${newLanguage}.`);
  };

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert('Logout Error', error.message || 'Failed to log out.');
    }
  };


  const isLoading = authLoading || initialLoading || uploading;
  const profileImageUrl = profile?.profileImage || user?.photoURL;

  useEffect(() => {
    if (user?.uid) {
      getReportsByUserId(user.uid)
        .then(setReports)
        .catch((err) => {
          console.error(err);
          // Optionally set an error state here
        });
    }
  }, [user]);

  const handleReportDelete = (deletedReportId: string) => {
    setReports((prevReports) =>
      prevReports.filter((report) => report.id !== deletedReportId)
    );
  };

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReportsError("Failed to load reports.");
    } finally {
      setReportsLoading(false);
    }
  }, [user]);

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
      setEditedNickname(profile?.displayName || user?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, user?.displayName]);

  const handleSaveProfile = async () => {
    if (!user?.uid) throw new Error("User not found");

    // Validate nickname length
    if (editedNickname.length < 2) {
      showAlert("Error", "Nickname must be at least 2 characters long.");
      return;
    }
    if (editedNickname.length > 15) {
      showAlert("Error", "Nickname cannot be longer than 15 characters.");
      return;
    }

    setUploading(true);
    try {
      // Delete old profile image if it exists
      const oldImageUrl = profile?.profileImage || user?.photoURL;
      if (oldImageUrl && tempImageUri) {
        try {
          const url = new URL(oldImageUrl);
          const path = decodeURIComponent(url.pathname.split("/o/")[1]);
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log("Old profile image deleted successfully");
        } catch (deleteError) {
          console.error("Failed to delete old profile image:", deleteError);
          // Don't block the save process if delete fails
        }
      }

      // Upload new profile picture if changed
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

      showAlert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      showAlert("Error", error.message || "Failed to update profile.");
    } finally {
      setUploading(false);
      setIsEditMode(false);
      setTempImageUri(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTempImageUri(null);
    setEditedNickname(profile?.displayName || user?.displayName || "");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Admin Profile" }} />
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.primary} />
        </LoadingContainer>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: "Admin Profile" }} />
      <Container
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
            const nicknameChanged = editedNickname !== (profile?.displayName || user?.displayName);
            const imageChanged = tempImageUri !== null;
            if (!nicknameChanged && !imageChanged) {
              handleCancelEdit();
            } else {
              handleSaveProfile();
            }
          }}
          onCancel={handleCancelEdit}
          onChoosePhoto={(uri) => setTempImageUri(uri)}
          onEmailPress={() => showAlert('Email Information', 'Your email address cannot be changed as it is used for account verification and security purposes.')}
          uploading={uploading}
          tempImageUri={tempImageUri}
          editedNickname={editedNickname}
          onNicknameChange={handleEditedNicknameChange}
          showImageModal={showImageModal}
          onCloseImageModal={() => setShowImageModal(false)}
          profileImageUrl={profileImageUrl}
          shakeAnimation={shakeAnimation}
        />

        <Modal visible={showImageModal} transparent animationType="fade">
          <ModalOverlay>
            <ModalContent style={shadowStyles.modalShadow}>
              <ModalHeader>
                <ModalTitle>Profile Picture</ModalTitle>
                <ModalCloseButton onPress={() => setShowImageModal(false)}>
                  <Feather name="x" size={24} color={colors.text.primary} />
                </ModalCloseButton>
              </ModalHeader>
              <ModalImage
                source={{ uri: profileImageUrl }}
                resizeMode="contain"
              />
            </ModalContent>
          </ModalOverlay>
        </Modal>

        <SettingsCard
          variant="admin"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={language}
          isSubmitting={isSubmitting}
          authLoading={authLoading}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogout}
        />
      </Container>

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
