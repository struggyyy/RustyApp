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
import { AppState, AppStateStatus, Platform } from "react-native";

// Internal imports
import { useTranslation } from "@/hooks/useTranslation";

const isWeb = Platform.OS === "web";

const getFallbackLocation = () => ({
  coords: {
    latitude: 40.7128,
    longitude: -74.006,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

export interface UseLocationReturn {
  location: Location.LocationObject | null;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  fallbackUsed: boolean;
  waitingForPermissions: boolean;
  fetchLocation: (forceRetry?: boolean) => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const { t } = useTranslation();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [waitingForPermissions, setWaitingForPermissions] = useState(false);

  const fetchLocation = useCallback(
    async (forceRetry = false) => {
      // If we're not forcing a retry and already have location, don't refetch
      if (!forceRetry && location && !locationErrorMsg) {
        return;
      }

      setIsLocationLoading(true);
      setLocationErrorMsg(null);
      setFallbackUsed(false);
      setWaitingForPermissions(false);

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setWaitingForPermissions(true);
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
        setWaitingForPermissions(false);
      } catch (error: any) {
        console.error("Location Error:", error.message);
        if (isWeb) {
          setLocation(getFallbackLocation());
          setFallbackUsed(true);
        } else {
          setWaitingForPermissions(true);
          setLocationErrorMsg(t("map.locationError"));
        }
      } finally {
        setIsLocationLoading(false);
      }
    },
    [location, locationErrorMsg, t]
  );

  // Add AppState listener to retry location when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && waitingForPermissions) {
        // App became active and we were waiting for permissions, retry location
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
  }, [waitingForPermissions, fetchLocation]);

  // Initial location fetch
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    locationErrorMsg,
    isLocationLoading,
    fallbackUsed,
    waitingForPermissions,
    fetchLocation,
  };
}
