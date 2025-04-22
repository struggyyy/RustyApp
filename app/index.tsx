import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
// Removed useRouter and useAuth as this page should not handle redirects directly
// import { Redirect, useRouter } from 'expo-router';
// import { useAuth } from '../src/context/AuthContext';

/**
 * This is the initial screen loaded by the router.
 * It should simply render a loading indicator.
 * The actual routing logic (checking auth state and redirecting)
 * is handled by the AuthGuard component in `app/_layout.tsx`.
 */
export default function Index() {
  // Removed useEffect hook that performed redirects
  // const { user, loading, session } = useAuth();
  // const router = useRouter();
  // useEffect(() => { ... redirect logic removed ... }, [loading, user, session, router]);

  // Render a simple loading indicator while the AuthGuard in layout decides the route.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#BD5151" />
      <Text style={styles.loadingText}>Loading...</Text>
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