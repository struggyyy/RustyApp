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
import React, { useEffect, useState, useRef, useCallback } from "react";

// External libraries
import { Stack, useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { useHaptics } from "../src/core/context/HapticsContext";
import colors from "../src/core/theme/colors";
import spacing from "../src/core/theme/spacing";
import styled from "styled-components/native";
import { getReportsByUserId } from "../src/lib/firebase/reports";
import { Report } from "../src/shared/types/reports";
import ReportModal from "../src/components/common/modals/ReportModal";
import { MapComponent } from "../src/components/common/map/MapComponent";
import { MapControls } from "../src/components/common/map/MapControls";
import {
  getDistance,
  openNavigation as openExternalNavigation,
} from "../src/shared/utils/map";

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

const InsetShadowGradientView = styled(LinearGradient)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: spacing.M - 1,
  zIndex: 2,
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
  const haptics = useHaptics();

  // Location and loading state
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  // Reports and modal state
  const [reports, setReports] = useState<Report[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);

  // Location fetching logic
  const fetchLocation = useCallback(async () => {
    setIsLocationLoading(true);
    setLocationErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(t("map.locationPermissionRequired"));
      }
      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      setLocation(currentLocation);
    } catch (error: any) {
      console.error("Location Error:", error.message);
      setLocation(null);
      setLocationErrorMsg(error.message || t("map.locationError"));
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  // Reports fetching logic
  const fetchReports = useCallback(async () => {
    if (user) {
      try {
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  // Map interaction handlers
  const goToMyLocation = () => {
    if (location && mapRef.current) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // External navigation handler
  const openNavigation = async () => {
    if (selectedReports[currentReportIndex]) {
      const { latitude, longitude } =
        selectedReports[currentReportIndex].location;
      await openExternalNavigation(latitude, longitude);
    }
  };

  // Modal navigation handlers
  const viewReport = () => {
    if (selectedReports[currentReportIndex]) {
      setModalVisible(false);
      router.push(
        `/my-reports?reportId=${selectedReports[currentReportIndex].id}`
      );
    }
  };

  const goToPrev = () => {
    setCurrentReportIndex((prev) =>
      prev > 0 ? prev - 1 : selectedReports.length - 1
    );
  };

  const goToNext = () => {
    setCurrentReportIndex((prev) =>
      prev < selectedReports.length - 1 ? prev + 1 : 0
    );
  };

  // Map rendering logic
  const renderMap = () => {
    return (
      <MapComponent
        location={location}
        locationErrorMsg={locationErrorMsg}
        isLocationLoading={isLocationLoading}
        mapRef={mapRef}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.location.latitude,
              longitude: report.location.longitude,
            }}
            pinColor={colors.primary}
            onPress={() => {
              haptics.heavy();
              const reportsAtLocation = reports.filter(
                (r) =>
                  getDistance(
                    r.location.latitude,
                    r.location.longitude,
                    report.location.latitude,
                    report.location.longitude
                  ) <= 50
              );
              setSelectedReports(reportsAtLocation);
              setCurrentReportIndex(reportsAtLocation.indexOf(report));
              setModalVisible(true);
            }}
          />
        ))}
      </MapComponent>
    );
  };

  // Main component render
  return (
    <StyledContainer>
      <MapSection>
        <MapWrapperView>
          {renderMap()}
          <InsetShadowGradientView
            colors={["rgba(0,0,0,0.15)", "transparent"]}
            pointerEvents="none"
          />
          <MapControls location={location} onGoToMyLocation={goToMyLocation} />
        </MapWrapperView>
      </MapSection>
      <ReportModal
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
