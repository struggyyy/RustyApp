import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Home() {
  const { user, signOut, session } = useAuth();
  const router = useRouter();

  // Add logging to debug when Home screen is rendered
  useEffect(() => {
    console.log('Home screen rendered:', {
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email || 'none'
    });
  }, [user, session]);

  const handleSignOut = async () => {
    console.log('Sign out requested');
    await signOut();
    console.log('Sign out complete, redirecting to login');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Rusty',
          headerShown: true,
        }}
      />
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user?.email}!</Text>
        <Text style={styles.subtitle}>You've successfully logged in to Rusty</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Report Abandoned Vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Explore Nearby Reports</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#656565',
  },
  subtitle: {
    fontSize: 16,
    color: '#656565',
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#656565',
  },
  actionButton: {
    backgroundColor: '#BD5151',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 20,
    padding: 15,
  },
  signOutText: {
    color: '#BD5151',
    fontSize: 16,
    fontWeight: '600',
  },
}); 