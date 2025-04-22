import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Pressable, StatusBar, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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

export default function Home() {
  const { user, profile, initialLoading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
        setIsLocationLoading(true);
        setLocationErrorMsg(null);
        setFallbackUsed(false);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            if (isMounted) setLocation(currentLocation);
        } catch (error: any) {
             console.error("Location Error:", error.message);
             if (isMounted) {
                 setLocationErrorMsg(error.message || 'Failed to get location');
                 if (isWeb) {
                     setLocation(getFallbackLocation());
                     setFallbackUsed(true);
                 } else {
                     setLocation(null);
                 }
             }
        } finally {
            if (isMounted) setIsLocationLoading(false);
        }
    })();
    return () => { isMounted = false; };
  }, []);

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
            <View style={styles.mapPlaceholder}>
                <ActivityIndicator size="large" color="#BD5151" />
                <Text style={styles.loadingText}>Loading map data...</Text>
            </View>
        );
    }
    if (locationErrorMsg && !location) {
      return (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.errorText}>{locationErrorMsg}</Text>
        </View>
      );
    }
    if (!location) {
        return (
            <View style={styles.mapPlaceholder}>
                <Text style={styles.errorText}>Could not load map location.</Text>
            </View>
        );
    }

    if (isWeb) {
      return (
        <View style={styles.mapPlaceholder}>
          {fallbackUsed && (
            <View style={styles.fallbackWarning}>
              <Text style={styles.fallbackText}>Using Demo Location</Text>
            </View>
          )}
          <Text style={styles.placeholderText}>
            Map showing location at: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
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
      </MapView>
    );
  };

  if (initialLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#BD5151" />
        </View>
    );
  }

  if (!user) {
    return (
        <View style={styles.loadingContainer}>
            <Text>Redirecting...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Rusty</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed
                ]}
                onPress={() => {
                  console.log('Profile button pressed');
                  router.push('/profile');
                }}
                disabled={!user}
              >
                <View style={styles.profileButtonContainer}>
                  {profile?.profileImage || user?.photoURL ? (
                    <Image
                      source={{ uri: profile?.profileImage || user?.photoURL || undefined}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Text style={styles.profilePlaceholderText}>
                        {user?.email?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>COMMUNITY SCORE</Text>
          <Text style={styles.scoreValue}>1100</Text>
        </View>

        <View style={[styles.carCard, styles.shadowMuted, isWeb && styles.webCarCard]}>
          <Image 
            source={require('../assets/images/CAR.png')} 
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>

        <TouchableOpacity 
          style={[styles.reportButton, styles.shadowDefault, isWeb && styles.webReportButton]}
          onPress={() => router.push('/report')}
        >
          <Text style={styles.reportButtonText}>REPORT A CAR</Text>
        </TouchableOpacity>

        <View style={[styles.mapContainer, isWeb && styles.webMapContainer]}>
          <TouchableOpacity 
            style={[styles.mapTitleContainer, styles.shadowDefault]} 
            onPress={() => router.push('/my-reports')}
            activeOpacity={0.7}
          >
            <Text style={styles.mapTitle}>YOUR REPORTS</Text>
          </TouchableOpacity>
          <View style={styles.mapWrapper}>
            {renderMap()}
            <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent']}
                style={styles.insetShadowGradient}
                pointerEvents="none"
            />
            {!isWeb && location && (
                 <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={goToMyLocation}
                >
                    <Text style={styles.myLocationButtonText}>🎯</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#656565',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  profileButtonContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    color: '#656565',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scoreContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#656565',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#BD5151',
  },
  carCard: {
    width: '100%', 
    aspectRatio: 1.2,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  webCarCard: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  reportButton: {
    backgroundColor: '#BD5151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  webReportButton: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  webMapContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
  },
  mapWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
  },
  mapTitleContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#656565',
    textAlign: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 16,
  },
  loadingText: {
      marginTop: 10,
      color: '#656565',
      fontSize: 14,
  },
  errorText: {
    color: '#BD5151',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#656565',
    textAlign: 'center',
    padding: 20,
  },
  fallbackWarning: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(189, 81, 81, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  fallbackText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  myLocationButton: {
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
  },
  myLocationButtonText: {
      fontSize: 20,
  },
  shadowMuted: {
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  shadowDefault: {
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  insetShadowGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 15,
      zIndex: 2,
      borderRadius: 16,
  },
}); 