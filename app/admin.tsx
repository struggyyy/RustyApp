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
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal } from "react-native";

// External libraries
import { Stack, useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { useAdminFilters } from "../src/shared/hooks/admin/useAdminFilters";
import { useReportManagement } from "../src/shared/hooks/admin/useReportManagement";
import { Report as ReportType, ReportStatus } from "../src/shared/types/reports";
import ReportList from "../src/components/features/reports-page/ReportList";
import FilterPanel from "../src/components/features/admin/FilterPanel";
import AdminReportModal from "../src/components/features/admin/AdminReportModal";
import theme from "../src/core/theme";
import { getStatusColor } from "../src/core/theme/colors";

// Styles for layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dashboardWrapper: {
    flex: 1,
    borderRadius: 24,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 24,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 24,
    maxHeight: "95%",
  },
});


export default function AdminDashboard() {
  // Context hooks
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { reportId } = useLocalSearchParams();

  // Report management hook
  const {
    reports,
    loading,
    error,
    refreshing,
    onRefresh,
    handleReportDelete,
    handleStatusChange,
  } = useReportManagement(isAdmin);

  // Filter management hook
  const {
    selectedStatuses,
    maxDistance,
    locationLoading,
    filteredReports,
    handleStatusFilterChange,
    handleDistanceFilterChange,
  } = useAdminFilters(reports);

  // Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  // Track processed report IDs to prevent duplicate modal opens
  const [processedReportId, setProcessedReportId] = useState<string | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, router]);

  // Handle deep linking to specific report from notification
  useEffect(() => {
    const normalizedReportId = Array.isArray(reportId) ? reportId[0] : reportId;
    if (normalizedReportId && reports.length > 0 && !loading && normalizedReportId !== processedReportId) {
      const report = reports.find((r) => r.id === normalizedReportId);
      if (report) {
        setSelectedReport(report);
        setShowReportModal(true);
        setProcessedReportId(normalizedReportId);
        // Clear URL param after opening the modal with a small delay
        setTimeout(() => {
          router.setParams({});
        }, 100);
      }
    }
  }, [reportId, reports, loading, router, processedReportId]);

  // Modal handlers
  const handleModalClose = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const handleModalStatusUpdate = async (newStatus: ReportStatus) => {
    if (selectedReport) {
      await handleStatusChange(selectedReport.id, newStatus);
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  const handleModalDelete = async () => {
    if (selectedReport) {
      await handleReportDelete(selectedReport.id);
      handleModalClose();
    }
  };

  const handleDetailsPress = (report: ReportType) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleProfilePress = () => {
    router.push("/admin-profile");
  };

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: t("admin.title") }} />
      <View style={styles.container}>
        <FilterPanel
          selectedStatuses={selectedStatuses}
          onStatusesChange={handleStatusFilterChange}
          maxDistance={maxDistance}
          onDistanceChange={handleDistanceFilterChange}
          onProfile={handleProfilePress}
        />
        <View style={[styles.dashboardWrapper, theme.shadows.modal]}>
          <View style={styles.dashboardContainer}>
            <ReportList
              reports={filteredReports}
              loading={loading || locationLoading}
              error={error}
              refreshing={refreshing}
              isAdmin={true}
              onRefresh={onRefresh}
              onDelete={handleReportDelete}
              onStatusChange={handleStatusChange}
              loadingText={t("admin.loading")}
              emptyText={t("admin.noReports")}
              onDetailsPress={handleDetailsPress}
            />
          </View>
        </View>

        <Modal key={showReportModal ? 'visible' : 'hidden'} visible={showReportModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, theme.shadows.modal]}>
              {selectedReport && (
                <AdminReportModal
                  report={selectedReport}
                  statusColor={getStatusColor(selectedReport.status)}
                  onClose={handleModalClose}
                  onStatusUpdate={handleModalStatusUpdate}
                  onDelete={handleModalDelete}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
