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
import { useState, useCallback, useEffect } from "react";

// External libraries
import * as Location from "expo-location";
import { AppState, AppStateStatus } from "react-native";

// Internal imports
import { useTranslation } from "@/shared/hooks/common/useTranslation";

export interface UseLocationReturn {
  location: Location.LocationObject | null;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  fetchLocation: (forceRetry?: boolean) => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const { t } = useTranslation();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Fetch current location with permission handling
  const fetchLocation = useCallback(
    async (forceRetry = false) => {
      // Skip if we already have location and not forcing retry
      if (!forceRetry && location && !locationErrorMsg) {
        return;
      }

      setIsLocationLoading(true);
      setLocationErrorMsg(null);

      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationErrorMsg(t("map.locationPermissionRequired"));
          return;
        }

        // Get last known location first for performance
        let currentLocation = await Location.getLastKnownPositionAsync({});
        if (!currentLocation) {
          // Fallback to fresh location if no cached location
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        setLocation(currentLocation);
      } catch (error: any) {
        console.error("Location Error:", error.message);
        setLocationErrorMsg(error.message || t("map.locationError"));
      } finally {
        setIsLocationLoading(false);
      }
    },
    [location, locationErrorMsg, t]
  );

  // Retry location fetch when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        fetchLocation(true);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [fetchLocation]);

  // Initial location fetch
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    locationErrorMsg,
    isLocationLoading,
    fetchLocation,
  };
}
