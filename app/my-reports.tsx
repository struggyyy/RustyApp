import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function MyReportsScreen() {
  return (
    <View style={styles.container}>
        <Stack.Screen options={{ title: 'My Reports' }} />
        <Text>My Reports Screen Placeholder</Text>
        {/* Add list of user reports here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 