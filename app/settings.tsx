import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationRow}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleNotifications}
            value={notificationsEnabled}
            disabled={isLoading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.settingLabel}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/reports')}
        >
          <Text style={styles.settingLabel}>View Report History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.logoutButtonText}>Log Out</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#656565',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  settingLabel: {
    fontSize: 16,
    color: '#656565',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  logoutButton: {
    backgroundColor: '#BD5151',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
}); 