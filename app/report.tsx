import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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
import MapView, { Marker, Region, MarkerDragStartEndEvent } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useAuth } from '../src/context/AuthContext';
import { createReport, uploadReportImage } from '../src/services/firebase/reports';
import theme from '../src/theme';

// Styled Components
const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${theme.colors.background.primary};
`;

const InnerScrollView = styled(ScrollView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
})`
  flex: 1;
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

const TakePictureButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 20px;
  width: 90%;
  align-items: center;
`;

const ImagePreviewContainer = styled.View`
  width: 90%;
  height: 200px;
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

const ButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: 16px;
  font-weight: bold;
`;

const MainCard = styled.View<{ isKeyboardVisible?: boolean }>`
  flex: ${(props: { isKeyboardVisible?: boolean }) => (props.isKeyboardVisible ? 0 : 1)};
  width: 100%;
  background-color: ${theme.colors.background.secondary};
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
  min-height: ${(props: { isKeyboardVisible?: boolean }) => (props.isKeyboardVisible ? 0 : 250)};
`;

const DescriptionInput = styled.TextInput`
  padding: 15px;
  font-size: 16px;
  color: ${theme.colors.text.primary};
  min-height: 60px; /* Initial height */
`;

const MapContainer = styled.View`
  flex: 1;
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0; /* Placeholder color */
  min-height: ${Dimensions.get('window').height * 0.35}px;
`;

const StyledMapView = styled(MapView)`
  ${StyleSheet.absoluteFillObject}
`;

const MapOverlayButton = styled.TouchableOpacity`
  position: absolute;
  top: 15px;
  align-self: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 20px;
  z-index: 1;
`;

const MapErrorText = styled.Text`
  color: ${theme.colors.error.main};
`;

const BottomContent = styled.View`
  align-items: center;
  width: 100%;
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

const SubmitButton = styled.TouchableOpacity<{ isDisabled: boolean }>`
  background-color: ${(props: { isDisabled: boolean }) => (props.isDisabled ? theme.colors.secondaryLight : theme.colors.primary)};
  width: 90%;
  padding: 16px;
  border-radius: 16px;
  align-items: center;
`;

const SubmitButtonText = styled.Text`
  color: ${theme.colors.white};
  font-size: 18px;
  font-weight: bold;
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
          latitudeDelta: 0.01,
          longitudeDelta: 0.005,
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
    if (!user || !imageUri || !location || !description) {
      Alert.alert('Incomplete Form', 'Please fill all fields, take a picture, and mark the location.');
      return;
    }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkerDragEnd = (event: MarkerDragStartEndEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleCenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.005,
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
    if (mapRegion && location) {
      return (
        <StyledMapView ref={mapRef} initialRegion={mapRegion} showsUserLocation showsMyLocationButton>
          <Marker coordinate={location} draggable onDragEnd={handleMarkerDragEnd} />
        </StyledMapView>
      );
    }
    return <MapErrorText>Initializing map...</MapErrorText>;
  };

  const isFormReady = !!imageUri && !!description.trim() && !!location;

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ title: 'Report a Car' }} />
      <InnerScrollView
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={true}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
      >
        <TopContent>
          <Title>SAVE THE ENVIRONMENT</Title>
          <Subtitle>
            By pointing out abandoned cars in your neighbourhood, you contribute to cleaner and safer surroundings.
          </Subtitle>
          {imageUri ? (
            <ImagePreviewContainer>
              <ImagePreview source={{ uri: imageUri }} />
            </ImagePreviewContainer>
          ) : (
            <TakePictureButton onPress={() => pickImage(true)}>
              <ButtonText>TAKE A PICTURE</ButtonText>
            </TakePictureButton>
          )}
        </TopContent>

        <MainCard isKeyboardVisible={isKeyboardVisible}>
          <DescriptionInput
            placeholder="Description..."
            placeholderTextColor={theme.colors.text.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          {!isKeyboardVisible && (
            <MapContainer>
              {renderMapContent()}
              <MapOverlayButton onPress={handleCenterMap}>
                <ButtonText>CENTER ON LOCATION</ButtonText>
              </MapOverlayButton>
            </MapContainer>
          )}
        </MainCard>

        <BottomContent>
          {!isKeyboardVisible && (
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
          )}
          {!isKeyboardVisible && (
            <SubmitButton onPress={handleSubmit} isDisabled={!isFormReady || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <SubmitButtonText>SUBMIT</SubmitButtonText>
              )}
            </SubmitButton>
          )}
        </BottomContent>
      </InnerScrollView>
    </Container>
  );
}