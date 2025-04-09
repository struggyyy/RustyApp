import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Pressable, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../src/lib/supabase';

export default function Profile() {
  const { user, updateUserProfile, loading: authLoading, uploadProfileImage, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.displayName || '');
      setEmail(user.email || '');
      setProfileImage(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(displayName);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const uri = result.assets[0].uri;
        const avatarUrl = await uploadProfileImage(uri);
        await updateUserProfile(avatarUrl);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setLoading(false);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: 'Your Profile',
          headerShown: true,
          header: () => (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Profile</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed
                ]}
                onPress={() => {
                  console.log('Settings button pressed');
                  router.push('/settings');
                }}
              >
                <View style={styles.settingsButtonContainer}>
                  <Text style={styles.settingsIcon}>⚙️</Text>
                </View>
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={styles.content}>
        <Pressable 
          style={styles.profileImageContainer}
          onPress={pickImage}
          disabled={loading}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {user?.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{user?.user_metadata?.display_name || 'Not set'}</Text>
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={loading || authLoading}
        >
          {loading || authLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.reportsButton}
          onPress={() => router.push('/reports')}
        >
          <Text style={styles.reportsButtonText}>View My Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#656565',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingsButtonContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    color: '#656565',
    fontSize: 40,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#656565',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#BD5151',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportsButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BD5151',
    borderRadius: 8,
  },
  reportsButtonText: {
    color: '#BD5151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BD5151',
  },
  signOutButtonText: {
    color: '#BD5151',
    fontSize: 16,
    fontWeight: '600',
  },
}); 