import React, { useState, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { getReportsByUserId } from '../src/services/firebase/reports';
import { Report, ReportStatus } from '../src/types/reports';
import ReportList from '../src/components/ReportList';
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
  overflow: hidden;
`;

const HistoryTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${theme.colors.text.primary};
  margin-bottom: 20px;
  text-align: center;
`;

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

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Stack.Screen options={{ title: 'My Reports' }} />
        <HistoryContainer>
          <HistoryTitle>HISTORY OF REPORTS</HistoryTitle>
          <ReportList
            reports={reports}
            loading={loading}
            error={error}
            refreshing={refreshing}
            isAdmin={false}
            onRefresh={onRefresh}
            onDelete={handleReportDelete}
            onStatusChange={() => {}} // No-op for users
            loadingText="Loading your reports..."
            emptyText="You have no reports yet."
          />
        </HistoryContainer>
      </Container>
    </>
  );
}