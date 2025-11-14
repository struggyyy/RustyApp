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
import { useState, useRef, useCallback, useEffect } from "react";

// External libraries
import MapView, { Region } from "react-native-maps";

// Internal imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import { useLocation } from "../common/useLocation";
import { Report } from "../../../shared/types/reports";
import {
  getDistance,
  openNavigation as openExternalNavigation,
} from "../../../shared/utils/map";

// Shared map logic hook for both regular map and admin map functionality
export const useMapLogic = () => {
  const { t } = useTranslation();

  // Use the robust location hook instead of duplicating logic
  const {
    location,
    locationErrorMsg,
    isLocationLoading,
    fetchLocation: fetchLocationFromHook,
  } = useLocation();

  const mapRef = useRef<MapView | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);

  // Use ref to store stable reference to fetchLocation function
  const fetchLocationRef = useRef(fetchLocationFromHook);

  // Update the ref whenever fetchLocationFromHook changes
  useEffect(() => {
    fetchLocationRef.current = fetchLocationFromHook;
  }, [fetchLocationFromHook]);

  // Location fetching logic - stable wrapper that always fetches (force retry)
  const fetchLocation = useCallback(async () => {
    // Use the ref to call the current fetchLocation function
    await fetchLocationRef.current(true);
  }, []); // Empty dependency array - function never changes

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
