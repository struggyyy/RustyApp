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
import React from "react";
import { View } from "react-native";

// External libraries
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

// Internal imports
import { useHaptics } from "../../../core/context/HapticsContext";
import { Report } from "../../../shared/types/reports";
import { MapComponent } from "./MapComponent";
import { MapControls } from "./MapControls";
import theme from "../../../core/theme";

interface SharedMapViewProps {
  reports: Report[];
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  mapRef: React.RefObject<MapView | null>;
  onGoToMyLocation: () => void;
  onMarkerPress: (report: Report) => void;
  showControls?: boolean;
  showGradient?: boolean;
}

// Shared map view component for consistent map rendering across the app
export const SharedMapView: React.FC<SharedMapViewProps> = ({
  reports,
  location,
  locationErrorMsg,
  isLocationLoading,
  mapRef,
  onGoToMyLocation,
  onMarkerPress,
  showControls = true,
  showGradient = true,
}) => {
  const haptics = useHaptics();

  return (
    <View style={{ flex: 1, borderRadius: 24, overflow: "hidden" }}>
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
            pinColor={theme.colors.primary}
            onPress={() => {
              haptics.heavy();
              onMarkerPress(report);
            }}
          />
        ))}
      </MapComponent>
      {showGradient && (
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "transparent"]}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 40,
            zIndex: 2,
          }}
        />
      )}
      {showControls && (
        <MapControls location={location} onGoToMyLocation={onGoToMyLocation} />
      )}
    </View>
  );
};
