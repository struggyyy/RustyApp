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
import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";

// External libraries
import { Stack, useRouter, useFocusEffect } from "expo-router";

// Internal imports
import { useHaptics } from "@context/HapticsContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useReports } from "@/shared/hooks/reports/useReports";
import { useMapLogic } from "@/shared/hooks/map/useMapLogic";
import { useMapRegion } from "@/shared/hooks/map/useMapRegion";
import MapReportModal from "@components/common/modals/MapReportModal";
import { SharedMapView } from "@components/common/map/SharedMapView";
import colors from "@theme/colors";
import spacing from "@theme/spacing";

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.L,
  },
  mapSection: {
    flex: 1,
    borderRadius: spacing.radius.XL,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
    position: "relative",
  },
  mapWrapper: {
    flex: 1,
    overflow: "hidden",
    borderRadius: spacing.radius.M,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
});

export default function MapScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t("map.title") }} />
      <MapScreenComponent />
    </>
  );
}

function MapScreenComponent() {
  const router = useRouter();
  const { heavy } = useHaptics();

  // Reports state using shared hook
  const { reports, fetchReports } = useReports();

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
  const mapRegion = useMapRegion(location, reports);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLocation(), fetchReports()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Fetch reports on mount and focus
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
    }, [fetchReports]),
  );

  // Modal navigation handlers
  const viewReport = () => {
    if (selectedReports[currentReportIndex]) {
      setModalVisible(false);
      router.push(
        `/my-reports?reportId=${selectedReports[currentReportIndex].id}`,
      );
    }
  };

  // Main component render
  return (
    <View style={styles.container}>
      <View style={styles.mapSection}>
        <View style={styles.mapWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <SharedMapView
              markers={reports.map((report) => ({
                id: report.id,
                latitude: report.location.latitude,
                longitude: report.location.longitude,
                pinColor: colors.primary,
                onPress: () => {
                  heavy();
                  handleMarkerPress(report, reports);
                },
              }))}
              location={location}
              locationErrorMsg={locationErrorMsg}
              isLocationLoading={isLocationLoading}
              mapRef={mapRef}
              onGoToMyLocation={goToMyLocation}
              region={mapRegion}
            />
          </ScrollView>
        </View>
      </View>
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
  );
}
