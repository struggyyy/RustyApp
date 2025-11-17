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
import { View, StyleSheet, Modal, ActivityIndicator, Text } from "react-native";

// External libraries
import { Stack, useRouter, useLocalSearchParams } from "expo-router";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { useAdminFilters } from "../src/shared/hooks/admin/useAdminFilters";
import { useReportManagement } from "../src/shared/hooks/admin/useReportManagement";
import {
  Report as ReportType,
  ReportStatus,
} from "../src/shared/types/reports";
import ReportList from "../src/components/features/reports-page/ReportList";
import FilterPanel from "../src/components/features/admin/filter-panel/FilterPanel";
import AdminReportModal from "../src/components/features/admin/modals/AdminReportModal";
import MapReportModal from "../src/components/common/modals/MapReportModal";
import { SharedMapView } from "../src/components/common/map/SharedMapView";
import { useMapLogic } from "../src/shared/hooks/map/useMapLogic";
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

// Admin dashboard with conditional map/list view
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
  const [showMapView, setShowMapView] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Shared map logic hook
  const {
    location,
    locationErrorMsg,
    isLocationLoading,
    mapRef,
    modalVisible,
    selectedReports,
    currentReportIndex,
    fetchLocation,
    goToMyLocation,
    openNavigation,
    goToPrev,
    goToNext,
    handleMarkerPress,
    setModalVisible,
  } = useMapLogic();

  // Track processed report IDs to prevent duplicate modal opens
  const [processedReportId, setProcessedReportId] = useState<string | null>(
    null
  );

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/home");
    }
  }, [isAdmin, router]);

  // Location fetching logic when map view is active
  useEffect(() => {
    if (showMapView && !location && !locationErrorMsg) {
      fetchLocation();
    }
  }, [showMapView, location, locationErrorMsg, fetchLocation]);

  // Handle deep linking to specific report from notification
  useEffect(() => {
    const normalizedReportId = Array.isArray(reportId) ? reportId[0] : reportId;
    if (
      normalizedReportId &&
      reports.length > 0 &&
      !loading &&
      normalizedReportId !== processedReportId
    ) {
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

  // Modal navigation handlers for admin map modal
  const viewReport = () => {
    if (selectedReports[currentReportIndex]) {
      // For admin users, open the admin report modal instead of navigating
      setModalVisible(false); // Close the map modal
      setSelectedReport(selectedReports[currentReportIndex]); // Set the selected report
      setShowReportModal(true); // Open admin modal
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
            theme.shadows.modal,
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
              <>
                {/* Always render the map underneath */}
                <SharedMapView
                  markers={filteredReports.map((report) => ({
                    id: report.id,
                    latitude: report.location.latitude,
                    longitude: report.location.longitude,
                    pinColor: theme.colors.primary,
                    onPress: () => handleMarkerPress(report, filteredReports),
                  }))}
                  location={location}
                  locationErrorMsg={locationErrorMsg}
                  isLocationLoading={isLocationLoading}
                  mapRef={mapRef}
                  onGoToMyLocation={goToMyLocation}
                />
                {(isMapLoading || isFilterLoading) && (
                  // Loading overlay on top of the prerendered map
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: theme.colors.background.secondary,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 3,
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: 16,
                        color: theme.colors.text.primary,
                        fontSize: 16,
                      }}
                    >
                      {t("admin.loading")}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Report list view
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

        {/* Map marker modal for quick report viewing */}
        <MapReportModal
          visible={modalVisible}
          report={selectedReports[currentReportIndex] || null}
          onClose={() => setModalVisible(false)}
          onNavigate={openNavigation}
          onViewReport={viewReport}
          onPrev={goToPrev}
          onNext={goToNext}
          hasMultiple={selectedReports.length > 1}
        />
      </View>
    </>
  );
}
