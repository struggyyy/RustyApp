import React, { useState, useCallback } from 'react';
import { StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { getReportsByUserId } from '../src/services/firebase/reports';
import { Report } from '../src/types/reports';
import ReportCard from '../src/components/ReportCard';
import theme from '../src/theme';

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.white};
  padding: 24px 12px;
`;

const HistoryContainer = styled.View`
  flex: 1;
  background-color: ${theme.colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  overflow: hidden; /* Ensures scroll view respects border radius */
`;

const HistoryTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text.primary};
  margin-bottom: 20px;
  text-align: center;
`;

const ReportsScrollView = styled.ScrollView``;

const CenteredContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const InfoText = styled.Text`
  font-size: 18px;
  color: ${theme.colors.text.tertiary};
  margin-top: 10px;
`;

const getStatusColor = (status: string) => {
  if (status.includes('recycled')) {
    return theme.colors.status.recycled;
  }
  if (status.includes('in process') || status.includes('submitted')) {
    return theme.colors.status.inProcess;
  }
  return theme.colors.text.primary;
};

export default function MyReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      setError('You must be logged in to view your reports.');
      return;
    }

    try {
      setError(null);
      const userReports = await getReportsByUserId(user.uid);
      setReports(userReports);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleReportDelete = (deletedReportId: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <CenteredContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <InfoText>Loading your reports...</InfoText>
        </CenteredContainer>
      );
    }

    if (error) {
      return (
        <CenteredContainer>
          <InfoText>{error}</InfoText>
        </CenteredContainer>
      );
    }

    if (reports.length === 0) {
      return (
        <CenteredContainer>
          <InfoText>You have no reports yet.</InfoText>
        </CenteredContainer>
      );
    }

    return reports.map((report) => (
      <ReportCard key={report.id} report={report} getStatusColor={getStatusColor} onDelete={handleReportDelete} />
    ));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Stack.Screen options={{ title: 'My Reports' }} />
        <HistoryContainer>
          <HistoryTitle>HISTORY OF REPORTS</HistoryTitle>
          <ReportsScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
            }
          >
            {renderContent()}
          </ReportsScrollView>
        </HistoryContainer>
      </Container>
    </>
  );
}