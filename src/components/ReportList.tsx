import React, { useRef, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import ReportCard from './ReportCard';
import { Report, ReportStatus } from '../types/reports';
import theme from '../theme';

const CenteredContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const InfoText = styled.Text({
  fontSize: 18,
  color: theme.colors.text.tertiary,
  marginTop: 10,
});


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
  expandedReportId?: string;
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
  expandedReportId,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (expandedReportId && flatListRef.current) {
      const index = reports.findIndex(report => report.id === expandedReportId);
      if (index !== -1) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [expandedReportId, reports]);

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
    <FlatList
      ref={flatListRef}
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReportCard
          key={item.id}
          report={item}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isAdmin={isAdmin}
          expandedReportId={expandedReportId}
        />
      )}
      contentContainerStyle={{ paddingTop: 13 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      fadingEdgeLength={15}
      showsVerticalScrollIndicator={false}
      getItemLayout={(data, index) => {
        if (!data) return { length: 150, offset: 150 * index, index };
        const item = data[index];
        const isExpanded = item.id === expandedReportId;
        const length = isExpanded ? 400 : 150;
        let offset = 0;
        for (let i = 0; i < index; i++) {
          const curr = data[i];
          const currExpanded = curr.id === expandedReportId;
          offset += currExpanded ? 400 : 150;
        }
        return { length, offset, index };
      }}
    />
  );
};

export default ReportList;
