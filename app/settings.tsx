import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';

// Styled Components
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: '#FFFFFF',
});

const SectionView = styled.View({
  marginBottom: 30,
  paddingHorizontal: 20,
});

const SectionTitleText = styled.Text({
  fontSize: 18,
  fontWeight: 'bold',
  color: '#656565',
  marginBottom: 15,
});

interface SettingItemProps {
  isDangerItem?: boolean;
}
const SettingItemTouchable = styled.TouchableOpacity<SettingItemProps>((props: SettingItemProps) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 15,
  borderBottomWidth: props.isDangerItem ? 0 : 1,
  borderBottomColor: '#D9D9D9',
}));

interface SettingLabelTextProps {
  isDangerText?: boolean;
}
const SettingLabelText = styled.Text<SettingLabelTextProps>((props: SettingLabelTextProps) => ({
  fontSize: 16,
  color: props.isDangerText ? '#FF3B30' : '#656565',
}));

interface LogoutButtonProps {
  isDisabled?: boolean;
}
const LogoutButtonTouchable = styled.TouchableOpacity<LogoutButtonProps>((props: LogoutButtonProps) => ({
  backgroundColor: props.isDisabled ? '#cccccc' : '#BD5151',
  borderColor: props.isDisabled ? '#cccccc' : 'transparent', // Assuming default border is transparent or not set
  borderRadius: 8,
  padding: 15,
  alignItems: 'center',
  marginHorizontal: 20,
}));

const LogoutButtonText = styled.Text({
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: 16,
});

const NotificationRowView = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  marginTop: 10,
});

export default function Settings() {
  const { user, profile, updateUserProfile, updateUserAuth, logOut, loading, deleteAccount } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationPreferences?.push ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleNotifications = async () => {
    setIsSubmitting(true);
    const newValue = !notificationsEnabled;
    try {
      const currentEmailPref = profile?.notificationPreferences?.email ?? true;
      await updateUserProfile({
        notificationPreferences: {
            email: currentEmailPref,
            push: newValue
        }
      });
      setNotificationsEnabled(newValue);
      Alert.alert('Success', 'Notification settings updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateUserProfile({ displayName });
      await updateUserAuth({ displayName });
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logOut();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Logout failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you ABSOLUTELY SURE you want to delete your account? This action is irreversible and will remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE PERMANENTLY',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              console.log('[Settings] Calling deleteAccount from context...');
              await deleteAccount();
              console.log('[Settings] deleteAccount successful. Navigating to login.');
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              router.replace('/login');
            } catch (error: any) {
              console.error('[Settings] Failed to delete account:', error);
              Alert.alert('Deletion Failed', error.message || 'Failed to delete account. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const isLoading = loading || isSubmitting;

  return (
    <StyledContainer>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />

      <SectionView>
        <SectionTitleText>Notifications</SectionTitleText>
        <NotificationRowView>
          <SettingLabelText>Enable Notifications</SettingLabelText>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleNotifications}
            value={notificationsEnabled}
            disabled={isLoading}
          />
        </NotificationRowView>
      </SectionView>

      <SectionView>
        <SectionTitleText>Account</SectionTitleText>
        <SettingItemTouchable
          onPress={() => router.push('/profile')}
        >
          <SettingLabelText>Edit Profile</SettingLabelText>
        </SettingItemTouchable>
        <SettingItemTouchable
          onPress={() => router.push('/reports')}
        >
          <SettingLabelText>View Report History</SettingLabelText>
        </SettingItemTouchable>
        <SettingItemTouchable
          isDangerItem
          onPress={handleDeleteAccount}
        >
          <SettingLabelText isDangerText>Delete Account</SettingLabelText>
        </SettingItemTouchable>
      </SectionView>

      <SectionView>
        <LogoutButtonTouchable
          isDisabled={isLoading}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <LogoutButtonText>Log Out</LogoutButtonText>}
        </LogoutButtonTouchable>
      </SectionView>
    </StyledContainer>
  );
} 