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
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  RefreshControl,
  Keyboard,
} from "react-native";

// External libraries
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Internal imports
import { useAuth } from "../src/context/AuthContext";
import { useTranslation } from "../src/hooks/useTranslation";
import { useLocation } from "../src/hooks/useLocation";
import { useKeyboardScroll } from "../src/hooks/useKeyboardScroll";
import { useAlert } from "../src/hooks/useAlert";
import { useImagePicker } from "../src/hooks/useImagePicker";
import colors from "../src/theme/colors";
import spacing from "../src/theme/spacing";
import {
  createReport,
  uploadReportImage,
} from "../src/components/lib/firebase/reports";
import StyledButton from "../src/components/common/buttons/StyledButton";
import CustomAlert from "../src/components/common/modals/CustomAlert";
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 36,
  },
  topContent: {
    alignItems: "center",
    width: "100%",
  },
  bottomContent: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
  const { isKeyboardVisible } = useKeyboardScroll();
  const { alertVisible, alertConfig, showAlert, hideAlert } = useAlert();
  const { imageUri, pickImage, handleCancelImage } = useImagePicker();

  const [description, setDescription] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  // UI state
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard scroll handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Scroll to make description field visible when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 300, animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

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
                isKeyboardVisible={isKeyboardVisible}
                onPickImage={pickImage}
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
