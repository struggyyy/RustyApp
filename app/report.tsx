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
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Internal imports
import { useAuth } from "../src/core/context/AuthContext";
import { useTranslation } from "../src/shared/hooks/common/useTranslation";
import { useLocation } from "../src/shared/hooks/common/useLocation";
import { useImagePicker } from "../src/shared/hooks/common/useImagePicker";
import { useAlert } from "../src/core/context/AlertContext";
import colors from "../src/core/theme/colors";
import spacing from "../src/core/theme/spacing";
import {
  createReport,
  uploadReportImage,
} from "../src/lib/firebase/reports";
import StyledButton from "../src/components/common/buttons/StyledButton";
import { ReportHeader } from "../src/components/features/report-page/ReportHeader";
import { ReportInstructions } from "../src/components/features/report-page/ReportInstructions";
import { ImagePickerSection } from "../src/components/features/report-page/ImagePickerSection";
import { ReportFormCard } from "../src/components/features/report-page/ReportFormCard";

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    position: "relative" as const, // Needed for absolute positioning of gradient
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.L,
    paddingTop: spacing.L,
    paddingBottom: 36,
  },
  topContent: {
    alignItems: "center",
    width: "100%",
  },
  bottomContent: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.L,
    paddingTop: spacing.M,
    paddingBottom: 0, // Will be controlled via safe area insets below
  },
});

export default function ReportScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Use custom hooks for separated concerns
  const { location, locationErrorMsg, isLocationLoading, fetchLocation } =
    useLocation();

  const { imageUri, pickImage, handleCancelImage } = useImagePicker();

  // Wrapper functions for report image picking (landscape aspect ratio)
  const pickImageFromCamera = () => pickImage(true, { aspect: [4, 3], quality: 0.5 });
  const pickImageFromLibrary = () => pickImage(false, { aspect: [4, 3], quality: 0.5 });

  // Combined pickImage function for ImagePickerSection interface
  const handlePickImage = (useCamera: boolean) => {
    if (useCamera) {
      pickImageFromCamera();
    } else {
      pickImageFromLibrary();
    }
  };

  const { showAlert } = useAlert();

  const [description, setDescription] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard scroll handling - ensure description field is visible
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setTimeout(() => {
          if (scrollViewRef.current) {
            // Dynamic scroll calculation based on content
            let baseScroll = 200; // Base position for header

            // Account for expanded instructions
            if (showInstructions) {
              baseScroll += 180; // Height of expanded instructions
            }

            // Account for image preview
            if (imageUri) {
              baseScroll += 220; // Height of image preview
            }

            // Ensure description field stays above keyboard with buffer
            const keyboardHeight = e.endCoordinates.height;
            const safeScrollPosition = Math.max(baseScroll, 400); // Minimum scroll to keep description visible

            scrollViewRef.current.scrollTo({
              y: safeScrollPosition,
              animated: true
            });
          }
        }, 150); // Slightly longer delay for better accuracy
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showInstructions, imageUri]);

  // Form submission logic
  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (
      !user ||
      !imageUri ||
      !location ||
      !description.trim() ||
      description.trim().length < 5 ||
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
        userEmail: user.email || "Unknown User",
        imageUrl,
        description,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
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
    !!imageUri &&
    !!description.trim() &&
    description.trim().length >= 5 &&
    description.trim().length <= 150;

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("reports.reportVehicle") }} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            showsVerticalScrollIndicator={false}
            fadingEdgeLength={15}
            refreshControl={
              <RefreshControl
                refreshing={isLocationLoading}
                onRefresh={() => fetchLocation(true)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <View style={styles.topContent}>
              <ReportHeader />

              <ReportInstructions
                showInstructions={showInstructions}
                onToggleInstructions={() => setShowInstructions((v) => !v)}
              />

              <ImagePickerSection
                imageUri={imageUri}
                onPickImage={handlePickImage}
                onRemoveImage={handleCancelImage}
              />

              <ReportFormCard
                description={description}
                onDescriptionChange={setDescription}
                location={
                  location
                    ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                      }
                    : null
                }
                locationErrorMsg={locationErrorMsg}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View
          style={[
            styles.bottomContent,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <StyledButton
            title={t("common.submit")}
            onPress={handleSubmit}
            disabled={!isFormReady || isSubmitting}
            loading={isSubmitting}
            variant="primary"
          />
        </View>
      </View>

    </>
  );
}
