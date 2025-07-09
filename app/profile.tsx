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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';
import colors from '../src/theme/colors';
import ReportCard from '../src/components/ReportCard';
import { Report } from '../src/types/reports';
import { getReportsByUserId } from '../src/services/firebase/reports';

const getStatusColor = (status: string) => {
  if (status.includes('recycled')) return colors.status.recycled;
  if (status.includes('in process')) return colors.status.inProcess;
  return colors.text.primary;
};

// --- STYLED COMPONENTS ---
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${colors.white};
  padding: 20px;
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

interface ButtonProps {
  isLogout?: boolean;
}

const StyledButton = styled.TouchableOpacity<ButtonProps>`
  background-color: ${(props: ButtonProps) => (props.isLogout ? colors.text.secondary : colors.primary)};
  padding: 12px;
  border-radius: 15px;
  align-items: center;
  margin-bottom: 15px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-size: 16px;
  font-weight: bold;
`;

const ReportsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px 20px 5px;
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
  const { user, profile, uploadProfileImage, loading: authLoading, initialLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const router = useRouter();

  const isLoading = authLoading || initialLoading || uploading;
  const profileImageUrl = profile?.profileImage || user?.photoURL;

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
      setUploading(true);
      try {
        if (!user?.uid) throw new Error('User not found for upload');
        await uploadProfileImage(user.uid, source.uri);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error: any) {
        console.error('Upload error:', error);
        Alert.alert('Upload Error', error.message || 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
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
      return <NoReportsText>You haven't reported any cars yet.</NoReportsText>;
    }
    return reports.slice(0, 2).map((report) => (
      <ReportCard key={report.id} report={report} getStatusColor={getStatusColor} />
    ));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: 'Your Profile' }} />
      <Container
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <ProfileCard>
          <ProfileCardHeader>
            <UserInfo>
              <Nickname>{profile?.displayName || user?.displayName || 'Nickname'}</Nickname>
              <Email>{user?.email}</Email>
            </UserInfo>
            <AvatarTouchable onPress={handleChoosePhoto} disabled={isLoading}>
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
          <StyledButton onPress={() => { /* TODO: Navigate to Edit Profile screen */ }} style={{ marginBottom: 0 }}>
            <ButtonText>Edit Profile</ButtonText>
          </StyledButton>
        </ProfileCard>

        <StyledButton onPress={() => router.push('/settings')}>
          <ButtonText>Settings</ButtonText>
        </StyledButton>

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