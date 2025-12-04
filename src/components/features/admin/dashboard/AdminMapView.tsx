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
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";

// Internal imports
import { SharedMapView } from "@components/common/map/SharedMapView";
import MapReportModal from "@components/common/modals/MapReportModal";
import { useMapLogic } from "@/shared/hooks/map/useMapLogic";
import { useMapRegion } from "@/shared/hooks/map/useMapRegion";
import { Report as ReportType } from "@/shared/types/reports";
import theme from "@theme/index";
import { useTranslation } from "@/shared/hooks/common/useTranslation";

interface AdminMapViewProps {
  filteredReports: ReportType[];
  onViewReport: (report: ReportType) => void;
  isLoading?: boolean;
}

export default function AdminMapView({
  filteredReports,
  onViewReport,
  isLoading = false,
}: AdminMapViewProps) {
  const { t } = useTranslation();
  const [isMapLoading, setIsMapLoading] = useState(true);

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

  // State for map region to handle dynamic updates
  const mapRegion = useMapRegion(location, filteredReports);

  // Initial map loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Fetch location on mount
  useEffect(() => {
    if (!location && !locationErrorMsg) {
      fetchLocation();
    }
  }, [location, locationErrorMsg, fetchLocation]);

  const handleMapRefresh = async () => {
    await fetchLocation();
  };

  // Handle view report from modal
  const handleViewReport = () => {
    if (selectedReports[currentReportIndex]) {
      setModalVisible(false);
      onViewReport(selectedReports[currentReportIndex]);
    }
  };

  return (
    <>
      {/* Map View Container */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLocationLoading}
            onRefresh={handleMapRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
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
          region={mapRegion}
        />
      </ScrollView>

      {(isMapLoading || isLoading) && (
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
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

      <MapReportModal
        visible={modalVisible}
        report={selectedReports[currentReportIndex] || null}
        onClose={() => setModalVisible(false)}
        onNavigate={openNavigation}
        onViewReport={handleViewReport}
        onPrev={goToPrev}
        onNext={goToNext}
        hasMultiple={selectedReports.length > 1}
      />
    </>
  );
}
