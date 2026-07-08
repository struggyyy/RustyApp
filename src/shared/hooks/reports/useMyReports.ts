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
// React specific imports
import { useState, useCallback, useEffect } from "react";

// External libraries
import { useLocalSearchParams } from "expo-router";

// Internal imports
import { deleteReport } from "@/lib/firebase/reports";
import { Report } from "@/shared/types/reports";
import { useReports } from "@/shared/hooks/reports/useReports";

export function useMyReports() {
  const { reportId } = useLocalSearchParams();

  // Use shared reports hook for data
  const { reports, loading, error, fetchReports, setReports } = useReports();

  // Local state for UI logic
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(
    undefined,
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  // Handle report deletion
  const handleReportDelete = async (deletedReportId: string) => {
    try {
      const reportToDelete = reports.find(
        (report) => report.id === deletedReportId,
      );
      if (reportToDelete) {
        await deleteReport(deletedReportId, reportToDelete.imageUrl);
      }
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== deletedReportId),
      );
    } catch (error) {}
  };

  // Modal handlers
  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
    setScrollToIndex(undefined);
  };

  const handleDetailsPress = (report: Report) => {
    const reportIndex = reports.findIndex((r) => r.id === report.id);
    setSelectedReport(report);
    setShowReportModal(true);
    if (reportIndex !== -1) {
      setScrollToIndex(reportIndex);
    }
  };

  // Deep linking logic
  useEffect(() => {
    if (reportId && reports.length > 0 && !loading) {
      const reportIndex = reports.findIndex((report) => report.id === reportId);
      if (reportIndex !== -1) {
        const report = reports[reportIndex];
        setSelectedReport(report);
        setScrollToIndex(reportIndex);

        setTimeout(() => {
          setShowReportModal(true);
        }, 250);
      }
    }
  }, [reportId, reports, loading]);

  return {
    reports,
    loading,
    error,
    refreshing,
    onRefresh,
    handleReportDelete,
    showReportModal,
    selectedReport,
    scrollToIndex,
    handleModalClose,
    handleDetailsPress,
    fetchReports, // Exposed for useFocusEffect
  };
}
