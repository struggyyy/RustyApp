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
import { useState, useCallback } from "react";

// External libraries
import { useFocusEffect } from "expo-router";

// Internal imports
import { Report as ReportType, ReportStatus } from "@/shared/types/reports";
import {
  getAllReports,
  updateReportStatus,
  deleteReport,
} from "@/lib/firebase/reports";

export function useReportManagement(isAdmin: boolean) {
  // Report data state
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all reports from database
  const fetchAllReports = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError(null);
      const allReports = await getAllReports();
      setReports(allReports);
    } catch (err) {
      setError("Failed to fetch reports. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  // Load reports when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        setLoading(true);
        fetchAllReports();
      }
    }, [fetchAllReports, isAdmin])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    if (isAdmin) {
      setRefreshing(true);
      fetchAllReports();
    }
  }, [fetchAllReports, isAdmin]);

  // Delete report and update local state
  const handleReportDelete = async (deletedReportId: string) => {
    try {
      const reportToDelete = reports.find(
        (report) => report.id === deletedReportId
      );
      if (reportToDelete) {
        await deleteReport(deletedReportId, reportToDelete.imageUrl);
      }
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== deletedReportId)
      );
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // Update report status and sync local state
  const handleStatusChange = async (
    reportId: string,
    newStatus: ReportStatus
  ) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        await updateReportStatus(
          reportId,
          report.userId,
          report.status,
          newStatus,
          report.imageUrl
        );
      }
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  return {
    reports,
    loading,
    error,
    refreshing,
    onRefresh,
    handleReportDelete,
    handleStatusChange,
  };
}
