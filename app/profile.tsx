import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';
import StyledButton from '../src/components/common/StyledButton';
import ReportCard from '../src/components/ReportCard';
import { Report } from '../src/types/reports';
import { getReportsByUserId } from '../src/services/firebase/reports';
import colors from '../src/theme/colors';


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
  margin-bottom: 20px;
`;

const EditInput = styled.TextInput`
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: ${colors.text.primary};
  margin-bottom: 16px;
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
  border: 3px solid ${colors.primary};
  align-self: center;
  margin-bottom: 16px;
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

const ChangePhotoButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: 8px 16px;
  border-radius: 12px;
  align-self: center;
  margin-bottom: 16px;
`;

const ChangePhotoButtonText = styled.Text`
  color: ${colors.white};
  font-weight: bold;
  font-size: 12px;
`;

const FullScreenModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.9);
  justify-content: center;
  align-items: center;
`;

const FullScreenImage = styled.Image`
  width: 90%;
  height: 90%;
`;

const CloseModalButton = styled.TouchableOpacity`
  position: absolute;
  top: 40px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 10px;
  border-radius: 20px;
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

const Email = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  margin-bottom: 12px;
`;

const CommunityScore = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.text.primary};
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

const UploadIndicator = styled(ActivityIndicator)`
  position: absolute;
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
  const { user, profile, uploadProfileImage, updateUserProfile, loading: authLoading, initialLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNickname, setEditedNickname] = useState('');
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const router = useRouter();

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
    setReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReportsError('Failed to load reports.');
    } finally {
      setReportsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace('/login');
    }
    if (user) {
      fetchReports();
    }
  }, [initialLoading, user, router, fetchReports]);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      if (!user?.uid) throw new Error('User not found');

      // Upload new profile picture if changed
      if (tempImageUri) {
        await uploadProfileImage(user.uid, tempImageUri);
      }

      // Update display name if changed
      if (editedNickname && editedNickname !== (profile?.displayName || user?.displayName)) {
        await updateUserProfile({ displayName: editedNickname });
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditMode(false);
      setTempImageUri(null);
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setTempImageUri(null);
    setEditedNickname(profile?.displayName || user?.displayName || '');
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
    return <LoadingContainer><ActivityIndicator size="large" color={colors.primary} /></LoadingContainer>;
  }

  if (!user) {
    return <LoadingContainer><Text>Please log in.</Text></LoadingContainer>;
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
        return reports.slice(0, 2).map((report) => (
      <ReportCard key={report.id} report={report} onDelete={handleReportDelete} onStatusChange={() => {}} isAdmin={false} />
    ));
  };

  useEffect(() => {
    if (isEditMode) {
      setEditedNickname(profile?.displayName || user?.displayName || '');
    }
  }, [isEditMode, profile?.displayName, user?.displayName]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: 'Your Profile' }} />
      <Container
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
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
                      <ExpandedAvatarPlaceholderText>{user?.email?.[0]?.toUpperCase() || '?'}</ExpandedAvatarPlaceholderText>
                    </ExpandedAvatarPlaceholder>
                  )}
                </ExpandedAvatarWrapper>
              </AvatarTouchable>
              <ChangePhotoButton onPress={handleChoosePhoto} disabled={uploading}>
                <ChangePhotoButtonText>Change Photo</ChangePhotoButtonText>
              </ChangePhotoButton>

              <EditLabel>Display Name</EditLabel>
              <EditInput
                value={editedNickname}
                onChangeText={setEditedNickname}
                placeholder="Enter your nickname"
                placeholderTextColor={colors.text.secondary}
              />

              <EditLabel>Email</EditLabel>
              <EditInput
                value={user?.email || ''}
                editable={false}
                style={{ color: colors.text.secondary }}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <ActionButton onPress={handleCancelEdit} style={{ backgroundColor: colors.text.secondary }}>
                  <ActionButtonText>Close</ActionButtonText>
                </ActionButton>
                <ActionButton onPress={handleSaveProfile} style={{ backgroundColor: colors.primary }} disabled={uploading}>
                  <ActionButtonText>{uploading ? 'Saving...' : 'Save'}</ActionButtonText>
                </ActionButton>
              </View>
            </>
          ) : (
            // Collapsed View
            <>
              <ProfileCardHeader>
                <UserInfo>
                  <Nickname>{profile?.displayName || user?.displayName || 'Nickname'}</Nickname>
                  <Email>{user?.email}</Email>
                </UserInfo>
                <AvatarTouchable onPress={handleAvatarPress} disabled={isLoading}>
                  <AvatarWrapper>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : profileImageUrl ? (
                      <AvatarImage source={{ uri: profileImageUrl }} />
                    ) : (
                      <AvatarPlaceholder>
                        <AvatarPlaceholderText>{user?.email?.[0]?.toUpperCase() || '?'}</AvatarPlaceholderText>
                      </AvatarPlaceholder>
                    )}
                  </AvatarWrapper>
                </AvatarTouchable>
              </ProfileCardHeader>
              <StyledButton title="Edit Profile" onPress={() => setIsEditMode(true)} variant="secondary" style={{ marginBottom: 0 }} />
            </>
          )}
        </ProfileCard>

        <Modal visible={showImageModal} transparent={true} animationType="fade">
          <FullScreenModalContainer>
            <CloseModalButton onPress={() => setShowImageModal(false)}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </CloseModalButton>
            {profileImageUrl && (
              <FullScreenImage source={{ uri: profileImageUrl }} resizeMode="contain" />
            )}
          </FullScreenModalContainer>
        </Modal>

        <StyledButton title="Settings" onPress={() => router.push('/settings')} />

        <ReportsCard>
          <TouchableOpacity onPress={() => router.push('/my-reports')}>
            <ReportsTitle>View all my reports</ReportsTitle>
          </TouchableOpacity>
          <ReportsContentContainer>
            {renderReportsContent()}
          </ReportsContentContainer>
        </ReportsCard>
      </Container>
    </>
  );
} 