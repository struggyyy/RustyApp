/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React-specific imports
import React, { useRef, useEffect } from "react";
import { FlatList, ActivityIndicator, RefreshControl } from "react-native";

// External libraries
import styled from "styled-components/native";

// Internal imports
import ReportCard from "./ReportCard";
import { Report, ReportStatus } from "@/shared/types/reports";
import theme from "@theme/index";

// Styled components for layout and messaging
const CenteredContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const InfoText = styled.Text({
  fontSize: 18,
  color: theme.colors.text.tertiary,
  marginTop: 10,
  textAlign: "center",
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

// Main component for displaying a list of reports
const ReportList: React.FC<ReportListProps> = ({
  reports,
  loading,
  error,
  refreshing,
  isAdmin,
  onRefresh,
  loadingText = "Loading reports...",
  emptyText = "No reports found.",
  onDetailsPress,
  scrollToIndex,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Scroll to specific index when scrollToIndex changes
  useEffect(() => {
    if (
      scrollToIndex !== undefined &&
      scrollToIndex >= 0 &&
      flatListRef.current
    ) {
      flatListRef.current.scrollToIndex({
        index: scrollToIndex,
        animated: true,
        viewPosition: 0.5, // Center the item in the view
      });
    }
  }, [scrollToIndex]);

  // Show loading state
  if (loading && !refreshing) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <InfoText>{loadingText}</InfoText>
      </CenteredContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <CenteredContainer>
        <InfoText>{error}</InfoText>
      </CenteredContainer>
    );
  }

  // Show empty state
  if (reports.length === 0) {
    return (
      <CenteredContainer>
        <InfoText>{emptyText}</InfoText>
      </CenteredContainer>
    );
  }

  // Render reports list
  return (
    <FlatList
      ref={flatListRef}
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReportCard
          key={item.id}
          report={item}
          isAdmin={isAdmin}
          onDetailsPress={
            onDetailsPress ? () => onDetailsPress(item) : undefined
          }
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
      getItemLayout={(_, index) => ({
        length: 150,
        offset: 150 * index,
        index,
      })}
    />
  );
};

export default ReportList;
