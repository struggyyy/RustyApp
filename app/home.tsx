import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Pressable, StatusBar, Dimensions, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

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
  const { user, session } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        if (isWeb) {
          setLocation(getFallbackLocation());
          setFallbackUsed(true);
        }
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const renderMap = () => {
    if (errorMsg && !location) {
      return (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      );
    }

    if (!location) {
      return (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      );
    }

    if (isWeb) {
      return (
        <View style={styles.mapPlaceholder}>
          {fallbackUsed && (
            <View style={styles.fallbackWarning}>
              <Text style={styles.fallbackText}>Using demo location</Text>
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
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
        />
      </MapView>
    );
  };

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
              >
                <View style={styles.profileButtonContainer}>
                  {user?.user_metadata?.avatar_url ? (
                    <Image
                      source={{ uri: user.user_metadata.avatar_url }}
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
        {/* Community Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>COMMUNITY SCORE</Text>
          <Text style={styles.scoreValue}>1100</Text>
        </View>

        {/* Car Image Card */}
        <View style={[styles.carCard, isWeb && styles.webCarCard]}>
          <View style={styles.carImagePlaceholder}>
            <Text style={styles.placeholderText}>Car Image</Text>
          </View>
        </View>

        {/* Report Button */}
        <TouchableOpacity 
          style={[styles.reportButton, isWeb && styles.webReportButton]}
          onPress={() => router.push('/report')}
        >
          <Text style={styles.reportButtonText}>REPORT A CAR</Text>
        </TouchableOpacity>

        {/* Map Section */}
        <View style={[styles.mapContainer, isWeb && styles.webMapContainer]}>
          <View style={styles.mapTitleContainer}>
            <Text style={styles.mapTitle}>YOUR REPORTS</Text>
          </View>
          <View style={styles.mapWrapper}>
            {renderMap()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 0,
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
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
  carImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
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
  },
  mapTitleContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#656565',
    textAlign: 'center',
  },
  placeholderText: {
    color: '#656565',
    textAlign: 'center',
  },
  loadingText: {
    color: '#656565',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#BD5151',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
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
    backgroundColor: '#F5F5F5',
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
  profileButtonContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
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
}); 