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
import { useTranslation } from "@/hooks/useTranslation";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import styled from "styled-components/native";
import { StyleSheet } from "react-native";
import TouchableButton from "@/components/common/buttons/TouchableButton";
import { MapComponent } from "@/components/common/map/MapComponent";
import { MapControls } from "@/components/common/map/MapControls";
import { Report } from "@/types/reports";

const { height } = Dimensions.get("window");

const MapSectionContainer = styled.View({
  height: height * 0.33,
  borderRadius: spacing.radius.lg,
  overflow: "hidden",
  backgroundColor: colors.componentBackground,
  position: "relative",
});

const MyReportsButton = styled(TouchableButton)({
  position: "absolute",
  top: spacing.md,
  left: spacing.md,
  right: spacing.md,
  zIndex: 3,
  backgroundColor: colors.background.primary,
  padding: spacing.md,
  borderRadius: spacing.radius.md,
});

const MyReportsButtonText = styled.Text({
  color: colors.text.primary,
  fontWeight: "bold",
  fontSize: 18,
  textAlign: "center",
});

const MapWrapperView = styled.View({
  flex: 1,
  overflow: "hidden",
  borderRadius: spacing.radius.md,
  backgroundColor: colors.background.tertiary,
});

const InsetShadowGradientView = styled(LinearGradient)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: spacing.md - 1, // 15px
  zIndex: 2,
});

const shadowStyles = StyleSheet.create({
  shadowSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
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
}

export function MapSection({
  location,
  locationErrorMsg,
  isLocationLoading,
  reports,
  mapRef,
  onGoToMyLocation,
  onExpandMap,
  onMyReportsPress,
}: MapSectionProps) {
  const { t } = useTranslation();

  return (
    <MapSectionContainer>
      {reports.length > 0 && (
        <MyReportsButton
          onPress={onMyReportsPress}
          style={shadowStyles.shadowSmall}
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
        </MapComponent>
        <InsetShadowGradientView
          colors={["rgba(0,0,0,0.15)", "transparent"]}
          pointerEvents="none"
        />
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
