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
import React, { useState, useRef, useCallback } from "react";

// External libraries
import { StatusBar, ActivityIndicator, RefreshControl } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import MapView, { Region } from "react-native-maps";

// Internal imports
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocation } from "@/hooks/useLocation";
import { useReports } from "@/hooks/useReports";
import { ScoreSection } from "@/components/features/home/ScoreSection";
import { CarImageCard } from "@/components/features/home/CarImageCard";
import { MapSection } from "@/components/features/home/MapSection";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import styled from "styled-components/native";
import StyledButton from "@/components/common/buttons/StyledButton";

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.primary,
});

const LoadingIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.background.primary,
});

const ContentView = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 20, // Adjust the bottom padding to modify the amount of "bounce effect" on the bottom of the screen
  },
  showsVerticalScrollIndicator: false, // Hide the vertical scroll indicator
})({
  flex: 1,
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
  const { t } = useTranslation();
  const { initialLoading } = useAuth();
  const router = useRouter();

  // Use extracted hooks for location and reports management
  const {
    location,
    locationErrorMsg,
    isLocationLoading,
    fallbackUsed,
    fetchLocation,
  } = useLocation();

  const { reports, fetchReports } = useReports();

  const mapRef = useRef<MapView>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch reports when component mounts or focuses
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

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

  const goToProfile = () => {
    router.push("/profile");
  };

  const goToReport = () => {
    router.push("/report");
  };

  const goToMyReports = () => {
    router.push("/my-reports");
  };

  const goToMap = () => {
    router.push("/map");
  };

  if (initialLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t("home.title") }} />
        <LoadingIndicatorContainer>
          <ActivityIndicator size="large" color="#BD5151" />
        </LoadingIndicatorContainer>
      </>
    );
  }

  return (
    <StyledContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: t("home.title") }} />
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
        <ScoreSection onProfilePress={goToProfile} />

        <CarImageCard />

        <StyledButton
          title={t("home.reportAbandonedVehicle")}
          onPress={goToReport}
        />

        <MapSection
          location={location}
          locationErrorMsg={locationErrorMsg}
          isLocationLoading={isLocationLoading}
          fallbackUsed={fallbackUsed}
          reports={reports}
          mapRef={mapRef}
          onGoToMyLocation={goToMyLocation}
          onExpandMap={goToMap}
          onMyReportsPress={goToMyReports}
        />
      </ContentView>
    </StyledContainer>
  );
}
