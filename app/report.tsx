import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { createReport, uploadReportImage } from '../src/services/firebase/reports';
import theme from '../src/theme';
import StyledButton from '../src/components/common/StyledButton';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${theme.colors.background.primary};
`;

const InnerScrollView = styled(ScrollView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 10, // Increased padding to enhance bounce effect
  },
  keyboardShouldPersistTaps: 'handled',
  alwaysBounceVertical: true,
})`
  width: 100%;
`;

const TopContent = styled.View`
  align-items: center;
  width: 100%;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 20px;
  line-height: 20px;
`;

const ImagePreviewContainer = styled.View`
  width: 100%;
  aspect-ratio: 1.3;
  margin-bottom: 20px;
  border-radius: 16px;
  background-color: ${theme.colors.background.secondary};
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const ImagePreview = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImageOverlayActions = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
  flex-direction: row;
  z-index: 10;
`;

const ImageActionButton = styled.TouchableOpacity`
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  padding: 8px;
  margin-left: 10px;
`;

const MainCard = styled.View`
  width: 100%;
  background-color: ${theme.colors.background.secondary};
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const DescriptionInput = styled.TextInput`
  padding: 15px;
  font-size: 16px;
  color: ${theme.colors.text.primary};
  text-align-vertical: top;
`;

const InsetShadowGradientView = styled(LinearGradient)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: 15,
  zIndex: 2,
  // borderRadius: 16, // Applied to MapWrapperView now for the effect
});

const MapContainer = styled.View`
  height: 250px; /* Increased height */
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0; /* Placeholder color */
  border-top-left-radius: 24px; /* Rounded top corners */
  border-top-right-radius: 24px;
  overflow: hidden; /* Clip the map to the rounded corners */
`;

const StyledMapView = styled(MapView)`
  ${StyleSheet.absoluteFillObject}
`;

const MapErrorText = styled.Text`
  color: ${theme.colors.error.main};
`;

const BottomContent = styled.View`
  align-items: center;
  width: 100%;
  margin-top: auto;
`;

const MyLocationButtonTouchable = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 30px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.22;
  shadow-radius: 2.22px;
  elevation: 3;
  z-index: 3;
`;

const IconBar = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 60%;
  margin-bottom: 20px;
`;

const IconButton = styled.TouchableOpacity`
  background-color: ${theme.colors.background.secondary};
  padding: 12px;
  border-radius: 30px; /* Make it circular */
`;

export default function ReportScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const isSubmittingRef = useRef(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLocationErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }
      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }

      if (currentLocation) {
        const coords = { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude };
        setLocation(coords);
        setMapRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        });
      }
    } catch (error: any) {
      setLocationErrorMsg(error.message || 'Failed to get location');
      Alert.alert('Location Error', error.message || 'Could not fetch location. Please ensure location services are enabled.');
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getCurrentLocation();
    setIsRefreshing(false);
  }, [getCurrentLocation]);

    const handleCancelImage = () => {
    setImageUri(null);
  };

  const pickImage = async (useCamera: boolean) => {
    const action = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await action({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (!user || !imageUri || !location || !description) {
      Alert.alert('Incomplete Form', 'Please fill all fields, take a picture, and ensure location is set.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const reportId = `report_${Date.now()}`;
      const imageUrl = await uploadReportImage(imageUri, user.uid, reportId);

      await createReport({
        userId: user.uid,
        imageUrl,
        description,
        location,
      });

      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: () => router.replace('/my-reports') },
      ]);
    } catch (error) {
      console.error('Report submission error:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      // On failure, release the lock and reset the button to allow another attempt.
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const renderMapContent = () => {
    if (!mapRegion && !locationErrorMsg) {
      return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }
    if (locationErrorMsg) {
      return <MapErrorText>{locationErrorMsg}</MapErrorText>;
    }
    if (mapRegion) {
      return (
        <StyledMapView 
          ref={mapRef} 
          provider={PROVIDER_GOOGLE} 
          initialRegion={mapRegion} 
          showsUserLocation 
          showsMyLocationButton={false} 
        />
      );
    }
    return <MapErrorText>Initializing map...</MapErrorText>;
  };

  const isFormReady = !!imageUri && !!description.trim() && !!location;

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ title: 'Report a Car' }} />
      <InnerScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
      >
        <TopContent>
          <Title>SAVE THE ENVIRONMENT</Title>
          <Subtitle>
            By pointing out abandoned cars in your neighbourhood, you contribute to cleaner and safer surroundings.
          </Subtitle>
          {imageUri ? (
            !isKeyboardVisible && (
            <ImagePreviewContainer>
              <ImagePreview source={{ uri: imageUri }} />
              <ImageOverlayActions>
                {/* Select other image from the phone (currently disabled)
                <ImageActionButton onPress={() => pickImage(false)}>
                  <Ionicons name="create-outline" size={24} color="white" />
                </ImageActionButton> */} 
                <ImageActionButton onPress={handleCancelImage}>
                  <Ionicons name="close" size={24} color="white" />
                </ImageActionButton>
              </ImageOverlayActions>
            </ImagePreviewContainer>
          )
          ) : (
            <StyledButton title="TAKE A PICTURE" onPress={() => pickImage(true)} />
          )}
        </TopContent>

        <MainCard>
          
            <InsetShadowGradientView
                            colors={['rgba(0,0,0,0.15)', 'transparent']}
                            pointerEvents="none"
                        />
            <DescriptionInput
              placeholder="Description..."
              placeholderTextColor={theme.colors.text.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          
          <MapContainer>
            {renderMapContent()}
            <MyLocationButtonTouchable onPress={handleCenterMap}>
              <MaterialIcons name="my-location" size={24} color={theme.colors.primary} />
            </MyLocationButtonTouchable>
          </MapContainer>
        </MainCard>

        <BottomContent>
          <IconBar>
            <IconButton onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={24} color={theme.colors.text.secondary} />
            </IconButton>
            <IconButton onPress={handleCenterMap}>
              <Ionicons name="location-outline" size={24} color={theme.colors.text.secondary} />
            </IconButton>
            <IconButton onPress={() => pickImage(false)}>
              <Ionicons name="images-outline" size={24} color={theme.colors.text.secondary} />
            </IconButton>
          </IconBar>
          <StyledButton 
            title="SUBMIT"
            onPress={handleSubmit} 
            disabled={!isFormReady || isSubmitting}
            loading={isSubmitting} 
            variant="secondary"
          />
        </BottomContent>
      </InnerScrollView>
    </Container>
  );
}