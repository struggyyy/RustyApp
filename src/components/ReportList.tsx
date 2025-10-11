import React from 'react';
import { ScrollView, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import styled from 'styled-components/native';
import ReportCard from './ReportCard';
import { Report, ReportStatus } from '../types/reports';
import theme from '../theme';

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


interface ReportListProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
  onDelete: (reportId: string) => void;
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void;
  loadingText?: string;
  emptyText?: string;
}

const ReportList: React.FC<ReportListProps> = ({
  reports,
  loading,
  error,
  refreshing,
  isAdmin,
  onRefresh,
  onDelete,
  onStatusChange,
  loadingText = 'Loading reports...',
  emptyText = 'No reports found.',
}) => {
  if (loading && !refreshing) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <InfoText>{loadingText}</InfoText>
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
        <InfoText>{emptyText}</InfoText>
      </CenteredContainer>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
      }
    >
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onDelete={onDelete} onStatusChange={onStatusChange} isAdmin={isAdmin} />
      ))}
    </ScrollView>
  );
};

export default ReportList;
