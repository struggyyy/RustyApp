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
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Internal imports
import { useTranslation } from "@/hooks/useTranslation";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import styled from "styled-components/native";
import TouchableButton from "@/components/common/buttons/TouchableButton";
import { Report } from "@/types/reports";

const StyledMapView = styled(MapView)({
  flex: 1,
  width: "100%",
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

const MapPlaceholderInfoText = styled.Text({
  color: colors.text.primary,
  textAlign: "center",
  padding: spacing.md,
});

const FallbackWarningView = styled.View({
  position: "absolute",
  top: spacing.sm,
  left: spacing.sm,
  backgroundColor: colors.primaryTransparent,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: spacing.radius.sm,
  zIndex: 2,
});

const FallbackWarningText = styled.Text({
  color: colors.text.light,
  fontSize: 12,
  fontWeight: "bold",
});

interface MapComponentProps {
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  fallbackUsed: boolean;
  reports: Report[];
  mapRef: React.RefObject<MapView | null>;
}

export function MapComponent({
  location,
  locationErrorMsg,
  isLocationLoading,
  fallbackUsed,
  reports,
  mapRef,
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

  // Web fallback
  if (typeof window !== "undefined" && !location.coords) {
    return (
      <MapPlaceholderView>
        {fallbackUsed && (
          <FallbackWarningView>
            <FallbackWarningText>
              {t("map.currentLocation")}
            </FallbackWarningText>
          </FallbackWarningView>
        )}
        <MapPlaceholderInfoText>
          Map showing location at: {location.coords.latitude.toFixed(4)},{" "}
          {location.coords.longitude.toFixed(4)}
        </MapPlaceholderInfoText>
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
      {reports.map((report) => (
        <Marker
          key={report.id}
          coordinate={{
            latitude: report.location.latitude,
            longitude: report.location.longitude,
          }}
          pinColor={colors.primary}
        />
      ))}
    </StyledMapView>
  );
}
