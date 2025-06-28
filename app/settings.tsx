import React, { useState } from 'react';
import { View, Text, Switch, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';
import colors from '../src/theme/colors';

// --- STYLED COMPONENTS ---
const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
  padding: 20px;
`;

const SettingsCard = styled.View`
  background-color: ${colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CardHeader = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 20px;
  text-transform: uppercase;
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

const ActionButton = styled.TouchableOpacity<{ isDelete?: boolean }>`
  background-color: ${(props: { isDelete?: boolean }) => (props.isDelete ? colors.text.secondary : colors.primary)};
  padding: 15px;
  border-radius: 15px;
  align-items: center;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  font-size: 16px;
  font-weight: bold;
`;

// --- COMPONENT ---
export default function Settings() {
  const { profile, updateUserProfile, logOut, deleteAccount, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'Failed to log out.');
    }
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationPreferences?.push ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      Alert.alert('Success', 'Notification settings updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update settings.');
      setNotificationsEnabled(!value); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
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
              Alert.alert('Success', 'Your account has been deleted.');
              router.replace('/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Stack.Screen options={{ title: 'Settings' }} />

        <SettingsCard>
          <CardHeader>Notifications</CardHeader>
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
        </SettingsCard>

        <SettingsCard>
          <CardHeader>Account</CardHeader>
                              <ActionButton onPress={handleLogout} disabled={loading}>
            {loading && !isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <ButtonText>Logout</ButtonText>
            )}
          </ActionButton>
          <ActionButton onPress={handleDeleteAccount} isDelete>
            <ButtonText>Delete Account :(</ButtonText>
          </ActionButton>
        </SettingsCard>
      </Container>
    </>
  );
} 