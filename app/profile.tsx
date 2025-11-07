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
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useLanguage } from "../src/context/LanguageContext";
import * as ImagePicker from "expo-image-picker";
import styled from "styled-components/native";
import StyledButton from "../src/components/common/buttons/StyledButton";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import ReportCard from "../src/components/features/reports/ReportCard";
import { Report, ReportStatus } from "../src/types/reports";
import { getReportsByUserId, deleteReport } from "../src/components/lib/firebase/reports";
import colors from "../src/theme/colors";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../src/components/lib/firebase/firebase";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import EditProfile from "../src/components/features/profile/EditProfile";
import SettingsCard from "../src/components/features/profile/SettingsCard";
import TouchableButton from "../src/components/common/buttons/TouchableButton";
import IconButton from "../src/components/common/buttons/IconButton";
import { useTranslation } from "../src/hooks/useTranslation";
import { getStatusTranslationKey, getStatusNoteTranslationKey, getStatusColor } from "../src/utils/statusTranslation";

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

// Helper functions
const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

// Styled components for modal view
const ModalCardHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

const ModalCardTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.text.primary,
});

const ModalHeaderActions = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const ModalCloseButtonNew = styled.TouchableOpacity({
  padding: 8,
});

const ModalDeleteButton = styled.TouchableOpacity({
  padding: 8,
});

const ModalReportDate = styled.Text<{ color: string }>((props: { color: string }) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: props.color,
  marginBottom: 8,
}));

const ModalExpandedCarImage = styled.Image({
  width: '100%',
  height: 180,
  borderRadius: 10,
  marginTop: 8,
  marginBottom: 16,
});

const ModalDetailLabel = styled.Text({
  fontWeight: 'bold',
  color: colors.text.primary,
  fontSize: 16,
});

const ModalDetailText = styled.Text<{ color?: string }>((props: { color?: string }) => ({
  fontSize: 16,
  color: props.color || colors.text.primary,
}));

const ModalStatusNote = styled.Text({
  fontSize: 14,
  color: colors.text.secondary,
  marginBottom: 16,
  fontStyle: 'italic',
});

interface UserReportModalViewProps {
  report: Report;
  onClose: () => void;
  onDelete: (reportId: string) => Promise<void>;
  showAlert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>) => void;
}

