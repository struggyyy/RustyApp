import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Pressable, StatusBar, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';

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
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;
  }

  if (!user) {
    return <View style={styles.container}><Text>Please log in.</Text></View>;
    }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleChoosePhoto} disabled={isLoading}>
          <View style={styles.avatarContainer}>
            {profileImageUrl ? (
            <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatar}
            />
          ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.email?.[0]?.toUpperCase() || 'P'}
              </Text>
            </View>
          )}
            {uploading && (
              <ActivityIndicator style={styles.uploadIndicator} size="small" color="#fff" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{profile?.displayName || user?.displayName || 'Username'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Display Name</Text>
        <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
        onPress={() => router.push('/reports')}
        disabled={isLoading}
        >
        <Text style={styles.buttonText}>View My Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/settings')}
        disabled={isLoading}
        >
        <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
        disabled={isLoading}
        >
        <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    </ScrollView>
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
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
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
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadIndicator: {
    position: 'absolute',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#6c757d',
    marginTop: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 