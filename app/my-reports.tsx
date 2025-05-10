import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import styled from 'styled-components/native';

// Styled Component
const StyledContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export default function MyReportsScreen() {
  return (
    <StyledContainer>
        <Stack.Screen options={{ title: 'My Reports' }} />
        <Text>My Reports Screen Placeholder</Text>
        {/* Add list of user reports here */}
    </StyledContainer>
  );
} 