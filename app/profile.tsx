import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import styled from "styled-components/native";
import StyledButton from "../src/components/common/StyledButton";
import { Feather } from "@expo/vector-icons";
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
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${colors.white};
  padding: 24px 12px;
`;

const ProfileCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 15px;
`;

const ProfileCardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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

const EditLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${colors.text.secondary};
  padding: 14px 20px;
  border-radius: 20px;
  align-items: center;
  flex: 1;
`;

const ActionButtonText = styled.Text`
  color: ${colors.white};
  font-weight: bold;
  font-size: 14px;
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

const EditIconButton = styled.TouchableOpacity`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: ${colors.white};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  z-index: 5;
`;

const UserInfo = styled.View`
  flex: 1;
`;

const Nickname = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: 4px;
`;

const EmailContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const EmailLocal = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
`;

const EmailDomain = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
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

const ReportsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 40px;
`;

const ReportsTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 15px;
  text-align: center;
  text-transform: uppercase;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ReportsContentContainer = styled.View`
  min-height: 100px;
  justify-content: center;
`;

const NoReportsText = styled.Text`
  text-align: center;
  color: ${colors.text.secondary};
  font-size: 16px;
`;

// --- COMPONENT ---
export default function Profile() {
  const {
    user,
    profile,
    uploadProfileImage,
    updateUserProfile,
    loading: authLoading,
    initialLoading,
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

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
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
    setUploading(true);
    try {
      if (!user?.uid) throw new Error("User not found");

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
        <Stack.Screen options={{ title: "Your Profile" }} />
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.primary} />
        </LoadingContainer>
      </>
    );
  }

  const renderReportsContent = () => {
    if (reportsLoading) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }
    if (reportsError) {
      return <NoReportsText>{reportsError}</NoReportsText>;
    }
    if (reports.length === 0) {
      return <NoReportsText>You have no reports yet.</NoReportsText>;
    }
    return reports
      .slice(0, 2)
      .map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDelete={handleReportDelete}
          onStatusChange={() => {}}
          isAdmin={false}
        />
      ));
  };

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || user?.displayName || "");
    }
  }, [isEditMode, profile?.displayName, user?.displayName]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: "Your Profile" }} />
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
        <ProfileCard>
          {isEditMode ? (
            // Expanded Edit Mode
            <>
              <EditLabel>Profile Picture</EditLabel>
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
                  <EditIconButton
                    onPress={handleChoosePhoto}
                    disabled={uploading}
                  >
                    <Feather name="edit-2" size={20} color={colors.primary} />
                  </EditIconButton>
                </ExpandedAvatarWrapper>
              </AvatarTouchable>
              <EditLabel>Nickname</EditLabel>
              <EditInput
                value={editedNickname}
                onChangeText={setEditedNickname}
                placeholder="Enter your nickname"
                placeholderTextColor={colors.text.secondary}
              />

              <EditLabel>
                Email{" "}
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                  (Cannot be changed)
                </Text>
              </EditLabel>
              <EditInput
                value={user?.email || ""}
                editable={false}
                style={{
                  color: colors.text.secondary,
                  backgroundColor: colors.componentBackground,
                  borderWidth: 0,
                }}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <ActionButton
                  onPress={handleCancelEdit}
                  style={{ backgroundColor: colors.text.secondary }}
                >
                  <ActionButtonText>Close</ActionButtonText>
                </ActionButton>
                <ActionButton
                  onPress={handleSaveProfile}
                  style={{ backgroundColor: colors.primary }}
                  disabled={uploading}
                >
                  <ActionButtonText>
                    {uploading ? "Saving..." : "Save"}
                  </ActionButtonText>
                </ActionButton>
              </View>
            </>
          ) : (
            // Collapsed View
            <>
              <ProfileCardHeader>
                <UserInfo>
                  <Nickname>
                    {profile?.displayName || user?.displayName || "Nickname"}
                  </Nickname>
                  <EmailContainer>
                    <EmailLocal>{user?.email?.split("@")[0] || ""}</EmailLocal>
                    <EmailDomain>
                      {"@" + (user?.email?.split("@")[1] || "")}
                    </EmailDomain>
                  </EmailContainer>
                </UserInfo>
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
              </ProfileCardHeader>
              <StyledButton
                title="Edit Profile"
                onPress={() => setIsEditMode(true)}
                variant="secondary"
                style={{ marginBottom: 0 }}
              />
            </>
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

        <StyledButton
          title="Settings"
          onPress={() => router.push("/settings")}
        />

        <ReportsCard>
          <TouchableOpacity onPress={() => router.push("/my-reports")}>
            <ReportsTitle>View all my reports</ReportsTitle>
          </TouchableOpacity>
          <ReportsContentContainer>
            {renderReportsContent()}
          </ReportsContentContainer>
        </ReportsCard>
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
