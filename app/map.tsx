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

// External libraries
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { ScrollView, RefreshControl } from "react-native";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { getReportsByUserId } from "../src/lib/firebase/reports";
import { Report } from "../src/shared/types/reports";
import MapReportModal from "../src/components/common/modals/MapReportModal";
import { SharedMapView } from "../src/components/common/map/SharedMapView";
import { useMapLogic } from "../src/shared/hooks/map/useMapLogic";
import { useMapRegion } from "../src/shared/hooks/map/useMapRegion";
import colors from "../src/core/theme/colors";
import spacing from "../src/core/theme/spacing";
import styled from "styled-components/native";

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: colors.background.primary,
  padding: spacing.L,
});

const MapSection = styled.View({
  flex: 1,
  borderRadius: spacing.radius.XL,
  overflow: "hidden",
  backgroundColor: colors.background.secondary,
  position: "relative",
});

const MapWrapperView = styled.View({
  flex: 1,
  overflow: "hidden",
  borderRadius: spacing.radius.M,
  backgroundColor: colors.background.primary,
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);

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
    await Promise.all([
      fetchLocation(),
      fetchReports(),
    ]);
    setRefreshing(false);
  };
  const fetchReports = async () => {
    if (user) {
      try {
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Fetch reports on mount and focus
  useEffect(() => {
    fetchReports();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
    }, [user])
  );

  // Modal navigation handlers
  const viewReport = () => {
    if (selectedReports[currentReportIndex]) {
      setModalVisible(false);
      router.push(
        `/my-reports?reportId=${selectedReports[currentReportIndex].id}`
      );
    }
  };

  // Main component render
  return (
    <StyledContainer>
      <MapSection>
        <MapWrapperView>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
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
                onPress: () => handleMarkerPress(report, reports),
              }))}
              location={location}
              locationErrorMsg={locationErrorMsg}
              isLocationLoading={isLocationLoading}
              mapRef={mapRef}
              onGoToMyLocation={goToMyLocation}
              region={mapRegion}
            />
          </ScrollView>
        </MapWrapperView>
      </MapSection>
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
    </StyledContainer>
  );
}
