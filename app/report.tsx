import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
       {/* Use Stack.Screen to configure header options for this screen */}
       <Stack.Screen options={{ title: 'Report a Car', presentation: 'modal' }} />
       <Text>Report Screen Placeholder</Text>
       {/* Add report form components here */}
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