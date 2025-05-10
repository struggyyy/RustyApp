import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Pressable, StatusBar, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import styled from 'styled-components/native';

// Styled Components
const StyledScrollView = styled(ScrollView)({
  flex: 1,
  backgroundColor: '#FFFFFF',
});

const BaseContainer = styled.View({
    flex: 1,
    backgroundColor: '#FFFFFF',
});

const HeaderView = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingTop: StatusBar.currentHeight || 0,
  paddingBottom: 8,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#D9D9D9',
});

const HeaderTitle = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: '#656565',
});

const HeaderPressable = styled.Pressable<{ pressed?: boolean }>((props: { pressed?: boolean }) => ({
  padding: 8,
  borderRadius: 20,
  ...(props.pressed && { backgroundColor: 'rgba(0, 0, 0, 0.05)' }),
}));

const SettingsButtonContainer = styled.View({
  width: 32,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
});

const SettingsIconText = styled.Text({
  fontSize: 20,
});

// For ScrollView's contentContainerStyle, we define an object, not a styled component
const contentContainerStyleObject = {
  alignItems: 'center',
  paddingVertical: 30,
  paddingHorizontal: 20,
};

const ProfileHeaderView = styled.View({
  alignItems: 'center',
  marginBottom: 30,
});

const AvatarTouchable = styled.TouchableOpacity({}); // No specific styles for the touchable itself, props will handle disabled state

const AvatarWrapper = styled.View({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: '#eee',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 15,
  position: 'relative',
  borderWidth: 3,
  borderColor: '#BD5151',
});

const AvatarImage = styled.Image({
  width: '100%',
  height: '100%',
  borderRadius: 60,
});

const AvatarPlaceholderView = styled.View({
  width: '100%',
  height: '100%',
  borderRadius: 60,
  backgroundColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
});

const AvatarPlaceholderText = styled.Text({
  fontSize: 40,
  color: '#fff',
  fontWeight: 'bold',
});

const UploadIndicator = styled(ActivityIndicator)({
  position: 'absolute',
});

const UserNameText = styled.Text({
  fontSize: 22,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 5,
});

const UserEmailText = styled.Text({
  fontSize: 16,
  color: '#666',
  marginBottom: 30,
});

const InfoContainerView = styled.View({
  width: '100%',
  marginBottom: 30,
});

const LabelText = styled.Text({
  fontSize: 14,
  color: '#656565',
  marginBottom: 4,
});

const ValueText = styled.Text({
  fontSize: 16,
  color: '#000000',
  marginBottom: 16,
});

interface StyledButtonProps {
  isLogoutButton?: boolean;
}
const StyledButton = styled.TouchableOpacity<StyledButtonProps>((props: StyledButtonProps) => ({
  backgroundColor: props.isLogoutButton ? '#6c757d' : '#BD5151',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 25,
  alignItems: 'center',
  marginBottom: 15,
  width: '80%',
  ...(props.isLogoutButton && { marginTop: 20 }),
}));

const ButtonText = styled.Text({
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
});

const LoadingIndicatorView = styled(ActivityIndicator)({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export default function Profile() {
  const { user, profile, logOut, uploadProfileImage, loading: authLoading, initialLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const isLoading = authLoading || initialLoading || uploading || refreshing;

  const profileImageUrl = profile?.profileImage || user?.photoURL;

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace('/login');
    }
  }, [initialLoading, user, router]);

  const handleLogout = async () => {
    try {
      await logOut();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'Failed to log out.');
    }
  };

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
        const uploadedUrl = await uploadProfileImage(user.uid, source.uri);
        if (uploadedUrl) {
          Alert.alert('Success', 'Profile picture updated!');
        } else {
          throw new Error('Upload completed but no URL was returned.');
      }
      } catch (error: any) {
        console.error('Upload error:', error);
        Alert.alert('Upload Error', error.message || 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    console.log('Refreshing profile...');
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (initialLoading) {
    return <LoadingIndicatorView size="large" />;
  }

  if (!user) {
    // Using BaseContainer here which has flex: 1 and backgroundColor
    return <BaseContainer><Text>Please log in.</Text></BaseContainer>; 
    }

  return (
    <StyledScrollView
      contentContainerStyle={contentContainerStyleObject} // Use the style object here
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen
        options={{
          title: 'Your Profile',
          headerShown: true,
          header: () => (
            <HeaderView>
              <HeaderTitle>Your Profile</HeaderTitle>
              <HeaderPressable
                onPress={() => {
                  console.log('Settings button pressed');
                  router.push('/settings');
                }}
              >
                <SettingsButtonContainer>
                  <SettingsIconText>⚙️</SettingsIconText>
                </SettingsButtonContainer>
              </HeaderPressable>
            </HeaderView>
          ),
        }}
      />

      <ProfileHeaderView>
        <AvatarTouchable onPress={handleChoosePhoto} disabled={isLoading}>
          <AvatarWrapper>
            {profileImageUrl ? (
            <AvatarImage
                source={{ uri: profileImageUrl }}
            />
          ) : (
              <AvatarPlaceholderView>
                <AvatarPlaceholderText>
                  {user?.email?.[0]?.toUpperCase() || 'P'}
              </AvatarPlaceholderText>
            </AvatarPlaceholderView>
          )}
            {uploading && (
              <UploadIndicator size="small" color="#fff" />
            )}
          </AvatarWrapper>
        </AvatarTouchable>
        <UserNameText>{profile?.displayName || user?.displayName || 'Username'}</UserNameText>
        <UserEmailText>{user?.email}</UserEmailText>
      </ProfileHeaderView>

        <InfoContainerView>
          <LabelText>Display Name</LabelText>
        <ValueText>{user?.displayName || 'Not set'}</ValueText>
          
          <LabelText>Email</LabelText>
          <ValueText>{user?.email}</ValueText>
        </InfoContainerView>

        <StyledButton
        onPress={() => router.push('/reports')}
        disabled={isLoading}
        >
        <ButtonText>View My Reports</ButtonText>
        </StyledButton>

        <StyledButton 
        onPress={() => router.push('/settings')}
        disabled={isLoading}
        >
        <ButtonText>Settings</ButtonText>
        </StyledButton>

        <StyledButton 
        isLogoutButton // This prop will apply the logout button specific styles
        onPress={handleLogout}
        disabled={isLoading}
        >
        <ButtonText>Logout</ButtonText>
        </StyledButton>
    </StyledScrollView>
  );
} 