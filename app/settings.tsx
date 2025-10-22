import React, { useState } from 'react';
import { View, Text, Switch, ActivityIndicator, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import styled from 'styled-components/native';
import colors from '../src/theme/colors';
import StyledButton from '../src/components/common/StyledButton';
import CustomAlert from '../src/components/common/CustomAlert';

// --- STYLED COMPONENTS ---
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${colors.white};
  padding: 24px 12px;
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


// --- COMPONENT ---
export default function Settings() {
  const { profile, updateUserProfile, logOut, deleteAccount, loading } = useAuth();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationPreferences?.push ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error: any) {
      showAlert('Logout Error', error.message || 'Failed to log out.');
    }
  };

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
          <StyledButton
            title="Logout"
            onPress={handleLogout}
            disabled={loading}
            loading={loading && !isSubmitting}
          />
          <StyledButton
            title="Delete Account :("
            onPress={handleDeleteAccount}
            variant="secondary"
          />
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