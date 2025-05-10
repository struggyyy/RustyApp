import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; // For icons
import styled from 'styled-components/native';

const { width, height } = Dimensions.get('window');

// Styled Components
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: '#FFFFFF',
});

const StyledScrollView = styled(ScrollView)({
  flex: 1,
});

// For ScrollView's contentContainerStyle
const scrollViewContentStyle = {
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: 15, 
  paddingBottom: 20,
};

const GroupContainer = styled.View({
  width: '100%',
  alignItems: 'center',
});

const TopGroupContainer = styled(GroupContainer)({
  marginBottom: 10,
});

const BottomGroupContainer = styled(GroupContainer)({
  marginTop: 20,
});

const TitleText = styled.Text({
  fontSize: 20,
  fontWeight: 'bold',
  color: '#4A4A4A',
  textAlign: 'center',
  marginBottom: 6,
});

const SubtitleText = styled.Text({
  fontSize: 13,
  color: '#666',
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 18,
  width: '95%',
});

interface ButtonProps {
  variant?: 'takePicture' | 'markLocation' | 'submit';
  isDisabled?: boolean;
}

const BaseButton = styled.TouchableOpacity<ButtonProps>((props: ButtonProps) => ({
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 25,
  alignItems: 'center',
  justifyContent: 'center',
  width: props.variant === 'submit' ? '95%' : '85%',
  marginBottom: 15,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,
  elevation: 4,
  backgroundColor: 
    props.isDisabled ? '#cccccc' : 
    props.variant === 'takePicture' ? '#BD5151' :
    props.variant === 'markLocation' ? 'rgba(80, 80, 80, 0.8)' :
    props.variant === 'submit' ? '#B0B0B0' : '#BD5151', // Default for base button if used directly
  // Specific for markLocationButton
  ...(props.variant === 'markLocation' && {
    position: 'absolute', 
    alignSelf: 'center',
    top: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 18,
    zIndex: 10, 
    width: 'auto', // Override width for markLocation
  }),
  // Specific for submitButton
  ...(props.variant === 'submit' && {
    marginBottom: 80, // submitButton specific
  }),
}));

const ButtonText = styled.Text((props: {isSubmitText?: boolean}) => ({
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: 'bold',
  // submitButtonText specific, though color is the same, font size may differ if needed
  // For now, it's identical to base ButtonText
}));

const ImagePreview = styled.Image({
  width: '95%',
  aspectRatio: 16/9,
  borderRadius: 10,
  marginBottom: 15,
  backgroundColor: '#E0E0E0',
});

const InputMapContainer = styled.View({
  width: '95%',
  minHeight: height * 0.4,
  maxHeight: height * 0.6,
  backgroundColor: '#F0F0F0',
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  overflow: 'hidden', 
  flexDirection: 'column', 
  alignSelf: 'center',
});

const DescriptionInput = styled.TextInput({
  paddingHorizontal: 12, 
  paddingTop: 8, 
  paddingBottom: 8, 
  width: '100%',
  minHeight: 50, 
  maxHeight: height * 0.3,
  fontSize: 14, 
  textAlignVertical: 'top',
  color: '#333',
});

const MapViewContainer = styled.View({
  width: '100%', 
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 100,
  borderRadius: 15, 
  overflow: 'hidden',
  position: 'relative',
});

const StyledMapView = styled(MapView)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

const MapErrorText = styled.Text({
  color: '#888',
  textAlign: 'center',
  padding: 10,
  fontSize: 12,
});

const IconRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '70%',
  marginBottom: 15,
});

const IconButton = styled.TouchableOpacity({
  backgroundColor: '#E9E9E9',
  padding: 10,
  borderRadius: 25, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 1.00,
  elevation: 2,
});

