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
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";

// Internal imports
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import colors from "@/core/theme/colors";
import spacing from "@/core/theme/spacing";
import typography from "@/core/theme/typography";
import styled from "styled-components/native";
import theme from "@/core/theme";
import TouchableButton from "@/components/common/buttons/TouchableButton";
import { MapComponent } from "@/components/common/map/MapComponent";
import { MapControls } from "@/components/common/map/MapControls";
import { Report } from "@/shared/types/reports";

const { height } = Dimensions.get("window");

const MapSectionContainer = styled.View({
  height: height * spacing.layout.mapSectionHeightRatio,
  borderRadius: spacing.radius.XL,
  overflow: "hidden",
  backgroundColor: colors.background.secondary,
  position: "relative",
});

const MyReportsButton = styled(TouchableButton)({
  position: "absolute",
  top: spacing.M,
  left: spacing.M,
  right: spacing.M,
  zIndex: 3,
  backgroundColor: colors.background.primary,
  padding: spacing.M,
  borderRadius: spacing.radius.M,
});

const MyReportsButtonText = styled.Text({
  color: colors.text.primary,
  fontWeight: "bold",
  fontSize: typography.fontSize.h5,
  textAlign: "center",
});

const MapWrapperView = styled.View({
  flex: 1,
  overflow: "hidden",
  borderRadius: spacing.radius.M,
  backgroundColor: colors.background.primary,
});

const InsetShadowGradientView = styled(LinearGradient)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: spacing.M,
  zIndex: 2,
});

interface MapSectionProps {
  location: any;
  locationErrorMsg: string | null;
  isLocationLoading: boolean;
  reports: Report[];
  mapRef: React.RefObject<MapView | null>;
  onGoToMyLocation: () => void;
  onExpandMap: () => void;
  onMyReportsPress: () => void;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

// Home screen map section displaying user's location, reports, and navigation controls
export function MapSection({
  location,
  locationErrorMsg,
  isLocationLoading,
  reports,
  mapRef,
  onGoToMyLocation,
  onExpandMap,
  onMyReportsPress,
  region,
}: MapSectionProps) {
  const { t } = useTranslation();

  return (
    <MapSectionContainer>
      {/* Conditionally show "My Reports" button when user has reports */}
      {reports.length > 0 && (
        <MyReportsButton
          onPress={onMyReportsPress}
          style={theme.shadows.button}
        >
          <MyReportsButtonText>{t("home.myReports")}</MyReportsButtonText>
        </MyReportsButton>
      )}
      <MapWrapperView>
        <MapComponent
          location={location}
          locationErrorMsg={locationErrorMsg}
          isLocationLoading={isLocationLoading}
          mapRef={mapRef}
          region={region}
        >
          {/* Render report markers on map */}
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
        </MapComponent>

        {/* Subtle gradient overlay for visual depth */}
        <InsetShadowGradientView
          colors={[colors.shadow, "transparent"]}
          pointerEvents="none"
        />

        {/* Map navigation controls */}
        <MapControls
          location={location}
          onGoToMyLocation={onGoToMyLocation}
          showExpandMap={true}
          onExpandMap={onExpandMap}
        />
      </MapWrapperView>
    </MapSectionContainer>
  );
}
