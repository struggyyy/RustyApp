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

// Internal imports
import { Report as ReportType, ReportStatus } from "../../types/reports";
import { useAuth } from "../../../core/context/AuthContext";
import { useLocation } from "../common/useLocation";
import { getDistance } from "../../utils/mapUtils";

export function useAdminFilters(reports: ReportType[]) {
  // Get user profile and location from hooks
  const { profile, updateUserProfile } = useAuth();
  const { location: currentLocation, isLocationLoading } = useLocation();

  // Filter state management
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(5);
  const [filteredReports, setFilteredReports] = useState<ReportType[]>([]);

  // Load saved filter preferences from user profile
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

  // Apply status and distance filters to reports
  useEffect(() => {
    let filtered = [...reports];

    // Filter by selected statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((report) =>
        selectedStatuses.includes(report.status)
      );
    }

    // Filter by distance from user location
    if (maxDistance !== null && currentLocation && !isLocationLoading) {
      filtered = filtered.filter((report) => {
        const distanceInMeters = getDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          report.location.latitude,
          report.location.longitude
        );
        // Convert meters to kilometers for comparison
        const distanceInKm = distanceInMeters / 1000;
        return distanceInKm <= maxDistance;
      });
    }

    setFilteredReports(filtered);
  }, [
    reports,
    selectedStatuses,
    maxDistance,
    currentLocation,
    isLocationLoading,
  ]);

  // Save filter preferences to user profile
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

  // Filter change handlers with preference persistence
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
    locationLoading: isLocationLoading,
    filteredReports,
    handleStatusFilterChange,
    handleDistanceFilterChange,
  };
}
