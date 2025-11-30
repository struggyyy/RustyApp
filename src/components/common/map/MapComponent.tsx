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

// External libraries
import { ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

// Internal imports
import { useLayout } from "@/core/context/LayoutContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import colors from "@/core/theme/colors";
import spacing from "@/core/theme/spacing";
import styled from "styled-components/native";

const StyledMapView = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});

// Placeholder view for loading and error states
const MapPlaceholderView = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.secondary,
});

const LoadingMapText = styled.Text({
  marginTop: spacing.S,
  color: colors.text.primary,
  fontSize: 14,
});

const MapErrorText = styled.Text({
  color: colors.primary,
  fontSize: 14,
  textAlign: "center",
  padding: spacing.M,
});

export interface MapComponentProps {
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  mapRef: React.RefObject<MapView | null>;
  onLocationErrorAction?: () => void; // Configurable action for location error
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
}

// Generic map component with configurable error handling
export function MapComponent({
  location,
  isLocationLoading,
  mapRef,
  region,
  children,
}: MapComponentProps) {
  const { t } = useTranslation();

  const { setMapReady } = useLayout();

  // Signal map readiness based on location loading state
  React.useEffect(() => {
    if (!isLocationLoading) {
      setMapReady(true);
    } else {
      setMapReady(false);
    }
  }, [isLocationLoading, setMapReady]);

  // Only show full-screen loader if we don't have a region to show yet
  // This prevents the map from flickering to a gray box during background refreshes
  if (isLocationLoading && !region) {
    return (
      <MapPlaceholderView>
        <ActivityIndicator size="large" color={colors.primary} />
        <LoadingMapText>{t("map.loadingMapData")}</LoadingMapText>
      </MapPlaceholderView>
    );
  }

  if (!region) {
    return (
      <MapPlaceholderView>
        <MapErrorText>{t("map.locationError")}</MapErrorText>
      </MapPlaceholderView>
    );
  }

  return (
    <StyledMapView
      provider={PROVIDER_GOOGLE}
      ref={mapRef}
      region={region}
      showsUserLocation={!!location}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapReady={() => {
        // Double check readiness on map load
        if (!isLocationLoading) {
          setMapReady(true);
        }
      }}
    >
      {children}
    </StyledMapView>
  );
}
