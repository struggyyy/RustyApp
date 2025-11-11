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
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  RefreshControl,
  Keyboard,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import styled from "styled-components/native";

// Internal imports
import { useAuth } from "../src/context/AuthContext";
import { useTranslation } from "../src/hooks/useTranslation";
import colors from "../src/theme/colors";
import spacing from "../src/theme/spacing";
import {
  createReport,
  uploadReportImage,
} from "../src/components/lib/firebase/reports";
import StyledButton from "../src/components/common/buttons/StyledButton";
import CustomAlert from "../src/components/common/modals/CustomAlert";
import { ImagePickerSection } from "../src/components/features/report-page/ImagePickerSection";
import { ReportFormCard } from "../src/components/features/report-page/ReportFormCard";

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
  backgroundColor: colors.background.primary,
});

const InnerScrollView = styled(ScrollView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  keyboardShouldPersistTaps: "handled",
  alwaysBounceVertical: true,
  showsVerticalScrollIndicator: false,
})({
  width: "100%",
});

const TopContent = styled.View({
  alignItems: "center",
  width: "100%",
});

const Title = styled.Text({
  fontSize: 22,
  fontWeight: "bold",
  color: colors.text.primary,
  textAlign: "center",
  marginBottom: spacing.xs,
});

const Subtitle = styled.Text({
  fontSize: 14,
  color: colors.text.secondary,
  textAlign: "center",
  marginBottom: spacing.lg,
  lineHeight: "20px",
});

const BottomContent = styled.View({
  alignItems: "center",
  width: "100%",
  marginTop: spacing.lg,
});

export default function ReportScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // UI state
  const isSubmittingRef = useRef(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({ title: "", buttons: [] });

  const showAlert = (
    title: string,
    message?: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }> = [{ text: t("common.ok") }]
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  // Keyboard visibility handling
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

  // Location fetching logic
  const getCurrentLocation = useCallback(async () => {
    setLocationErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(t("map.locationPermissionRequired"));
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
      }
    } catch (error: any) {
      setLocationErrorMsg(error.message || t("map.locationError"));
      showAlert(
        t("common.error"),
        error.message || t("map.locationPermissionRequired")
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

  // Image handling functions
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

  // Form submission logic
  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (
      !user ||
      !imageUri ||
      !location ||
      !description.trim() ||
      description.trim().length > 150
    ) {
      showAlert(t("common.error"), t("reports.descriptionRequired"));
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const reportId = `report_${Date.now()}`;
      const imageUrl = await uploadReportImage(imageUri, user.uid, reportId);

      await createReport({
        userId: user.uid,
        userEmail: user.email || 'Unknown User',
        imageUrl,
        description,
        location,
      });

      showAlert(t("common.success"), t("reports.reportSubmittedSuccess"), [
        { text: t("common.ok"), onPress: () => router.replace("/my-reports") },
      ]);
    } catch (error) {
      console.error("Report submission error:", error);
      showAlert(t("common.error"), t("reports.deleteReportError"));
      // On failure, release the lock and reset the button to allow another attempt.
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Form validation
  const isFormReady =
    !!imageUri && !!description.trim() && description.trim().length <= 150;

  return (
    <>
      <Container behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Stack.Screen options={{ title: t("reports.reportVehicle") }} />
        <InnerScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <TopContent>
            <Title>{t("reports.newReport")}</Title>
            <Subtitle>{t("reports.descriptionPlaceholder")}</Subtitle>
            <ImagePickerSection
              imageUri={imageUri}
              isKeyboardVisible={isKeyboardVisible}
              onPickImage={pickImage}
              onRemoveImage={handleCancelImage}
            />
          </TopContent>

          <ReportFormCard
            description={description}
            onDescriptionChange={setDescription}
            location={location}
            locationErrorMsg={locationErrorMsg}
          />

          <BottomContent>
            <StyledButton
              title={t("common.submit")}
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
