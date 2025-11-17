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
import { MapComponent } from "./MapComponent";
import { MapControls } from "./MapControls";
import theme from "../../../core/theme";

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  pinColor?: string;
  onPress?: () => void;
}

export interface SharedMapViewProps {
  markers?: MarkerData[];
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  mapRef: React.RefObject<MapView | null>;
  onGoToMyLocation: () => void;
  onLocationErrorAction?: () => void;
  showControls?: boolean;
  showGradient?: boolean;
  containerStyle?: any;
}

// Generic map view component with customizable markers and controls
export const SharedMapView: React.FC<SharedMapViewProps> = ({
  markers = [],
  location,
  locationErrorMsg,
  isLocationLoading,
  mapRef,
  onGoToMyLocation,
  onLocationErrorAction,
  showControls = true,
  showGradient = true,
  containerStyle = { flex: 1, borderRadius: 24, overflow: "hidden" },
}) => {
  const haptics = useHaptics();

  return (
    <View style={containerStyle}>
      <MapComponent
        location={location}
        locationErrorMsg={locationErrorMsg}
        isLocationLoading={isLocationLoading}
        mapRef={mapRef}
        onLocationErrorAction={onLocationErrorAction}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            pinColor={marker.pinColor || theme.colors.primary}
            title={marker.title}
            description={marker.description}
            onPress={marker.onPress}
          />
        ))}
      </MapComponent>
      {showGradient && (
        <LinearGradient
          colors={[theme.colors.shadow, "transparent"]}
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
