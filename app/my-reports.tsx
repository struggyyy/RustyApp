import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import colors from '../src/theme/colors';
import ReportCard, { Report } from '../src/components/ReportCard';

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
`;

const HistoryContainer = styled.View`
  flex: 1;
  background-color: ${colors.componentBackground};
  width: 95%;
  align-self: center;
  margin-top: 20px;
  border-radius: 24px;
  padding: 15px;
`;

const HistoryTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 20px;
  text-align: center;
`;

const ReportsScrollView = styled.ScrollView``;

const NoReportsContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const NoReportsText = styled.Text`
    font-size: 18px;
    color: ${colors.text.tertiary};
`;


const reports: Report[] = [
  {
    id: '1',
    date: '01.01.25',
    status: 'Car successfully removed and recycled',
    points: '+100p',
    image: require('../assets/images/CAR.png'), // Placeholder image
  },
  {
    id: '2',
    date: '12.02.25',
    status: 'Report in the process...',
    points: '...',
    image: require('../assets/images/CAR.png'), // Placeholder image
  },
];

const getStatusColor = (status: string) => {
    if (status.includes('recycled')) {
      return colors.status.recycled;
    }
    if (status.includes('in process')) {
      return colors.status.inProcess;
    }
    return colors.text.primary;
  };

export default function MyReportsScreen() {
  const router = useRouter();
  const hasReports = reports.length > 0;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Stack.Screen
          options={{
            title: 'My Reports',
          }}
        />
        <HistoryContainer>
          <HistoryTitle>HISTORY OF REPORTS</HistoryTitle>
          {/* TODO: Add blinking "We are processing your report..." text here when isLoading is true */}
          {hasReports ? (
            <ReportsScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} getStatusColor={getStatusColor} />
              ))}
            </ReportsScrollView>
          ) : (
            <NoReportsContainer>
                <NoReportsText>You have no reports yet.</NoReportsText>
            </NoReportsContainer>
          )}
        </HistoryContainer>
      </Container>
    </>
  );
}