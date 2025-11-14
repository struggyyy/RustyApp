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
import React, { useRef } from "react";

// External libraries
import MapView from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import styled from "styled-components/native";

// Internal imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import colors from "../../../core/theme/colors";
import spacing from "../../../core/theme/spacing";
import { MapComponent } from "../../common/map/MapComponent";
import { MapControls } from "../../common/map/MapControls";

// Styled components
const MainCard = styled.View({
  width: "100%",
  backgroundColor: colors.background.secondary,
  borderRadius: spacing.radius.XL,
  overflow: "hidden",
});

const DescriptionInput = styled.TextInput({
  padding: spacing.M,
  fontSize: 16,
  color: colors.text.primary,
  textAlignVertical: "top",
});

const InsetShadowGradientView = styled(LinearGradient)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: spacing.S,
  zIndex: 2,
});

const MapContainer = styled.View({
  height: 240,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.secondary,
  borderTopLeftRadius: spacing.radius.XL,
  borderTopRightRadius: spacing.radius.XL,
  overflow: "hidden",
});

// Component props interface
interface ReportFormCardProps {
  description: string;
  onDescriptionChange: (text: string) => void;
  location: { latitude: number; longitude: number } | null;
  locationErrorMsg: string | null;
}

export const ReportFormCard: React.FC<ReportFormCardProps> = ({
  description,
  onDescriptionChange,
  location,
  locationErrorMsg,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  // Form input and map display
  return (
    <MainCard>
      <InsetShadowGradientView
        colors={[colors.shadow, "transparent"]}
        pointerEvents="none"
      />
      <DescriptionInput
        placeholder={t("reports.vehicleDescription")}
        placeholderTextColor={colors.text.primary}
        value={description}
        onChangeText={onDescriptionChange}
        onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
        multiline
        maxLength={150}
      />

      <MapContainer>
        <MapComponent
          location={
            location
              ? {
                  coords: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    altitude: null,
                    accuracy: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                  },
                  timestamp: Date.now(),
                }
              : null
          }
          locationErrorMsg={locationErrorMsg}
          isLocationLoading={!location && !locationErrorMsg}
          mapRef={mapRef}
        />
        <MapControls
          location={
            location
              ? {
                  coords: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    altitude: null,
                    accuracy: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                  },
                  timestamp: Date.now(),
                }
              : null
          }
          onGoToMyLocation={() => {
            if (location && mapRef.current) {
              const region = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.005,
              };
              mapRef.current.animateToRegion(region, 1000);
            }
          }}
        />
      </MapContainer>
    </MainCard>
  );
};
