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
import { Stack, useRouter } from "expo-router";

// Internal imports
import { useAuth } from "../src/context/AuthContext";
import { useTranslation } from "../src/hooks/useTranslation";
import { useAdminFilters } from "../src/hooks/admin/useAdminFilters";
import { useReportManagement } from "../src/hooks/admin/useReportManagement";
import { Report as ReportType, ReportStatus } from "../src/types/reports";
import ReportList from "../src/components/features/reports/ReportList";
import FilterPanel from "../src/components/features/admin/FilterPanel";
import AdminReportModal from "../src/components/features/admin/AdminReportModal";
import theme from "../src/theme";
import { getStatusColor } from "../src/theme/colors";

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
    backgroundColor: theme.colors.componentBackground,
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

// Shadow styles
const shadowStyles = StyleSheet.create({
  modalShadow: {
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default function AdminDashboard() {
  // Context hooks
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

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

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, router]);

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
        <View style={[styles.dashboardWrapper, shadowStyles.modalShadow]}>
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

        <Modal visible={showReportModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, shadowStyles.modalShadow]}>
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
