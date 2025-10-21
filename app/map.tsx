import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
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
import ReportModal from "../src/components/common/ReportModal";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

// Helper function to calculate distance between two coordinates in meters
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: "#FFFFFF",
  padding: 24,
});

const MapSection = styled.View({
  flex: 1,
  borderRadius: 24,
  overflow: "hidden",
  backgroundColor: "#F5F5F5",
  position: "relative",
});

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);

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

  const fetchReports = useCallback(async () => {
    if (user) {
      try {
        const userReports = await getReportsByUserId(user.uid);
        setReports(userReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const goToMyLocation = () => {
    if (location && mapRef.current) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const openNavigation = () => {
    if (selectedReports[currentReportIndex]) {
      const { latitude, longitude } =
        selectedReports[currentReportIndex].location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const viewReport = () => {
    if (selectedReports[currentReportIndex]) {
      setModalVisible(false);
      router.push(
        `/my-reports?reportId=${selectedReports[currentReportIndex].id}`
      );
    }
  };

  const goToPrev = () => {
    setCurrentReportIndex((prev) =>
      prev > 0 ? prev - 1 : selectedReports.length - 1
    );
  };

  const goToNext = () => {
    setCurrentReportIndex((prev) =>
      prev < selectedReports.length - 1 ? prev + 1 : 0
    );
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
            pinColor={colors.primary}
            onPress={() => {
              const reportsAtLocation = reports.filter(
                (r) =>
                  getDistance(
                    r.location.latitude,
                    r.location.longitude,
                    report.location.latitude,
                    report.location.longitude
                  ) <= 50
              );
              setSelectedReports(reportsAtLocation);
              setCurrentReportIndex(reportsAtLocation.indexOf(report));
              setModalVisible(true);
            }}
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
            <MyLocationButtonTouchable style={shadowStyles.shadowMedium} onPress={goToMyLocation}>
              <MaterialIcons
                name="my-location"
                size={24}
                color={colors.primary}
              />
            </MyLocationButtonTouchable>
          )}
        </MapWrapperView>
      </MapSection>
      <ReportModal
        visible={modalVisible}
        report={selectedReports[currentReportIndex] || null}
        onClose={() => setModalVisible(false)}
        onNavigate={openNavigation}
        onViewReport={viewReport}
        onPrev={goToPrev}
        onNext={goToNext}
        hasMultiple={selectedReports.length > 1}
      />
    </StyledContainer>
  );
}