const UserReportModalView: React.FC<UserReportModalViewProps> = ({ report, onClose, onDelete, showAlert }) => {
  const { t } = useTranslation();
  const statusColor = getStatusColor(report.status);

  const handleDeletePress = () => {
    showAlert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(report.id);
              onClose(); // Close the modal first
              // Show success message
              setTimeout(() => {
                showAlert(
                  'Success',
                  'Your report has been successfully deleted.',
                  [{ text: 'OK' }]
                );
              }, 300);
            } catch (error) {
              showAlert(
                'Error',
                'Failed to delete report. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ maxHeight: '100%' }}>
      {/* Fixed Header */}
      <ModalCardHeader>
        <ModalCardTitle>{t('reports.reportDetails')}</ModalCardTitle>
        <ModalHeaderActions>
          <IconButton
            onPress={handleDeletePress}
            size={40}
            backgroundColor="transparent"
            color={colors.primary}
          >
            <MaterialIcons name="delete" size={24} color={colors.primary} />
          </IconButton>
          <IconButton
            onPress={onClose}
            size={40}
            backgroundColor="transparent"
          >
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </IconButton>
        </ModalHeaderActions>
      </ModalCardHeader>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <ModalReportDate color={statusColor}>{formatDate(report.createdAt.toDate())}</ModalReportDate>
        <ModalExpandedCarImage source={{ uri: report.imageUrl }} />

        <View style={{ marginBottom: 16 }}>
          <ModalDetailLabel>{t('reports.description')}</ModalDetailLabel>
          <ModalDetailText>{report.description}</ModalDetailText>
        </View>

        <View style={{ marginBottom: 16 }}>
          <ModalDetailText color={statusColor} style={{ fontWeight: 'bold' }}>{t(getStatusTranslationKey(report.status))}</ModalDetailText>
          <ModalStatusNote>{t(getStatusNoteTranslationKey(report.status))}</ModalStatusNote>
        </View>

        <View style={{ marginBottom: 8 }}>
          <ModalDetailText><ModalDetailLabel>{t('reports.points')}: </ModalDetailLabel>{report.points}</ModalDetailText>
        </View>
      </ScrollView>
    </View>
  );
};

// --- STYLED COMPONENTS ---
const Container = styled.ScrollView({
  flex: 1,
  backgroundColor: colors.white,
});

const ReportsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 12px;
  margin-bottom: 20px;
`;

const ReportsTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 0px;
  text-align: center;
  text-transform: uppercase;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NoReportsText = styled.Text`
  text-align: center;
  color: ${colors.text.secondary};
  font-size: 16px;
`;

const AvatarTouchable = styled.TouchableOpacity``;

const AvatarWrapper = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  border: 5px solid ${colors.primary};
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

const PointsText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.secondary};
  margin-top: 2px;
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


export default function Profile() {
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
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  const { t } = useTranslation();
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
  const [hapticsEnabled, setHapticsEnabled] = useState(profile?.notificationPreferences?.haptics ?? true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
      showAlert(t('common.success'), t('settings.settingsUpdated'));
    } catch (error: any) {
      showAlert(t('common.error'), error.message || t('settings.settingsError'));
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
      showAlert(t('common.success'), t('settings.settingsUpdated'));
    } catch (error: any) {
      showAlert(t('common.error'), error.message || t('settings.settingsError'));
      setHapticsEnabled(!value); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLanguage = async () => {
    const newLanguage = currentLanguage === 'en' ? 'pl' : 'en';
    try {
      await changeLanguage(newLanguage);
      showAlert(t('common.success'), t('settings.languageSetTo', { language: newLanguage === 'en' ? t('settings.english') : t('settings.polish') }));
    } catch (error: any) {
      showAlert(t('common.error'), error.message || t('settings.settingsError'));
    }
  };

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert(t('auth.logoutError'), error.message || t('auth.logoutError'));
    }
  };

  const handleDeleteAccount = () => {
    showAlert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              showAlert(t('common.success'), t('profile.deleteAccountSuccess'), [
                { text: t('common.ok'), onPress: () => router.replace('/login') }
              ]);
            } catch (error: any) {
              showAlert(t('common.error'), error.message || t('profile.deleteAccountError'));
            }
          },
        },
      ]
    );
  };

  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const handleDetailsPress = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
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

  const handleReportDelete = async (deletedReportId: string) => {
    try {
      // Find the report to get its imageUrl
      const reportToDelete = reports.find(report => report.id === deletedReportId);
      if (reportToDelete) {
        // Delete from Firebase
        await deleteReport(deletedReportId, reportToDelete.imageUrl);
      }
      // Update local state
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== deletedReportId)
      );
    } catch (error) {
      console.error('Error deleting report:', error);
      showAlert(t('common.error'), t('reports.deleteReportError'));
    }
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
      showAlert(t('common.error'), t('validation.nicknameTooShort'));
      return;
    }
    if (editedNickname.length > 15) {
      showAlert(t('common.error'), t('validation.nicknameTooLong'));
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

      showAlert(t('common.success'), t('profile.profileUpdated'));
      setIsEditMode(false);
      setTempImageUri(null);
    } catch (error: any) {
      console.error("Update error:", error);
      showAlert(t('common.error'), error.message || t('profile.updateError'));
    } finally {
      setUploading(false);
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
        <Stack.Screen options={{ title: "Your Profile" }} />
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
      <Stack.Screen options={{ title: t('profile.title') }} />
      <Container
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: reports.length > 0 ? 18 : 91, // Reduced padding when no reports for better scrolling experience
        }}
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
          onEmailPress={() => showAlert(t('profile.email'), t('profile.emailCannotBeChanged'))}
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
                <ModalTitle>{t('profile.profilePicture')}</ModalTitle>
                <IconButton
                  onPress={() => setShowImageModal(false)}
                  size={40}
                  backgroundColor="transparent"
                >
                  <Feather name="x" size={24} color={colors.text.primary} />
                </IconButton>
              </ModalHeader>
              <ModalImage
                source={{ uri: profileImageUrl }}
                resizeMode="contain"
              />
            </ModalContent>
          </ModalOverlay>
        </Modal>

        <SettingsCard
          variant="user"
          notificationsEnabled={notificationsEnabled}
          hapticsEnabled={hapticsEnabled}
          language={currentLanguage}
          isSubmitting={isSubmitting || isChanging}
          authLoading={authLoading}
          onToggleNotifications={handleToggleNotifications}
          onToggleHaptics={handleToggleHaptics}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />

        {reports.length > 0 && (
          <ReportsCard style={shadowStyles.modalShadow}>
            <TouchableButton onPress={() => router.push("/my-reports")}>
              <ReportsTitle>{t('reports.viewAllReports')}</ReportsTitle>
            </TouchableButton>
          </ReportsCard>
        )}
        <Modal visible={showReportModal} transparent animationType="fade">
          <ModalOverlay>
            <ModalContent style={shadowStyles.modalShadow}>
              {selectedReport && (
                <UserReportModalView 
                  report={selectedReport} 
                  onClose={handleModalClose}
                  onDelete={handleReportDelete}
                  showAlert={showAlert}
                />
              )}
            </ModalContent>
          </ModalOverlay>
        </Modal>
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
