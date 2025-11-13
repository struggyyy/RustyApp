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

  const fetchLocation = useCallback(
    async (forceRetry = false) => {
      // If we're not forcing a retry and already have location, don't refetch
      if (!forceRetry && location && !locationErrorMsg) {
        return;
      }

      setIsLocationLoading(true);
      setLocationErrorMsg(null);

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationErrorMsg(t("map.locationPermissionRequired"));
          return;
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
        setLocationErrorMsg(error.message || t("map.locationError"));
      } finally {
        setIsLocationLoading(false);
      }
    },
    [location, locationErrorMsg, t]
  );

  // Add AppState listener to retry location when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App became active, retry location fetch
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
