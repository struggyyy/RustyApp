import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

const AdminDashboard = () => {
  const { logOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text>Welcome, admin! Here you can manage users and reports.</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AdminDashboard;
