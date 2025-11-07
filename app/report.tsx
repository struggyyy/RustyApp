import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "../src/hooks/useTranslation";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";
import { useAuth } from "../src/context/AuthContext";
import {
  createReport,
  uploadReportImage,
} from "../src/components/lib/firebase/reports";
import theme from "../src/theme";
import StyledButton from "../src/components/common/buttons/StyledButton";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import TouchableButton from "../src/components/common/buttons/TouchableButton";
import FloatingActionButton from "../src/components/common/buttons/FloatingActionButton";
import { useHaptics } from "../src/context/HapticsContext";
import * as Haptics from "expo-haptics";

// Shadow styles using StyleSheet to avoid styled-components issues
const shadowStyles = StyleSheet.create({
  shadowSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
});

const Container = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: theme.colors.background.primary,
});

const InnerScrollView = styled(ScrollView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },
  keyboardShouldPersistTaps: "handled",
  alwaysBounceVertical: true,
  showsVerticalScrollIndicator: false,
})({
  width: '100%',
});

const TopContent = styled.View({
  alignItems: 'center',
  width: '100%',
});

const Title = styled.Text({
  fontSize: 22,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
  textAlign: 'center',
  marginBottom: 8,
});

const Subtitle = styled.Text({
  fontSize: 14,
  color: theme.colors.text.secondary,
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: '20px',
});

const ImagePreviewContainer = styled.View({
  width: '100%',
  aspectRatio: 1.34,
  marginBottom: 20,
  borderRadius: 16,
  backgroundColor: theme.colors.background.secondary,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

const ImagePreview = styled.Image({
  width: '100%',
  height: '100%',
});

const ImageOverlayActions = styled.View({
  position: 'absolute',
  top: 10,
  right: 10,
  flexDirection: 'row',
  zIndex: 10,
});

const ImageActionButton = styled.TouchableOpacity({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 20,
  padding: 8,
  marginLeft: 10,
});

const MainCard = styled.View({
  width: '100%',
  backgroundColor: theme.colors.background.secondary,
  borderRadius: 24,
  overflow: 'hidden',
});

const DescriptionInput = styled.TextInput({
  padding: 15,
  fontSize: 16,
  color: theme.colors.text.primary,
  textAlignVertical: 'top',
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

const MapContainer = styled.View({
  height: 300,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#e0e0e0',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden',
});

const StyledMapView = styled(MapView)(StyleSheet.absoluteFillObject);

const MapErrorText = styled.Text({
  color: theme.colors.error.main,
});

const BottomContent = styled.View({
  alignItems: 'center',
  width: '100%',
  marginTop: 20,
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

const IconBar = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '60%',
  marginBottom: 20,
});

const SelectImageButton = styled.TouchableOpacity({
  backgroundColor: theme.colors.secondaryLight,
  width: 60,
  height: 60,
  borderRadius: 30,
  alignItems: "center",
  justifyContent: "center",
});

const ButtonRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 20,
});

export default function ReportScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const haptics = useHaptics();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const isSubmittingRef = useRef(false);
  const mapRef = useRef<MapView>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  }>({ title: '', buttons: [] });

  const showAlert = (title: string, message?: string, buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [{ text: t('common.ok') }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLocationErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(t('map.locationPermissionRequired'));
      }
      let currentLocation = await Location.getLastKnownPositionAsync({});
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (currentLocation) {
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setLocation(coords);
        setMapRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        });
      }
    } catch (error: any) {
      setLocationErrorMsg(error.message || t('map.locationError'));
      showAlert(
        t('common.error'),
        error.message || t('map.locationPermissionRequired')
      );
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
    const action = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await action({
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

    if (
      !user ||
      !imageUri ||
      !location ||
      !description.trim() ||
      description.trim().length > 150
    ) {
      showAlert(
        t('common.error'),
        t('reports.descriptionRequired')
      );
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

      showAlert(t('common.success'), t('reports.reportSubmittedSuccess'), [
        { text: t('common.ok'), onPress: () => router.replace("/my-reports") },
      ]);
    } catch (error) {
      console.error("Report submission error:", error);
      showAlert(t('common.error'), t('reports.deleteReportError'));
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
    return <MapErrorText>{t('common.loading')}</MapErrorText>;
  };

  const isFormReady =
    !!imageUri &&
    !!description.trim() &&
    description.trim().length <= 150 &&
    !!location;

  return (
    <>
      <Container behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Stack.Screen options={{ title: t('reports.reportVehicle') }} />
        <InnerScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          <TopContent>
            <Title>{t('reports.newReport')}</Title>
            <Subtitle>
              {t('reports.descriptionPlaceholder')}
            </Subtitle>
            {imageUri ? (
              !isKeyboardVisible && (
                <ImagePreviewContainer>
                  <ImagePreview source={{ uri: imageUri }} />
                  <ImageOverlayActions>
                    {/* Select other image from the phone (currently disabled)
                <TouchableButton
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 20,
                    padding: 8,
                    marginLeft: 10,
                  }}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="create-outline" size={24} color="white" />
                </TouchableButton> */}
                    <TouchableButton
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 20,
                        padding: 8,
                        marginLeft: 10,
                      }}
                      onPress={handleCancelImage}
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableButton>
                  </ImageOverlayActions>
                </ImagePreviewContainer>
              )
            ) : (
              <ButtonRow>
                <StyledButton
                  title={t('reports.takePhoto')}
                  onPress={() => pickImage(true)}
                  variant="secondary"
                  style={{ flex: 1, marginRight: 10, marginBottom: 0 }}
                />
                <TouchableButton
                  style={{
                    backgroundColor: theme.colors.secondaryLight,
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    ...shadowStyles.shadowMedium,
                  }}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons
                    name="image-outline"
                    size={24}
                    color={theme.colors.text.primary}
                  />
                </TouchableButton>
              </ButtonRow>
            )}
          </TopContent>

          <MainCard>
            <InsetShadowGradientView
              colors={["rgba(0,0,0,0.15)", "transparent"]}
              pointerEvents="none"
            />
            <DescriptionInput
              placeholder={t('reports.vehicleDescription')}
              placeholderTextColor={theme.colors.text.secondary}
              value={description}
              onChangeText={setDescription}
              onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
              multiline
              maxLength={150}
            />

            <MapContainer>
              {renderMapContent()}
              <FloatingActionButton
                onPress={handleCenterMap}
                style={{ position: "absolute", bottom: 20, right: 20 }}
              >
                <MaterialIcons
                  name="my-location"
                  size={24}
                  color={theme.colors.primary}
                />
              </FloatingActionButton>
            </MapContainer>
          </MainCard>

          <BottomContent>
            <StyledButton
              title={t('common.submit')}
              onPress={handleSubmit}
              disabled={!isFormReady || isSubmitting}
              loading={isSubmitting}
              variant="primary"
            />
          </BottomContent>
        </InnerScrollView>
      </Container>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
}
