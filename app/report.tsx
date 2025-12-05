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
import React, { useRef, useEffect } from "react";
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
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Internal imports
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useLocation } from "@/shared/hooks/common/useLocation";
import { useImagePicker } from "@/shared/hooks/common/useImagePicker";
import { useReportForm } from "@/shared/hooks/reports/useReportForm";
import colors from "@theme/colors";
import spacing from "@theme/spacing";
import StyledButton from "@components/common/buttons/StyledButton";
import { ReportHeader } from "@components/features/report-page/ReportHeader";
import { ReportInstructions } from "@components/features/report-page/ReportInstructions";
import { ImagePickerSection } from "@components/features/report-page/ImagePickerSection";
import { ReportFormCard } from "@components/features/report-page/ReportFormCard";

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
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Use custom hooks for separated concerns
  const { location, locationErrorMsg, isLocationLoading, fetchLocation } =
    useLocation();

  const { imageUri, pickImage, handleCancelImage } = useImagePicker();

  const {
    description,
    setDescription,
    showInstructions,
    setShowInstructions,
    isSubmitting,
    handleSubmit,
    isFormReady,
  } = useReportForm();

  // Wrapper functions for report image picking (landscape aspect ratio)
  const pickImageFromCamera = () =>
    pickImage(true, { aspect: [4, 3], quality: 0.5 });
  const pickImageFromLibrary = () =>
    pickImage(false, { aspect: [4, 3], quality: 0.5 });

  // Combined pickImage function for ImagePickerSection interface
  const handlePickImage = (useCamera: boolean) => {
    if (useCamera) {
      pickImageFromCamera();
    } else {
      pickImageFromLibrary();
    }
  };

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
            const safeScrollPosition = Math.max(baseScroll, 400); // Minimum scroll to keep description visible

            scrollViewRef.current.scrollTo({
              y: safeScrollPosition,
              animated: true,
            });
          }
        }, 150);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showInstructions, imageUri]);

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
            onPress={() => handleSubmit(imageUri, location)}
            disabled={!isFormReady(imageUri, location) || isSubmitting}
            loading={isSubmitting}
            loadingText={t("reports.submittingReport")}
            variant="primary"
          />
        </View>
      </View>
    </>
  );
}
