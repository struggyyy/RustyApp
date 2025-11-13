import React, { useRef, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import ReportCard from './ReportCard';
import { Report, ReportStatus } from '../../../shared/types/reports';
import theme from '../../../core/theme';

const CenteredContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const InfoText = styled.Text({
  fontSize: 18,
  color: theme.colors.text.tertiary,
  marginTop: 10,
  textAlign: 'center',
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
  onDetailsPress?: (report: Report) => void;
  scrollToIndex?: number;
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
  onDetailsPress,
  scrollToIndex,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Scroll to specific index when scrollToIndex changes
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: scrollToIndex,
        animated: true,
        viewPosition: 0.5, // Center the item in the view
      });
    }
  }, [scrollToIndex]);

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
          onDetailsPress={onDetailsPress ? () => onDetailsPress(item) : undefined}
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
      getItemLayout={(data, index) => ({
        length: 150,
        offset: 150 * index,
        index,
      })}
    />
  );
};

export default ReportList;
