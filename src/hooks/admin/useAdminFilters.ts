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
import { useState, useEffect, useCallback } from "react";

// External libraries
import * as Location from "expo-location";

// Internal imports
import { Report as ReportType, ReportStatus } from "../../types/reports";
import { useAuth } from "../../context/AuthContext";

export function useAdminFilters(reports: ReportType[]) {
  const { profile, updateUserProfile } = useAuth();

  // Filter state
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(5);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [filteredReports, setFilteredReports] = useState<ReportType[]>([]);

  // Load saved preferences
  useEffect(() => {
    if (profile?.adminPreferences) {
      const { selectedStatuses: savedStatuses, maxDistance: savedDistance } =
        profile.adminPreferences;
      if (savedStatuses && savedStatuses.length > 0) {
        setSelectedStatuses(savedStatuses);
      }
      if (savedDistance !== undefined && savedDistance !== null) {
        setMaxDistance(savedDistance);
      }
    }
  }, [profile]);

  // Request user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...reports];

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((report) =>
        selectedStatuses.includes(report.status)
      );
    }

    if (maxDistance !== null && userLocation && !locationLoading) {
      filtered = filtered.filter((report) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.location.latitude,
          report.location.longitude
        );
        return distance <= maxDistance;
      });
    }

    setFilteredReports(filtered);
  }, [reports, selectedStatuses, maxDistance, userLocation, locationLoading]);

  // Save preferences
  const savePreferences = useCallback(
    async (statuses: ReportStatus[], distance: number | null) => {
      try {
        await updateUserProfile({
          adminPreferences: {
            selectedStatuses: statuses,
            maxDistance: distance ?? undefined,
          },
        });
      } catch (error) {
        console.error("Failed to save admin preferences:", error);
      }
    },
    [updateUserProfile]
  );

  // Handlers
  const handleStatusFilterChange = useCallback(
    (statuses: ReportStatus[]) => {
      setSelectedStatuses(statuses);
      savePreferences(statuses, maxDistance);
    },
    [savePreferences, maxDistance]
  );

  const handleDistanceFilterChange = useCallback(
    (distance: number | null) => {
      setMaxDistance(distance);
      savePreferences(selectedStatuses, distance);
    },
    [savePreferences, selectedStatuses]
  );

  return {
    selectedStatuses,
    maxDistance,
    locationLoading,
    filteredReports,
    handleStatusFilterChange,
    handleDistanceFilterChange,
  };
}
