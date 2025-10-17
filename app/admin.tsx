import React, { useState, useCallback, useEffect } from 'react';
import { View, Button } from 'react-native';
import { useFocusEffect } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { getAllReports } from '../src/services/firebase/reports';
import { Report, ReportStatus } from '../src/types/reports';
import ReportList from '../src/components/ReportList';
import theme from '../src/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.white};
  padding: 24px 12px;
`;

const DashboardContainer = styled.View`
  flex: 1;
  background-color: ${theme.colors.componentBackground};
  border-radius: 24px;
  padding: 20px;
  overflow: hidden;
`;

const LogoutButtonContainer = styled.View`
  margin: 10px 20px;
`;

const AdminDashboard = () => {
  const { logOut, isAdmin } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, router]);

  const fetchAllReports = useCallback(async () => {
    try {
      setError(null);
      const allReports = await getAllReports();
      setReports(allReports);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAllReports();
    }, [fetchAllReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllReports();
  }, [fetchAllReports]);

  const handleReportDelete = (deletedReportId: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== deletedReportId));
  };

  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  const handleLogout = async () => {
    try {
      await logOut(router);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Container>
      <DashboardContainer>
        <ReportList
          reports={reports}
          loading={loading}
          error={error}
          refreshing={refreshing}
          isAdmin={true}
          onRefresh={onRefresh}
          onDelete={handleReportDelete}
          onStatusChange={handleStatusChange}
          loadingText="Loading all reports..."
          emptyText="There are no reports in the system."
        />
      </DashboardContainer>
      <LogoutButtonContainer>
        <Button title="Log Out" onPress={handleLogout} color={theme.colors.primary} />
      </LogoutButtonContainer>
    </Container>
  );
};

export default AdminDashboard;
