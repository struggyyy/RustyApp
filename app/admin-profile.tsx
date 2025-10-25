import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  RefreshControl,
  TextInput,
  Modal,
  StyleSheet,
  Switch,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import styled from "styled-components/native";
import StyledButton from "../src/components/common/StyledButton";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import ReportCard from "../src/components/ReportCard";
import { Report } from "../src/types/reports";
import { getReportsByUserId } from "../src/services/firebase/reports";
import colors from "../src/theme/colors";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../src/services/firebase";
import CustomAlert from "../src/components/common/CustomAlert";

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
    paddingBottom: 0, // Adjust the bottom padding to modify the amount of "bounce effect" on the bottom of the screen
  },
  showsVerticalScrollIndicator: false, // Hide the vertical scroll indicator
})({
  flex: 1,
  backgroundColor: colors.white,
});

const ProfileCard = styled.View<{ isExpanded: boolean }>(
  (props: { isExpanded: boolean }) => ({
    backgroundColor: colors.componentBackground,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: props.isExpanded ? 'column' : 'row',
    alignItems: props.isExpanded ? 'stretch' : 'center',
  })
);

const CollapsedProfileContent = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex: 1;
  gap: 12px;
`;

const CollapsedProfileTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ExpandedProfileHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ExpandedProfileTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
`;

const ExpandedProfileCloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ExpandedSettingsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex: 1;
`;

const ExpandedSettingsTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
`;

const ExpandedSettingsCloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ExpandedAvatarWrapper = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  border: 5px solid ${colors.primary};
  align-self: center;
  margin-bottom: 4px;
`;

const ExpandedAvatarImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 60px;
`;

const ExpandedAvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 60px;
  background-color: #ccc;
  justify-content: center;
  align-items: center;
`;

const ExpandedAvatarPlaceholderText = styled.Text`
  font-size: 40px;
  color: #fff;
  font-weight: bold;
`;

const EditIconButton = styled.TouchableOpacity`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${colors.white};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border: 4px solid #BD5151;
`;

const EditLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const EditInput = styled.TextInput`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: ${colors.text.primary};
  margin-bottom: 4px;
  border: 1px solid ${colors.componentBackground};
`;

const EmailTouchable = styled.TouchableOpacity`
  margin-top: 12px;
  margin-bottom: 12px;
`;

const EmailText = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  text-align: center;
`;

const ActionButtonFlex = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>((props: { variant?: 'primary' | 'secondary' }) => ({
  flex: 1,
  backgroundColor: props.variant === 'primary' ? colors.primary : colors.text.secondary,
  padding: 14,
  borderRadius: 20,
  alignItems: 'center',
  minHeight: 50,
}));

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>((props: { variant?: 'primary' | 'secondary' }) => ({
  color: props.variant === 'primary' ? colors.white : colors.white,
  fontWeight: 'bold',
  fontSize: 14,
}));

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const AvatarTouchable = styled.TouchableOpacity``;

const AvatarWrapper = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  border: 3px solid ${colors.primary};
  position: relative;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 40px;
`;

const AvatarPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 40px;
  background-color: #ccc;
  justify-content: center;
  align-items: center;
`;

const AvatarPlaceholderText = styled.Text`
  font-size: 30px;
  color: #fff;
  font-weight: bold;
`;

const Nickname = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: 4px;
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

// Settings styled components
const SettingsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 20px;
`;

const NotificationRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const NotificationLabel = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
`;

const AccountSection = styled.View`
  margin-top: 6px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${colors.componentBackground};
`;

const AccountTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 16px;
`;

const DeleteAccountButton = styled.TouchableOpacity`
  background-color: transparent;
  padding: 8px 16px;
  align-items: center;
`;

const DeleteAccountText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colors.text.secondary};
`;

