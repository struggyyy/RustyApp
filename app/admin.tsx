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
import { useAuth } from "@context/AuthContext";
import { useLayout } from "@context/LayoutContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAdminFilters } from "@/shared/hooks/admin/useAdminFilters";
import { useReportManagement } from "@/shared/hooks/admin/useReportManagement";
import { useAdminDeepLinking } from "@/shared/hooks/admin/useAdminDeepLinking";
import { Report as ReportType, ReportStatus } from "@/shared/types/reports";
import FilterPanel from "@components/features/admin/filter-panel/FilterPanel";
import AdminReportModal from "@components/features/admin/modals/AdminReportModal";
import AdminMapView from "@components/features/admin/dashboard/AdminMapView";
import AdminListView from "@components/features/admin/dashboard/AdminListView";
import theme from "@theme/index";
import { getStatusColor } from "@theme/colors";

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

// Admin dashboard with conditional map/list view
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
  const [showMapView, setShowMapView] = useState(false);

  // State for loading and filter expansion
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, router]);

  const { setAdminDataReady } = useLayout();

  // Signal admin data readiness
  useEffect(() => {
    if (!loading) {
      setAdminDataReady(true);
    } else {
      setAdminDataReady(false);
    }
  }, [loading, setAdminDataReady]);

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

  // Handle deep linking for admin reports
  useAdminDeepLinking({
    reports,
    loading,
    onOpenReport: handleDetailsPress,
  });

  // Navigation handler
  const handleProfilePress = () => {
    router.push("/admin-profile");
  };

  // Handle map/list view toggle with loading animation
  const handleMapPress = () => {
    if (!showMapView) {
      setIsMapLoading(true);
      // Start prerendering the map immediately
      setTimeout(() => {
        setIsMapLoading(false);
      }, 600); // Show loading for 600ms while map prerenders
    }
    setShowMapView(!showMapView);
  };

  // Handle filter panel expansion changes with loading
  const handleFilterExpansionChange = (expanded: boolean) => {
    if (showMapView) {
      setIsFilterLoading(true);
      setIsFilterExpanded(expanded);
      // Show loading for animation duration
      setTimeout(() => {
        setIsFilterLoading(false);
      }, 300); // Match typical animation duration
    } else {
      setIsFilterExpanded(expanded);
    }
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
          onMap={handleMapPress}
          isMapView={showMapView}
          isExpanded={isFilterExpanded}
          onExpandedChange={handleFilterExpansionChange}
        />
        <View
          style={[
            styles.dashboardWrapper,
            !showMapView && theme.shadows.modal,
            showMapView && { borderRadius: 24, overflow: "hidden" },
          ]}
        >
          <View
            style={[
              styles.dashboardContainer,
              showMapView && {
                borderRadius: 0,
                backgroundColor: "transparent",
                padding: 0,
                overflow: "hidden",
              },
            ]}
          >
            {showMapView ? (
              <AdminMapView
                filteredReports={filteredReports}
                onViewReport={handleDetailsPress}
                isLoading={isMapLoading || isFilterLoading}
              />
            ) : (
              <AdminListView
                reports={filteredReports}
                loading={loading || locationLoading}
                error={error}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onDelete={handleReportDelete}
                onStatusChange={handleStatusChange}
                onDetailsPress={handleDetailsPress}
              />
            )}
          </View>
        </View>

        {/* Admin report modal for detailed report management */}
        <Modal
          key={showReportModal ? "visible" : "hidden"}
          visible={showReportModal}
          transparent
          animationType="fade"
        >
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
