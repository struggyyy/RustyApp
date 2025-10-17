import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import * as Location from "expo-location";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../src/theme/colors";
import styled from "styled-components/native";
import { MaterialIcons } from "@expo/vector-icons";
import { getReportsByUserId } from "../src/services/firebase/reports";
import { Report } from "../src/types/reports";
import * as Linking from "expo-linking";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: "#FFFFFF",
  padding: 24,
});

const MapSection = styled.View<{ isWeb?: boolean }>(
  (props: { isWeb?: boolean }) => ({
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    position: "relative",
    ...(props.isWeb && {
      // webMapContainer
      maxWidth: 1200, // Example max width, adjust as needed
      alignSelf: "center",
    }),
  })
);

const MapWrapperView = styled.View({
  flex: 1,
  overflow: "hidden",
  borderRadius: 16, // This was applied to mapPlaceholder and map before, now to wrapper
  backgroundColor: "#EFEFEF", // Moved from mapPlaceholder
});

const StyledMapView = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});

const MapPlaceholderView = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  // backgroundColor: '#EFEFEF', // Moved to MapWrapperView
  // borderRadius: 16, // Moved to MapWrapperView
});

const LoadingMapText = styled.Text({
  marginTop: 10,
  color: "#656565",
  fontSize: 14,
});

const MapErrorText = styled.Text({
  color: "#BD5151",
  fontSize: 14,
  textAlign: "center",
  padding: 20,
});

const MapPlaceholderInfoText = styled.Text({
  color: "#656565",
  textAlign: "center",
  padding: 20,
});

const FallbackWarningView = styled.View({
  position: "absolute",
  top: 10,
  left: 10,
  backgroundColor: "rgba(189, 81, 81, 0.7)",
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 5,
  zIndex: 2,
});

const FallbackWarningText = styled.Text({
  color: "white",
  fontSize: 12,
  fontWeight: "bold",
});

const MyLocationButtonTouchable = styled.TouchableOpacity({
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: 10,
  borderRadius: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
  elevation: 3,
  zIndex: 3,
});

const NavigationButtonTouchable = styled.TouchableOpacity({
  position: "absolute",
  bottom: 80,
  right: 20,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: 10,
  borderRadius: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
  elevation: 3,
  zIndex: 3,
});

const InsetShadowGradientView = styled(LinearGradient)({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 15,
  zIndex: 2,
  // borderRadius: 16, // Applied to MapWrapperView now for the effect
});

const getFallbackLocation = () => ({
  coords: {
    latitude: 40.7128,
    longitude: -74.006,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

export default function MapScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "All My Reports" }} />
      <MapScreenComponent />
    </>
  );
}

function MapScreenComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchLocation = useCallback(async () => {
    setIsLocationLoading(true);
    setLocationErrorMsg(null);
    setFallbackUsed(false);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }
      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
      setLocation(currentLocation);
    } catch (error: any) {
      console.error("Location Error:", error.message);
      if (isWeb) {
        setLocation(getFallbackLocation());
        setFallbackUsed(true);
      } else {
        setLocation(null);
      }
      setLocationErrorMsg(error.message || "Failed to get location");
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
    if (user) {
      getReportsByUserId(user.uid)
        .then(setReports)
        .catch((err) => console.error("Failed to fetch reports:", err));
    }
  }, [fetchLocation, user]);

  const goToMyLocation = () => {
    if (location && mapRef.current) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const openNavigation = () => {
    if (selectedReport) {
      const { latitude, longitude } = selectedReport.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const renderMap = () => {
    if (isLocationLoading) {
      return (
        <MapPlaceholderView>
          <ActivityIndicator size="large" color="#BD5151" />
          <LoadingMapText>Loading map data...</LoadingMapText>
        </MapPlaceholderView>
      );
    }
    if (locationErrorMsg && !location) {
      return (
        <MapPlaceholderView>
          <MapErrorText>{locationErrorMsg}</MapErrorText>
        </MapPlaceholderView>
      );
    }
    if (!location) {
      return (
        <MapPlaceholderView>
          <MapErrorText>Could not load map location.</MapErrorText>
        </MapPlaceholderView>
      );
    }

    if (isWeb) {
      return (
        <MapPlaceholderView>
          {fallbackUsed && (
            <FallbackWarningView>
              <FallbackWarningText>Using Demo Location</FallbackWarningText>
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
            title="Reported Car"
            description={report.description}
            pinColor={colors.primary}
            onPress={() => setSelectedReport(report)}
          />
        ))}
      </StyledMapView>
    );
  };

  return (
    <StyledContainer>
      <MapSection isWeb={isWeb}>
        <MapWrapperView>
          {renderMap()}
          <InsetShadowGradientView
            colors={["rgba(0,0,0,0.15)", "transparent"]}
            pointerEvents="none"
          />
          {!isWeb && location && (
            <>
              {selectedReport && (
                <NavigationButtonTouchable onPress={openNavigation}>
                  <MaterialIcons
                    name="navigation"
                    size={24}
                    color="#1565C0"
                  />
                </NavigationButtonTouchable>
              )}
              <MyLocationButtonTouchable onPress={goToMyLocation}>
                <MaterialIcons
                  name="my-location"
                  size={24}
                  color={colors.primary}
                />
              </MyLocationButtonTouchable>
            </>
          )}
        </MapWrapperView>
      </MapSection>
    </StyledContainer>
  );
}
