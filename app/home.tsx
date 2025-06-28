import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Pressable, StatusBar, Dimensions, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../src/theme/colors';
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Styled Components Definitions
const StyledContainer = styled.View({
  flex: 1,
  backgroundColor: '#FFFFFF',
});

const LoadingIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
});

const ContentView = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: 24,
  },
})({
  flex: 1,
});

const ScoreSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const ScoreLabelText = styled.Text({
  fontSize: 12,
  color: '#656565',
  fontWeight: '500',
});

const ScoreValueText = styled.Text({
  fontSize: 24,
  fontWeight: 'bold',
  color: '#BD5151',
});

const CarImageCard = styled.View<{ isWeb?: boolean }>((props: { isWeb?: boolean }) => ({
  width: '100%',
  aspectRatio: 1.3,
  backgroundColor: '#F5F5F5',
  borderRadius: 24,
  marginBottom: 24,
  overflow: 'hidden',
  // shadowMuted
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 1.00,
  elevation: 1,
  ...(props.isWeb && { // webCarCard
    maxWidth: 600,
    alignSelf: 'center',
  }),
}));

const CarDisplayImage = styled.Image({
  width: '100%',
  height: '100%',
});

const ReportButtonTouchable = styled.TouchableOpacity<{ isWeb?: boolean }>((props: { isWeb?: boolean }) => ({
  backgroundColor: '#BD5151',
  borderRadius: 16,
  padding: 16,
  alignItems: 'center',
  marginBottom: 24,
  // shadowDefault
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4,
  ...(props.isWeb && { // webReportButton
    maxWidth: 600,
    alignSelf: 'center',
  }),
}));

const ReportButtonLabel = styled.Text({
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: 'bold',
});

const MyReportsButton = styled.TouchableOpacity({
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  zIndex: 3,
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4,
});

const MyReportsButtonText = styled.Text`
  color: #656565;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
`;

const MapSection = styled.View<{ isWeb?: boolean }>((props: { isWeb?: boolean }) => ({
  height: height * 0.33,
  borderRadius: 24,
  overflow: 'hidden',
  backgroundColor: '#F5F5F5',
  position: 'relative',
  ...(props.isWeb && { // webMapContainer
    maxWidth: 1200, // Example max width, adjust as needed
    alignSelf: 'center',
  }),
}));

const MapTitleTouchable = styled.TouchableOpacity({
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  zIndex: 3,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  // shadowDefault
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4,
});

const MapTitleText = styled.Text({
  fontSize: 18,
  fontWeight: 'bold',
  color: '#656565',
  textAlign: 'center',
});

const MapWrapperView = styled.View({
  flex: 1,
  overflow: 'hidden',
  borderRadius: 16, // This was applied to mapPlaceholder and map before, now to wrapper
  backgroundColor: '#EFEFEF', // Moved from mapPlaceholder
});

const StyledMapView = styled(MapView)({
  flex: 1,
  width: '100%',
  height: '100%',
});

const MapPlaceholderView = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  // backgroundColor: '#EFEFEF', // Moved to MapWrapperView
  // borderRadius: 16, // Moved to MapWrapperView
});

const LoadingMapText = styled.Text({
  marginTop: 10,
  color: '#656565',
  fontSize: 14,
});

const MapErrorText = styled.Text({
  color: '#BD5151',
  fontSize: 14,
  textAlign: 'center',
  padding: 20,
});

const MapPlaceholderInfoText = styled.Text({
  color: '#656565',
  textAlign: 'center',
  padding: 20,
});

const FallbackWarningView = styled.View({
  position: 'absolute',
  top: 10,
  left: 10,
  backgroundColor: 'rgba(189, 81, 81, 0.7)',
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 5,
  zIndex: 2,
});

const FallbackWarningText = styled.Text({
  color: 'white',
  fontSize: 12,
  fontWeight: 'bold',
});

const MyLocationButtonTouchable = styled.TouchableOpacity({
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: 10,
  borderRadius: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,
  elevation: 3,
  zIndex: 3,
});

