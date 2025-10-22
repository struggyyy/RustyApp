import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  AppState,
  AppStateStatus,
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
import StyledButton from "../src/components/common/StyledButton";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  shadowMuted: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  shadowSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: "#FFFFFF",
});

const LoadingIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
});

const ContentView = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20, // Adjust the bottom padding to modify the ammount of "bounce effect" on the bottom of the screen
  },
  showsVerticalScrollIndicator: false, // Hide the vertical scroll indicator
})({
  flex: 1,
});

const ScoreSection = styled.View({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
});

const ScoreLabelText = styled.Text({
  fontSize: 12,
  color: "#656565",
  fontWeight: "500",
});

const ScoreValueText = styled.Text({
  fontSize: 24,
  fontWeight: "bold",
  color: "#BD5151",
});

const CarImageCard = styled.View({
  width: "100%",
  aspectRatio: 1.3,
  backgroundColor: "#F5F5F5",
  borderRadius: 24,
  marginBottom: 24,
  overflow: "hidden",
});

const CarDisplayImage = styled.Image({
  width: "100%",
  height: "100%",
});

const MyReportsButton = styled.TouchableOpacity({
  position: "absolute",
  top: 16,
  left: 16,
  right: 16,
  zIndex: 3,
  backgroundColor: "#FFFFFF",
  padding: 16,
  borderRadius: 16,
});

const MyReportsButtonText = styled.Text({
  color: "#656565",
  fontWeight: "bold",
  fontSize: 18,
  textAlign: "center",
});

const MapSection = styled.View({
  height: height * 0.33,
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

const ExpandButtonTouchable = styled.TouchableOpacity({
  position: "absolute",
  bottom: 20,
  left: 20,
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

const ProfileButtonView = styled.View({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#D9D9D9",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 4,
  borderColor: colors.primary,
});

const ProfileUserImage = styled.Image({
  width: "100%",
  height: "100%",
  borderRadius: 28,
});

const ProfileImagePlaceholder = styled.View({
  width: "100%",
  height: "100%",
  borderRadius: 28,
  backgroundColor: "#D9D9D9",
  justifyContent: "center",
  alignItems: "center",
});

const ProfileImagePlaceholderText = styled.Text({
  color: "#656565",
  fontSize: 20,
  fontWeight: "bold",
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

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ headerBackVisible: false }} />
      <HomeScreenComponent />
    </>
  );
}

function HomeScreenComponent() {
  const { user, profile, initialLoading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [waitingForPermissions, setWaitingForPermissions] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchLocation = useCallback(async (forceRetry = false) => {
    // If we're not forcing a retry and already have location, don't refetch
    if (!forceRetry && location && !locationErrorMsg) {
      return;
    }

    setIsLocationLoading(true);
    setLocationErrorMsg(null);
    setFallbackUsed(false);
    setWaitingForPermissions(false);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setWaitingForPermissions(true);
        setLocationErrorMsg("Location permission is required to show your location on the map. Please enable location services and pull to refresh.");
        return;
      }

      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      setLocation(currentLocation);
      setWaitingForPermissions(false);
    } catch (error: any) {
      console.error("Location Error:", error.message);
      if (isWeb) {
        setLocation(getFallbackLocation());
        setFallbackUsed(true);
      } else {
        setWaitingForPermissions(true);
        setLocationErrorMsg("Current location is unavailable. Make sure that location services are enabled.");
      }
    } finally {
      setIsLocationLoading(false);
    }
  }, [location, locationErrorMsg, isWeb]);

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

  // Add AppState listener to retry location when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && waitingForPermissions) {
        // App became active and we were waiting for permissions, retry location
        fetchLocation(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [waitingForPermissions, fetchLocation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchLocation(true), // Force retry location
      fetchReports(),
    ]);
    setRefreshing(false);
  }, [fetchLocation, fetchReports]);

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
          {waitingForPermissions && (
            <TouchableOpacity
              onPress={() => fetchLocation(true)}
              style={{ marginTop: 10, padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Try Again</Text>
            </TouchableOpacity>
          )}
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
          />
        ))}
      </StyledMapView>
    );
  };

  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Rusty" }} />
        <LoadingIndicatorContainer>
          <ActivityIndicator size="large" color="#BD5151" />
        </LoadingIndicatorContainer>
      </>
    );
  }

  return (
    <StyledContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: "Home" }} />
      <ContentView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <ScoreSection>
          <View>
            <ScoreLabelText>YOUR COMMUNITY SCORE</ScoreLabelText>
            <ScoreValueText>{profile?.points ?? 0}</ScoreValueText>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            disabled={!user}
          >
            <ProfileButtonView>
              {profile?.profileImage || user?.photoURL ? (
                <ProfileUserImage
                  source={{
                    uri: profile?.profileImage || user?.photoURL || undefined,
                  }}
                />
              ) : (
                <ProfileImagePlaceholder>
                  <ProfileImagePlaceholderText>
                    {user?.email?.[0]?.toUpperCase() || "?"}
                  </ProfileImagePlaceholderText>
                </ProfileImagePlaceholder>
              )}
            </ProfileButtonView>
          </TouchableOpacity>
        </ScoreSection>

        <CarImageCard style={shadowStyles.shadowMuted}>
          <CarDisplayImage
            source={require("../assets/images/car-image.png")}
            resizeMode="cover"
          />
        </CarImageCard>

        <StyledButton
          title="REPORT A CAR"
          onPress={() => router.push("/report")}
        />

        <MapSection>
          <MyReportsButton style={shadowStyles.shadowSmall} onPress={() => router.push("/my-reports")}>
            <MyReportsButtonText>MY REPORTS</MyReportsButtonText>
          </MyReportsButton>
          <MapWrapperView>
            {renderMap()}
            <InsetShadowGradientView
              colors={["rgba(0,0,0,0.15)", "transparent"]}
              pointerEvents="none"
            />
            {!isWeb && location && (
              <>
                <MyLocationButtonTouchable style={shadowStyles.shadowMedium} onPress={goToMyLocation}>
                  <MaterialIcons
                    name="my-location"
                    size={24}
                    color={colors.primary}
                  />
                </MyLocationButtonTouchable>
                <ExpandButtonTouchable style={shadowStyles.shadowMedium} onPress={() => router.push("/map")}>
                  <MaterialIcons
                    name="fullscreen"
                    size={24}
                    color={colors.primary}
                  />
                </ExpandButtonTouchable>
              </>
            )}
          </MapWrapperView>
        </MapSection>
      </ContentView>
    </StyledContainer>
  );
}
