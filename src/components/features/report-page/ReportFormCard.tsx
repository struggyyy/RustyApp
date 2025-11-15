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
import styled from "styled-components/native";

// Internal imports
import { useTranslation } from "../../../shared/hooks/common/useTranslation";
import { useHaptics } from "../../../core/context/HapticsContext";
import colors from "../../../core/theme/colors";
import { typography, spacing } from "../../../core/theme";
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
  fontSize: typography.fontSize.body1,
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

// Main report form component combining description input and location map
export const ReportFormCard: React.FC<ReportFormCardProps> = ({
  description,
  onDescriptionChange,
  location,
  locationErrorMsg,
}) => {
  const { t } = useTranslation();
  const haptics = useHaptics();
  const mapRef = useRef<MapView>(null);

  // Convert location format for MapComponent compatibility
  const formattedLocation = location
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
    : null;

  // Handle map controls interaction
  const handleGoToMyLocation = () => {
    if (location && mapRef.current) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Render form with description input and interactive map
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
        onFocus={() => haptics.heavy()}
        multiline
        maxLength={150}
      />

      <MapContainer>
        <MapComponent
          location={formattedLocation}
          locationErrorMsg={locationErrorMsg}
          isLocationLoading={!location && !locationErrorMsg}
          mapRef={mapRef}
        />
        <MapControls
          location={formattedLocation}
          onGoToMyLocation={handleGoToMyLocation}
        />
      </MapContainer>
    </MainCard>
  );
};
