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
import { Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

// Internal imports
import { useTranslation } from "@/hooks/useTranslation";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import styled from "styled-components/native";
import TouchableButton from "@/components/common/buttons/TouchableButton";

const StyledMapView = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});

const MapPlaceholderView = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.tertiary,
});

const LoadingMapText = styled.Text({
  marginTop: spacing.sm,
  color: colors.text.primary,
  fontSize: 14,
});

const MapErrorText = styled.Text({
  color: colors.primary,
  fontSize: 14,
  textAlign: "center",
  padding: spacing.md,
});

export interface MapComponentProps {
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  mapRef: React.RefObject<MapView | null>;
  children?: React.ReactNode; // Allow custom markers/content
}

export function MapComponent({
  location,
  locationErrorMsg,
  isLocationLoading,
  mapRef,
  children,
}: MapComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (isLocationLoading) {
    return (
      <MapPlaceholderView>
        <ActivityIndicator size="large" color={colors.primary} />
        <LoadingMapText>{t("common.loading")}</LoadingMapText>
      </MapPlaceholderView>
    );
  }

  if (locationErrorMsg && !location) {
    return (
      <MapPlaceholderView>
        <MapErrorText>{locationErrorMsg}</MapErrorText>
        <TouchableButton
          onPress={() => router.replace("/")}
          style={{
            marginTop: spacing.sm,
            padding: spacing.sm,
            backgroundColor: colors.primary,
            borderRadius: spacing.radius.sm,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.text.light,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {t("common.continue")}
          </Text>
        </TouchableButton>
      </MapPlaceholderView>
    );
  }

  if (!location) {
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
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {children}
    </StyledMapView>
  );
}
