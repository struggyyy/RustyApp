import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading, session } = useAuth();
  const router = useRouter();

  // Add logging to debug authentication state
  useEffect(() => {
    console.log('Index page - Auth state:', { 
      isLoading: loading,
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email || 'none'
    });
    
    if (!loading) {
      if (user) {
        console.log('Index redirecting to home:', user.email);
        router.replace('/home');
      } else {
        console.log('Index redirecting to login: No user found');
        router.replace('/login');
      }
    }
  }, [loading, user, session, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#BD5151" />
        <Text style={styles.loadingText}>Loading authentication...</Text>
      </View>
    );
  }

  // We'll handle redirects in the useEffect hook
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#BD5151" />
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#656565',
  }
}); 