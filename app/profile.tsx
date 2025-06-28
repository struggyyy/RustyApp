import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, StatusBar, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';
import colors from '../src/theme/colors';
import ReportCard, { Report } from '../src/components/ReportCard';

// --- MOCK DATA ---
const reports: Report[] = [
  {
    id: '1',
    date: '01.01.25',
    status: 'Car successfully removed and recycled',
    points: '+100p',
    image: require('../assets/images/CAR.png'),
  },
  {
    id: '2',
    date: '12.02.25',
    status: 'Report in the process...',
    points: '...',
    image: require('../assets/images/CAR.png'),
  },
];

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

// --- COMPONENT ---
export default function Profile() {
  const { user, profile, uploadProfileImage, loading: authLoading, initialLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const isLoading = authLoading || initialLoading || uploading || refreshing;
  const profileImageUrl = profile?.profileImage || user?.photoURL;

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace('/login');
    }
  }, [initialLoading, user, router]);


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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (initialLoading) {
    return <LoadingContainer><ActivityIndicator size="large" color={colors.primary} /></LoadingContainer>;
  }

  if (!user) {
    return <LoadingContainer><Text>Please log in.</Text></LoadingContainer>;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: 'Your Profile' }} />
      <Container
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                    <StyledButton onPress={() => { /* TODO: Navigate to Edit Profile screen */ }} isLogout style={{ marginBottom: 0 }}>
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
          {reports.slice(0, 2).map((report) => (
            <ReportCard key={report.id} report={report} getStatusColor={getStatusColor} />
          ))}
        </ReportsCard>
      </Container>
    </>
  );
} 