export default function AdminProfile() {
  const {
    user,
    profile,
    uploadProfileImage,
    updateUserProfile,
    loading: authLoading,
    initialLoading,
    logOut,
    deleteAccount,
  } = useAuth();
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
  const [settingsExpanded, setSettingsExpanded] = useState(false);

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
          email: profile?.notificationPreferences?.email ?? true, // Keep email preference as is
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

  const handleToggleLanguage = (value: boolean) => {
    const newLanguage = value ? 'Polish' : 'English';
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

  const handleDeleteAccount = () => {
    showAlert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              showAlert('Success', 'Your account has been deleted.', [
                { text: 'OK', onPress: () => router.replace('/login') }
              ]);
            } catch (error: any) {
              showAlert('Error', error.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
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

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const source = result.assets[0];
      setTempImageUri(source.uri);
    }
  };

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

      showAlert("Success", "Profile updated successfully!");
      setIsEditMode(false);
      setTempImageUri(null);
    } catch (error: any) {
      console.error("Update error:", error);
      showAlert("Error", error.message || "Failed to update profile.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTempImageUri(null);
    setEditedNickname(profile?.displayName || user?.displayName || "");
  };

  const handleAvatarPress = () => {
    if (!isEditMode && profileImageUrl) {
      setShowImageModal(true);
    }
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

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || user?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, user?.displayName]);

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
        <ProfileCard style={shadowStyles.modalShadow} isExpanded={isEditMode}>
          {isEditMode ? (
            <>
              <ExpandedProfileHeader>
                <ExpandedProfileTitle>Edit Profile</ExpandedProfileTitle>
                <ExpandedProfileCloseButton onPress={handleCancelEdit}>
                  <MaterialIcons name="close" size={24} color={colors.text.primary} />
                </ExpandedProfileCloseButton>
              </ExpandedProfileHeader>

              <AvatarTouchable onPress={handleChoosePhoto} disabled={uploading}>
                <ExpandedAvatarWrapper>
                  {uploading ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : tempImageUri ? (
                    <ExpandedAvatarImage source={{ uri: tempImageUri }} />
                  ) : profileImageUrl ? (
                    <ExpandedAvatarImage source={{ uri: profileImageUrl }} />
                  ) : (
                    <ExpandedAvatarPlaceholder>
                      <ExpandedAvatarPlaceholderText>
                        {user?.email?.[0]?.toUpperCase() || "?"}
                      </ExpandedAvatarPlaceholderText>
                    </ExpandedAvatarPlaceholder>
                  )}
                  <EditIconButton onPress={handleChoosePhoto} disabled={uploading}>
                    <MaterialIcons name="edit" size={20} color={colors.primary} />
                  </EditIconButton>
                </ExpandedAvatarWrapper>
              </AvatarTouchable>

              <EditLabel>Nickname</EditLabel>
              <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                <EditInput
                  value={editedNickname}
                  onChangeText={handleEditedNicknameChange}
                  placeholder="Enter your nickname (2-15 characters)"
                  placeholderTextColor={colors.text.secondary}
                  editable={!uploading}
                />
              </Animated.View>

              <EmailTouchable onPress={() => showAlert('Email Information', 'Your email address cannot be changed as it is used for account verification and security purposes.')}>
                <EmailText style={{
                  fontSize: user?.email && user.email.length > 20 ? 14 : 16
                }}>
                  {user?.email || ""}
                </EmailText>
              </EmailTouchable>

              <ActionButtonFlex variant="primary" onPress={() => {
                const nicknameChanged = editedNickname !== (profile?.displayName || user?.displayName);
                const imageChanged = tempImageUri !== null;
                if (!nicknameChanged && !imageChanged) {
                  handleCancelEdit();
                } else {
                  handleSaveProfile();
                }
              }} disabled={uploading} style={{ marginTop: 16 }}>
                <ActionButtonText variant="primary">
                  {uploading ? "Saving..." : "Save"}
                </ActionButtonText>
              </ActionButtonFlex>
            </>
          ) : (
            <CollapsedProfileContent>
              <CollapsedProfileTop>
                <Nickname style={{ marginBottom: 0 }}>
                  {profile?.displayName || user?.displayName || "Admin"}
                </Nickname>
                <AvatarTouchable
                  onPress={handleAvatarPress}
                  disabled={isLoading}
                >
                  <AvatarWrapper>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : profileImageUrl ? (
                      <AvatarImage source={{ uri: profileImageUrl }} />
                    ) : (
                      <AvatarPlaceholder>
                        <AvatarPlaceholderText>
                          {user?.email?.[0]?.toUpperCase() || "?"}
                        </AvatarPlaceholderText>
                      </AvatarPlaceholder>
                    )}
                  </AvatarWrapper>
                </AvatarTouchable>
              </CollapsedProfileTop>
              <StyledButton
                title="Edit Profile"
                onPress={() => setIsEditMode(true)}
                variant="secondary"
                style={{ marginBottom: 0, backgroundColor: '#FFFFFF' }}
                textColor="#656565"
              />
            </CollapsedProfileContent>
          )}
        </ProfileCard>

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

        <SettingsCard style={shadowStyles.modalShadow}>
          {!settingsExpanded && (
            <>
              <NotificationRow>
                <NotificationLabel>Enable Notifications</NotificationLabel>
                <Switch
                  trackColor={{ false: colors.primary, true: colors.status.recycled }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.primary}
                  onValueChange={handleToggleNotifications}
                  value={notificationsEnabled}
                  disabled={isSubmitting}
                />
              </NotificationRow>
              <NotificationRow>
                <NotificationLabel>Language: {language}</NotificationLabel>
                <Switch
                  trackColor={{ false: colors.primary, true: colors.status.recycled }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.primary}
                  onValueChange={handleToggleLanguage}
                  value={language === 'Polish'}
                  disabled={isSubmitting}
                />
              </NotificationRow>
              <StyledButton
                title="More"
                onPress={() => setSettingsExpanded(true)}
                variant="secondary"
                style={{ marginTop: 16, marginBottom: 0 }}
              />
            </>
          )}
          {settingsExpanded && (
            <>
              <ExpandedSettingsHeader>
                <ExpandedSettingsTitle>Settings</ExpandedSettingsTitle>
                <ExpandedSettingsCloseButton onPress={() => setSettingsExpanded(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text.primary} />
                </ExpandedSettingsCloseButton>
              </ExpandedSettingsHeader>
              <NotificationRow>
                <NotificationLabel>Enable Notifications</NotificationLabel>
                <Switch
                  trackColor={{ false: colors.primary, true: colors.status.recycled }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.primary}
                  onValueChange={handleToggleNotifications}
                  value={notificationsEnabled}
                  disabled={isSubmitting}
                />
              </NotificationRow>
              <NotificationRow>
                <NotificationLabel>Language: {language}</NotificationLabel>
                <Switch
                  trackColor={{ false: colors.primary, true: colors.status.recycled }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.primary}
                  onValueChange={handleToggleLanguage}
                  value={language === 'Polish'}
                  disabled={isSubmitting}
                />
              </NotificationRow>
              <AccountSection>
                <AccountTitle>Account</AccountTitle>
                <StyledButton
                  title="Logout"
                  onPress={handleLogout}
                  disabled={authLoading}
                  loading={authLoading && !isSubmitting}
                  style={{ backgroundColor: colors.primary }}
                />
                <DeleteAccountButton onPress={handleDeleteAccount}>
                  <DeleteAccountText>Delete Account :(</DeleteAccountText>
                </DeleteAccountButton>
              </AccountSection>
            </>
          )}
        </SettingsCard>
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