const MyLocationButtonLabel = styled.Text({
  fontSize: 20,
});

const InsetShadowGradientView = styled(LinearGradient)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: 15,
  zIndex: 2,
  // borderRadius: 16, // Applied to MapWrapperView now for the effect
});

const ProfileButtonView = styled.View({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#D9D9D9',
  justifyContent: 'center',
  alignItems: 'center',
});

const ProfileUserImage = styled.Image({
  width: '100%',
  height: '100%',
  borderRadius: 24,
});

const ProfileImagePlaceholder = styled.View({
  width: '100%',
  height: '100%',
  borderRadius: 24,
  backgroundColor: '#D9D9D9',
  justifyContent: 'center',
  alignItems: 'center',
});

const ProfileImagePlaceholderText = styled.Text({
  color: '#656565',
  fontSize: 20,
  fontWeight: 'bold',
});



const getFallbackLocation = () => ({
  coords: {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  },
  timestamp: Date.now()
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
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocation = useCallback(async () => {
    setIsLocationLoading(true);
    setLocationErrorMsg(null);
    setFallbackUsed(false);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }
      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
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
      setLocationErrorMsg(error.message || 'Failed to get location');
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocation();
    setRefreshing(false);
  }, [fetchLocation]);

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
            Map showing location at: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </MapPlaceholderInfoText>
        </MapPlaceholderView>
      );
    }

    return (
      <StyledMapView
        ref={mapRef}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
          pinColor="#BD5151"
        />
      </StyledMapView>
    );
  };

  if (initialLoading) {
    return (
        <LoadingIndicatorContainer>
            <ActivityIndicator size="large" color="#BD5151" />
        </LoadingIndicatorContainer>
    );
  }

  if (!user) {
    return (
        <LoadingIndicatorContainer>
            <Text>Redirecting...</Text>
        </LoadingIndicatorContainer>
    );
  }

  return (
    <StyledContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: 'Rusty',
        }}
      />
      <ContentView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
    >
        <ScoreSection>
          <View>
            <ScoreLabelText>COMMUNITY SCORE</ScoreLabelText>
            <ScoreValueText>1100</ScoreValueText>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} disabled={!user}>
            <ProfileButtonView>
              {profile?.profileImage || user?.photoURL ? (
                <ProfileUserImage source={{ uri: profile?.profileImage || user?.photoURL || undefined }} />
              ) : (
                <ProfileImagePlaceholder>
                  <ProfileImagePlaceholderText>{user?.email?.[0]?.toUpperCase() || '?'}</ProfileImagePlaceholderText>
                </ProfileImagePlaceholder>
              )}
            </ProfileButtonView>
          </TouchableOpacity>
        </ScoreSection>

        <CarImageCard isWeb={isWeb}>
          <CarDisplayImage
            source={require('../assets/images/car-image.png')}
            resizeMode="cover"
          />
        </CarImageCard>

        <ReportButtonTouchable
          isWeb={isWeb}
          onPress={() => router.push('/report')}
        >
          <ReportButtonLabel>REPORT A CAR</ReportButtonLabel>
        </ReportButtonTouchable>

        <MapSection isWeb={isWeb}>
          <MyReportsButton onPress={() => router.push('/my-reports')}>
            <MyReportsButtonText>MY REPORTS</MyReportsButtonText>
          </MyReportsButton>
          <MapWrapperView>
            {renderMap()}
            <InsetShadowGradientView
                colors={['rgba(0,0,0,0.15)', 'transparent']}
                pointerEvents="none"
            />
            {!isWeb && location && (
                 <MyLocationButtonTouchable
                    onPress={goToMyLocation}
                >
                    <MyLocationButtonLabel>🎯</MyLocationButtonLabel>
                </MyLocationButtonTouchable>
            )}
          </MapWrapperView>
        </MapSection>
      </ContentView>
    </StyledContainer>
  );
} 