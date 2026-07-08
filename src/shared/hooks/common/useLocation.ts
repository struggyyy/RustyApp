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
    null,
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
        // Check current permission status without prompting
        const currentPermissions =
          await Location.getForegroundPermissionsAsync();

        let permissionGranted = false;

        if (currentPermissions.status === "granted") {
          permissionGranted = true;
        } else if (currentPermissions.status === "denied") {
          if (!forceRetry) {
            setLocation(null); // Clear location when denied
            setLocationErrorMsg(t("map.locationPermissionDenied"));
            return;
          }
          // Force retry: request permissions again
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setLocation(null); // Clear location if still denied
            setLocationErrorMsg(t("map.locationPermissionRequired"));
            return;
          }
          permissionGranted = true;
        } else {
          // Undetermined: request permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setLocation(null); // Clear location if denied
            setLocationErrorMsg(t("map.locationPermissionRequired"));
            return;
          }
          permissionGranted = true;
        }

        if (!permissionGranted) {
          // This shouldn't happen, but just in case
          setLocationErrorMsg(t("map.locationPermissionRequired"));
          return;
        }

        // Short delay to allow system to update after permission grant
        await new Promise((resolve) => setTimeout(resolve, 500));

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
        setLocation(null); // Clear location on error
        if (
          error.message &&
          error.message.includes("unsatisfied device settings")
        ) {
          setLocationErrorMsg(t("map.locationServicesDisabled"));
        } else {
          console.error("Location Error:", error.message);
          setLocationErrorMsg(error.message || t("map.locationError"));
        }
      } finally {
        setIsLocationLoading(false);
      }
    },
    [location, t],
  );

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
