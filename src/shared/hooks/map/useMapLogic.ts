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
import { useState, useRef, useCallback } from "react";

// External libraries
import * as Location from "expo-location";
import MapView, { Region } from "react-native-maps";

// Internal imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import { Report } from "../../../shared/types/reports";
import {
  getDistance,
  openNavigation as openExternalNavigation,
} from "../../../shared/utils/map";

// Shared map logic hook for both regular map and admin map functionality
export const useMapLogic = () => {
  const { t } = useTranslation();

  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const mapRef = useRef<MapView | null>(null);

  // Modal state
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
  }, [t]);

  // Map interaction handlers
  const goToMyLocation = useCallback(() => {
    if (location && mapRef.current) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [location]);

  // External navigation handler
  const openNavigation = useCallback(async () => {
    if (selectedReports[currentReportIndex]) {
      const { latitude, longitude } =
        selectedReports[currentReportIndex].location;
      await openExternalNavigation(latitude, longitude);
    }
  }, [selectedReports, currentReportIndex]);

  // Modal navigation handlers
  const goToPrev = useCallback(() => {
    setCurrentReportIndex((prev) =>
      prev > 0 ? prev - 1 : selectedReports.length - 1
    );
  }, [selectedReports.length]);

  const goToNext = useCallback(() => {
    setCurrentReportIndex((prev) =>
      prev < selectedReports.length - 1 ? prev + 1 : 0
    );
  }, [selectedReports.length]);

  // Handle marker press with report grouping
  const handleMarkerPress = useCallback(
    (report: Report, allReports: Report[]) => {
      const reportsAtLocation = allReports.filter(
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
    },
    []
  );

  return {
    // State
    location,
    locationErrorMsg,
    isLocationLoading,
    mapRef,
    modalVisible,
    selectedReports,
    currentReportIndex,

    // Actions
    fetchLocation,
    goToMyLocation,
    openNavigation,
    goToPrev,
    goToNext,
    handleMarkerPress,

    // Modal controls
    setModalVisible,
    setSelectedReports,
    setCurrentReportIndex,
  };
};