export default function ReportScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | null>(null); // Placeholder for taken picture
  const [isSubmitting, setIsSubmitting] = useState(false); // Placeholder for submission state

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
        setIsLocationLoading(true);
        setLocationErrorMsg(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }
            let currentLocation = await Location.getLastKnownPositionAsync({}); 
            if (!currentLocation) {
                console.log("Fetching current position...");
                currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            }

            if (isMounted && currentLocation) {
              setLocation(currentLocation);
              const initialRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.01, 
                longitudeDelta: 0.005,
              };
              setMapRegion(initialRegion);
            } else if (!currentLocation) {
                 throw new Error('Failed to get location');
            }
        } catch (error: any) {
             console.error("Location Error:", error.message);
             if (isMounted) {
                 setLocationErrorMsg(error.message || 'Failed to get location');
                 setLocation(null); 
             }
        } finally {
            if (isMounted) setIsLocationLoading(false);
        }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleTakePicture = () => {
    console.log('Take Picture pressed');
  };

  const handleMarkLocation = () => {
    console.log('Mark Location pressed');
    if (location) {
       if (mapRef.current && mapRegion) {
         mapRef.current.animateToRegion(mapRegion, 500);
       }
    } else {
      console.log('Location not available yet');
    }
  };

  const handleSelectImage = () => {
    console.log('Select Image pressed');
  };

  const handleSubmit = () => {
    console.log('Submit pressed');
    console.log('Submitting Report:', { description, location: location?.coords, imageUri });
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500); 
  };

   const renderMapContent = () => {
    if (isLocationLoading) {
        return <ActivityIndicator size="large" color="#666" />;
    }
    if (locationErrorMsg) {
        return <MapErrorText>{locationErrorMsg}</MapErrorText>;
    }
    if (mapRegion) {
        return (
            <StyledMapView
                ref={mapRef}
                initialRegion={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                scrollEnabled={true}
                zoomEnabled={true}
            >
                 {/* <Marker coordinate={mapRegion} pinColor="#BD5151" title="Selected Location"/> */}
            </StyledMapView>
        );
    }
    return <MapErrorText>Map initializing...</MapErrorText>;
  };

  return (
    <StyledKeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} 
    >
      <Stack.Screen options={{ title: 'Report a Car', presentation: 'modal' }} />
      
      <StyledScrollView 
        contentContainerStyle={scrollViewContentStyle}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        <TopGroupContainer>
            <TitleText>SAVE THE ENVIRONMENT</TitleText>
            <SubtitleText>
              By pointing out abandoned cars in your neighbourhood, you contribute to cleaner and safer surroundings.
            </SubtitleText>

            <BaseButton 
              variant="takePicture"
              onPress={handleTakePicture}
            >
              <ButtonText>TAKE A PICTURE</ButtonText>
            </BaseButton>

            {imageUri && (
                <ImagePreview source={{ uri: imageUri }} resizeMode="cover"/>
            )}
        </TopGroupContainer>

        <InputMapContainer>
            <DescriptionInput
              placeholder="Description..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <MapViewContainer>
              {renderMapContent()}
              <BaseButton 
                variant="markLocation"
                onPress={handleMarkLocation}
                disabled={isLocationLoading || !location}
              >
                <ButtonText>MARK LOCATION</ButtonText>
              </BaseButton>
            </MapViewContainer>
        </InputMapContainer>

        <BottomGroupContainer>
            <IconRow>
              <IconButton onPress={handleTakePicture}>
                <Ionicons name="camera-outline" size={24} color="#555" />
              </IconButton>
              <IconButton onPress={handleMarkLocation}>
                <Ionicons name="location-outline" size={24} color="#555" />
              </IconButton>
              <IconButton onPress={handleSelectImage}>
                <Ionicons name="images-outline" size={24} color="#555" />
              </IconButton>
            </IconRow>

            <BaseButton 
              variant="submit"
              onPress={handleSubmit}
              disabled={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                 <ActivityIndicator color="#FFFFFF" />
              ) : (
                 <ButtonText isSubmitText>SUBMIT</ButtonText>
              )}
            </BaseButton>
         </BottomGroupContainer>

      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
} 