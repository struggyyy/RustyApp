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
import { useState, useEffect } from "react";

// External libraries
import { LocationObject } from "expo-location";

// Internal imports
import { Report } from "@/shared/types/reports";

// Default fallback coordinates (Cracow, Poland) ;)
const FALLBACK_REGION = {
  latitude: 50.061799,
  longitude: 19.938274,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Custom hook to manage map region based on location and reports
export const useMapRegion = (
  location: LocationObject | null,
  reports: Report[],
) => {
  // State for the map region, initialized to default fallback coordinates
  const [mapRegion, setMapRegion] = useState<
    | {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }
    | undefined
  >(FALLBACK_REGION);

  // Effect to update region when location or reports change
  useEffect(() => {
    if (location) {
      // If user location is available, center on it
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01,
      });
    } else if (reports.length > 0) {
      // If no location but reports exist, randomly select a report location
      const randomReport = reports[Math.floor(Math.random() * reports.length)];
      setMapRegion({
        latitude: randomReport.location.latitude,
        longitude: randomReport.location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
    // No else: fallback is handled by delayed effect below
  }, [location, reports]);

  // Delayed fallback to Cracow if no location and no reports after 1 second
  useEffect(() => {
    if (!location && reports.length === 0) {
      const timer = setTimeout(() => {
        setMapRegion(FALLBACK_REGION);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, reports]);

  return mapRegion;
};
